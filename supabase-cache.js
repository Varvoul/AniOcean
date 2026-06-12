/**
 * aniocean — supabase-cache.js
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW IT WORKS:
 *  1. Every 15 minutes the site fetches fresh data from Jikan / TMDB / Anikoto.
 *  2. That data is written to `media_cache` (upsert) with a `fetched_at` stamp.
 *  3. `media_cache` is also mirrored into the `shows` table (upsert by media_id)
 *     so user features (bookmarks, history, ratings) can reference it.
 *  4. Between refresh cycles, ALL section loaders read from `shows` first.
 *     If `shows` has data → render immediately, then refresh in background.
 *     If `shows` is empty (first visit ever) → fall through to live API calls.
 *
 * LOAD ORDER (in every HTML page, before </body>):
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="shared.js"></script>       ← sets window.supabaseClient
 *   <script src="supabase-cache.js"></script>
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────────────────────

  /** Refresh interval in milliseconds (15 minutes) */
  const REFRESH_MS = 15 * 60 * 1000;

  /** localStorage key that stores last-fetch timestamp */
  const TS_KEY = 'aniocean_cache_ts';

  // ── SUPABASE CLIENT ─────────────────────────────────────────────────────────
  // Re-use the client that shared.js already created — no duplicate connection.
  // shared.js sets window.supabaseClient synchronously at parse time, so it is
  // always available by the time this IIFE runs.
  const supa = window.supabaseClient || null;

  if (!supa) {
    console.warn('[AniCache] window.supabaseClient not found — ensure shared.js loads before supabase-cache.js. Caching disabled.');
    return;
  }

  console.log('[AniCache] Using shared Supabase client ✓');

  // ── HELPERS ─────────────────────────────────────────────────────────────────

  function now() { return Date.now(); }

  function needsRefresh() {
    const ts = parseInt(localStorage.getItem(TS_KEY) || '0', 10);
    return now() - ts > REFRESH_MS;
  }

  function stampRefresh() {
    localStorage.setItem(TS_KEY, String(now()));
  }

  /**
   * Build a canonical media_id string, e.g. "jikan-11757" or "tmdb-tv-124364"
   * Accepts the raw show objects produced by loadHero / loadTopAiring etc.
   */
  function resolveMediaId(raw) {
    if (raw.media_id) return raw.media_id;
    const id = raw.id || '';
    if (id.startsWith('jikan-'))
      return id.replace(/^jikan-(?:air|up|comp|tr|pop)-?/, 'jikan-');
    if (id.startsWith('tmdb-movie-') || id.startsWith('tmdb-mv-'))
      return 'tmdb-movie-' + id.replace(/^tmdb-(?:movie|mv)-/, '');
    if (id.startsWith('tmdb-tv-') || id.startsWith('tmdb-comp-') || id.startsWith('tmdb-tr-') || id.startsWith('tmdb-up-'))
      return 'tmdb-tv-' + id.replace(/^tmdb-(?:tv|comp|tr|up)-/, '');
    return id;
  }

  function mediaType(raw) {
    const t = (raw.type || raw.media_type || '').toLowerCase();
    if (t === 'anime') return 'anime';
    if (t === 'movie') return 'movie';
    return 'tv';
  }

  /**
   * Convert a raw show object (from Jikan/TMDB fetch helpers) to a flat row
   * suitable for both `media_cache` and `shows`.
   */
  function toRow(raw) {
    const mid = resolveMediaId(raw);
    const mt  = mediaType(raw);
    const isAnime = mt === 'anime';

    // Extract numeric IDs
    let mal_id = null, tmdb_id = null;
    if (isAnime) {
      const m = mid.match(/^jikan-(\d+)/);
      if (m) mal_id = m[1];
    } else {
      const m = mid.match(/(?:tmdb-(?:movie|tv)-)(\d+)/);
      if (m) tmdb_id = m[1];
    }

    return {
      media_id:    mid,
      show_id:     mid,
      media_type:  mt,
      mal_id:      raw.mal_id   ? String(raw.mal_id)   : mal_id,
      tmdb_id:     raw.tmdb_id  ? String(raw.tmdb_id)  : tmdb_id,
      ani_id:      raw.ani_id   ? String(raw.ani_id)   : null,
      aniko_id:    raw.aniko_id ? String(raw.aniko_id) : null,

      // Titles
      eng_title:       raw.title          || raw.eng_title       || null,
      default_title:   raw.title          || raw.default_title   || null,
      original_title:  raw.original_title || null,
      romanji_title:   raw.romanji_title  || null,
      japanese_title:  raw.japanese_title || null,
      synonyms:        Array.isArray(raw.synonyms) ? raw.synonyms.join(', ') : raw.synonyms || null,

      // Description
      synopsis: raw.synopsis || null,
      overview: raw.overview || null,

      // Metadata
      labels:             Array.isArray(raw.labels) ? raw.labels.join(', ') : raw.labels || null,
      country_name:       raw.country_name || null,
      genres:             Array.isArray(raw.genres) ? raw.genres.join(', ') : raw.genres || null,
      aired_date:         raw.aired_date   || raw.releaseDate || null,
      broadcast_day_time: raw.broadcast_day_time || raw.broadcast || null,
      source:             raw.source     || null,
      rank:               raw.rank       ? parseInt(raw.rank, 10)       : null,
      popularity:         raw.popularity ? parseInt(raw.popularity, 10) : raw.members ? parseInt(raw.members, 10) : null,

      // Production
      studio_name:    Array.isArray(raw.studios)   ? raw.studios.join(', ')   : raw.studio_name   || raw.studio    || null,
      producers_name: Array.isArray(raw.producers) ? raw.producers.join(', ') : raw.producers_name || null,

      // Season
      season_eng_title: raw.season_eng_title || null,
      season_slug:      raw.season_slug      || null,
      season_badge:     raw.season_badge     || null,
      season_num:       raw.season_num       ? parseInt(raw.season_num, 10) : null,
      season_backdrop_landscape_image_link: raw.season_backdrop_landscape_image_link || null,

      // Episodes
      total_episodes: raw.total_epi_num || raw.total_episodes || raw.episodes_count || null,
      dub_epi:  raw.dub_epi  ? parseInt(raw.dub_epi, 10)  : null,
      sub_epi:  raw.sub_epi  ? parseInt(raw.sub_epi, 10)  : null,
      is_sub:   raw.is_sub   != null ? parseInt(raw.is_sub, 10)  : (raw.sub_epi ? 1 : 0),
      is_dub:   raw.is_dub   != null ? parseInt(raw.is_dub, 10)  : (raw.dub_epi ? 1 : 0),

      // Skip times (seconds)
      intro_skip_start: raw.intro_skip_start || null,
      intro_skip_end:   raw.intro_skip_end   || null,
      outro_skip_start: raw.outro_skip_start || null,
      outro_skip_end:   raw.outro_skip_end   || null,

      // Format & rating
      format:                raw.format              || null,
      mal_score:             raw.mal_score            || (raw.type === 'Anime' ? parseFloat(raw.score) || null : null),
      tmdb_average_score:    raw.tmdb_average_score   || (raw.type !== 'Anime' ? parseFloat(raw.score) || null : null),
      content_rating:        raw.content_rating       || raw.certification || raw.rating || null,
      anime_duration_time:   raw.anime_duration_time  || (isAnime  ? raw.duration || null : null),
      tmdb_movie_tv_runtime: raw.tmdb_movie_tv_runtime || (!isAnime ? raw.duration || null : null),
      rating_score:          parseFloat(raw.score)    || null,
      release_year:          raw.release_year
                               || (raw.releaseDate ? parseInt(raw.releaseDate.slice(0, 4), 10) : null)
                               || (raw.year        ? parseInt(raw.year, 10)                    : null),

      // Images
      show_poster_link:                    raw.show_poster_link                    || raw.poster   || null,
      show_backdrop_landscape_image_link:  raw.show_backdrop_landscape_image_link  || raw.backdrop || null,
      poster_path:   raw.poster   || null,
      backdrop_path: raw.backdrop || null,

      // Links
      external_link:      raw.external_link      || raw.url     || null,
      trailer_video_link: raw.trailer_video_link  || raw.trailer || null,
    };
  }

  // ── UPSERT BATCH ────────────────────────────────────────────────────────────

  /**
   * Write a batch of raw show objects to media_cache + shows.
   * Fire-and-forget (does not block the UI).
   */
  async function cacheBatch(items) {
    if (!items || !items.length) return;

    const rows = items.map(r => ({
      ...toRow(r),
      fetched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // --- media_cache upsert ---
    const { error: cacheErr } = await supa
      .from('media_cache')
      .upsert(rows, { onConflict: 'media_id', ignoreDuplicates: false });
    if (cacheErr) console.warn('[AniCache] media_cache upsert error:', cacheErr.message);

    // --- shows upsert (mirror) ---
    // Remove media_cache-only columns before writing to shows
    const showRows = rows.map(r => {
      const { fetched_at, poster_path, backdrop_path, rating_score, ...rest } = r;
      return rest;
    });
    const { error: showErr } = await supa
      .from('shows')
      .upsert(showRows, { onConflict: 'media_id', ignoreDuplicates: false });
    if (showErr) console.warn('[AniCache] shows upsert error:', showErr.message);
  }

  // ── READ FROM shows TABLE ────────────────────────────────────────────────────

  /**
   * Query the shows table and return an array of show objects in the same
   * shape that the render functions in index.html expect.
   *
   * @param {object} opts  e.g. { media_type: 'anime', section: 'trending', limit: 20 }
   * @returns {Promise<Array>}
   */
  async function fetchFromShows({ media_type, limit = 30, order = 'popularity', section } = {}) {
    let q = supa.from('shows').select('*');

    if (media_type) {
      const types = media_type.split(',').map(t => t.trim());
      if (types.length === 1) {
        q = q.eq('media_type', types[0]);
      } else {
        q = q.in('media_type', types);
      }
    }

    // Section-specific ordering / filtering
    if (section === 'trending') {
      q = q.order('popularity', { ascending: false });
    } else if (section === 'top_airing') {
      q = q.not('aired_date', 'is', null).order('mal_score', { ascending: false });
    } else if (section === 'new_releases') {
      q = q.order('release_year', { ascending: false });
    } else if (section === 'upcoming') {
      q = q.is('aired_date', null).order('added_at', { ascending: false });
    } else if (section === 'popular') {
      q = q.order('popularity', { ascending: false });
    } else {
      q = q.order(order, { ascending: false });
    }

    q = q.limit(limit);

    const { data, error } = await q;
    if (error) { console.warn('[AniCache] fetchFromShows error:', error.message); return []; }

    // Normalise back to the shape index.html render functions expect
    return (data || []).map(r => ({
      id:            r.media_id,
      media_id:      r.media_id,
      title:         r.eng_title || r.default_title,
      type:          r.media_type === 'anime' ? 'Anime' : r.media_type === 'movie' ? 'Movie' : 'TV',
      poster:        r.show_poster_link || r.poster_path,
      backdrop:      r.show_backdrop_landscape_image_link || r.backdrop_path,
      score:         (r.mal_score || r.tmdb_average_score || r.rating_score || 0).toFixed(1),
      year:          String(r.release_year || ''),
      genres:        r.genres ? r.genres.split(',').map(g => g.trim()) : [],
      synopsis:      r.synopsis || r.overview || '',
      overview:      r.overview || r.synopsis || '',
      duration:      r.anime_duration_time || r.tmdb_movie_tv_runtime || '?',
      certification: r.content_rating || 'PG-13',
      studio:        r.studio_name,
      mal_id:        r.mal_id,
      tmdb_id:       r.tmdb_id,
      episodes:      r.total_episodes,
      status:        r.format || 'Airing',
      quality:       'HD',
      details:       r.tmdb_movie_tv_runtime || '1h 45m',
      cert:          r.content_rating || 'PG-13',
      releaseDate:   r.aired_date || '',
      original_title: r.original_title,
    }));
  }

  // ── PUBLIC API ───────────────────────────────────────────────────────────────

  /**
   * Save raw show objects to both media_cache and shows tables.
   *   window.AniCache.save(items)
   */
  async function save(items) {
    if (!Array.isArray(items)) items = [items];
    await cacheBatch(items.filter(Boolean));
  }

  /**
   * Read shows from the Supabase shows table.
   *   const cached = await window.AniCache.get({ section: 'trending', limit: 20 });
   */
  async function get(opts) {
    return fetchFromShows(opts);
  }

  /**
   * 15-minute refresh gate helper.
   * Pass your live-fetch function; it only runs when the cache is stale.
   *   window.AniCache.autoRefresh(myRefreshFn);
   */
  async function autoRefresh(refreshFn) {
    if (needsRefresh()) {
      console.log('[AniCache] Cache stale — refreshing from APIs…');
      try {
        await refreshFn();
        stampRefresh();
        console.log('[AniCache] Cache refreshed ✓');
      } catch (e) {
        console.warn('[AniCache] Refresh failed:', e);
      }
    } else {
      const remaining = Math.round(
        (REFRESH_MS - (now() - parseInt(localStorage.getItem(TS_KEY) || '0', 10))) / 1000 / 60
      );
      console.log(`[AniCache] Cache fresh — next refresh in ~${remaining} min`);
    }
  }

  // ── UTILITY: build info URL ──────────────────────────────────────────────────
  function buildInfoUrl(s) {
    const id   = s.id || s.media_id || '';
    const slug = (s.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (id.startsWith('jikan-'))      return `/info/anime/${id}/${slug}`;
    if (id.startsWith('tmdb-movie-')) return `/info/movie/${id}/${slug}`;
    if (id.startsWith('tmdb-tv-'))    return `/info/tv/${id}/${slug}`;
    return `/info/${id}/${slug}`;
  }

  // Expose globally
  window.AniCache = { save, get, autoRefresh, needsRefresh, stampRefresh, buildInfoUrl };

  // ── AUTO-INTEGRATION PATCH FOR index.html ───────────────────────────────────
  // Monkey-patches the load/render functions defined in the inline <script> of
  // index.html so that:
  //   a) Before each live fetch, we try to serve from the shows table first.
  //   b) After each live fetch, results are saved back to Supabase.
  //
  // Uses DOMContentLoaded + setTimeout(0) so the inline script has already run
  // and defined its functions by the time we wrap them.

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(patchIndexFunctions, 0);
  });

  function patchIndexFunctions() {

    // ── Generic cache-first wrapper ──────────────────────────────────────────
    // Tries the shows table first; falls back to the original live-fetch fn.
    // If cache hits and cache is stale, also fires live fetch in the background.
    function wrapCacheFirst(fnName, getOpts, renderFn) {
      const origLoad = window[fnName];
      if (typeof origLoad !== 'function') return;
      window[fnName] = async function (...args) {
        try {
          const cached = await get(getOpts);
          if (cached.length) {
            renderFn(cached);
            if (needsRefresh()) origLoad.apply(this, args).catch(() => {});
            return;
          }
        } catch (e) {
          console.warn(`[AniCache] cache-first read error in ${fnName}:`, e);
        }
        return origLoad.apply(this, args);
      };
    }

    // ── HERO ────────────────────────────────────────────────────────────────
    // heroData is a scoped var inside index.html's IIFE so we can't set it
    // directly. We always let the original loadHero run (it's fast enough)
    // and save results afterwards to warm the cache.
    const origLoadHero = window.loadHero;
    if (typeof origLoadHero === 'function') {
      window.loadHero = async function () {
        return origLoadHero.apply(this, arguments).then(async () => {
          // heroData is scoped inside index.html — grab via the rendered slides
          // instead, or save via the trendingData/popularData timeout below.
          // Nothing to do here; hero data is also captured via New Releases save.
        }).catch(() => {});
      };
    }

    // ── TOP AIRING ──────────────────────────────────────────────────────────
    // Cache-first, then save live results through renderTopAiring hook below.
    wrapCacheFirst(
      'loadTopAiring',
      { limit: 60, section: 'top_airing' },
      (items) => { if (typeof window.renderTopAiring === 'function') window.renderTopAiring(items); }
    );

    // ── NEW RELEASES ────────────────────────────────────────────────────────
    const origNewReleases = window.loadNewReleases;
    if (typeof origNewReleases === 'function') {
      window.loadNewReleases = async function () {
        const cached = await get({ limit: 30, section: 'new_releases' }).catch(() => []);
        if (cached.length) {
          const anime  = cached.filter(s => s.type === 'Anime').slice(0, 10);
          const movies = cached.filter(s => s.type === 'Movie').slice(0, 10);
          const tv     = cached.filter(s => s.type === 'TV').slice(0, 10);
          if (window.allReleases !== undefined) {
            window.allReleases = { all: cached.slice(0, 30), anime, movie: movies, tv };
          }
          if (typeof window.renderNewReleases === 'function') window.renderNewReleases('all');
          if (needsRefresh()) origNewReleases.apply(this, arguments).catch(() => {});
          return;
        }
        return origNewReleases.apply(this, arguments);
      };
    }

    // ── TRENDING ────────────────────────────────────────────────────────────
    const origTrending = window.loadTrending;
    if (typeof origTrending === 'function') {
      window.loadTrending = async function (period) {
        // Only use cache for the default 'today' period
        if (!period || period === 'today') {
          const cached = await get({ limit: 20, section: 'trending' }).catch(() => []);
          if (cached.length) {
            cached.forEach((s, i) => s.rank = i + 1);
            if (window.trendingData !== undefined) window.trendingData = cached;
            const list = document.getElementById('trendingList');
            if (list) {
              list.innerHTML = cached.map(s => `
                <a href="${buildInfoUrl(s)}" class="sidebar-list-item"
                   onmouseenter="showPopup(event,'${s.id}')"
                   onmouseleave="window.popupTimer=setTimeout(hidePopup,500)">
                  <span class="sidebar-rank">${s.rank}</span>
                  <img class="sidebar-poster" src="${s.poster || ''}" onerror="this.style.display='none'">
                  <div class="sidebar-info">
                    <h4>${s.title || ''}</h4>
                    <div class="side-meta"><i class="fas fa-star"></i> ${s.score} · ${s.type}</div>
                  </div>
                </a>`).join('');
            }
            if (needsRefresh()) origTrending.apply(this, [period]).catch(() => {});
            return;
          }
        }
        return origTrending.apply(this, [period]);
      };
    }

    // ── POPULAR ─────────────────────────────────────────────────────────────
    const origPopular = window.loadPopular;
    if (typeof origPopular === 'function') {
      window.loadPopular = async function () {
        const cached = await get({ limit: 13, section: 'popular' }).catch(() => []);
        if (cached.length) {
          cached.forEach((s, i) => { s.rank = i + 1; s.members = s.popularity || 0; });
          if (window.popularData !== undefined) window.popularData = cached;
          const list = document.getElementById('popularList');
          if (list) {
            list.innerHTML = cached.map(s => `
              <a href="${buildInfoUrl(s)}" class="sidebar-list-item"
                 onmouseenter="showPopup(event,'${s.id}')"
                 onmouseleave="window.popupTimer=setTimeout(hidePopup,500)">
                <span class="sidebar-rank">${s.rank}</span>
                <img class="sidebar-poster" src="${s.poster || ''}">
                <div class="sidebar-info">
                  <h4>${s.title || ''}</h4>
                  <div class="side-meta"><i class="fas fa-star"></i> ${s.score} · ${s.members || 0} members</div>
                </div>
              </a>`).join('');
          }
          if (needsRefresh()) origPopular.apply(this, arguments).catch(() => {});
          return;
        }
        return origPopular.apply(this, arguments);
      };
    }

    // ── UPCOMING ────────────────────────────────────────────────────────────
    const origUpcoming = window.loadUpcoming;
    if (typeof origUpcoming === 'function') {
      window.loadUpcoming = async function () {
        const cached = await get({ limit: 80, section: 'upcoming' }).catch(() => []);
        if (cached.length) {
          if (window.upcomingShows !== undefined) window.upcomingShows = cached;
          if (typeof window.renderUpcoming === 'function') window.renderUpcoming();
          if (needsRefresh()) origUpcoming.apply(this, arguments).catch(() => {});
          return;
        }
        return origUpcoming.apply(this, arguments);
      };
    }

    // ── SAVE HOOKS: persist live results back to Supabase ───────────────────

    // Hook renderTopAiring to save whatever array it receives
    const _origRenderTopAiring = window.renderTopAiring;
    if (typeof _origRenderTopAiring === 'function') {
      window.renderTopAiring = function (shows) {
        save(shows).catch(() => {});
        return _origRenderTopAiring.apply(this, arguments);
      };
    }

    // Hook renderUpcoming to save upcomingShows
    const _origRenderUpcoming = window.renderUpcoming;
    if (typeof _origRenderUpcoming === 'function') {
      window.renderUpcoming = function () {
        if (window.upcomingShows && window.upcomingShows.length) {
          save(window.upcomingShows).catch(() => {});
        }
        return _origRenderUpcoming.apply(this, arguments);
      };
    }

    // For trending/popular, save the global data arrays after live fetches finish
    // (8 s gives enough time for all async fetches to complete on a normal connection)
    setTimeout(() => {
      if (window.trendingData && window.trendingData.length) save(window.trendingData).catch(() => {});
      if (window.popularData  && window.popularData.length)  save(window.popularData).catch(() => {});
    }, 8000);

    // ── SCHEDULE — save Jikan anime after scheduleData is built ─────────────
    const origLoadSchedule = window.loadSchedule;
    if (typeof origLoadSchedule === 'function') {
      window.loadSchedule = async function () {
        await origLoadSchedule.apply(this, arguments);
        if (window.scheduleData) {
          const all = Object.values(window.scheduleData).flat();
          if (all.length) {
            const mapped = all.map(a => ({
              id:                 `jikan-${a.mal_id}`,
              type:               'Anime',
              title:              a.title_english || a.title,
              poster:             a.images?.jpg?.image_url || '',
              score:              (a.score || 0).toFixed(1),
              genres:             (a.genres || []).map(g => g.name),
              synopsis:           a.synopsis || '',
              duration:           a.duration || '',
              aired_date:         a.aired?.from ? a.aired.from.slice(0, 10) : null,
              broadcast_day_time: a.broadcast ? `${a.broadcast.day} at ${a.broadcast.time} (JST)` : null,
              studio_name:        (a.studios || []).map(s => s.name).join(', '),
            }));
            await save(mapped).catch(() => {});
          }
        }
      };
    }

    // Stamp refresh time after all live fetches on first load (12 s timeout)
    if (needsRefresh()) {
      setTimeout(() => {
        stampRefresh();
        console.log('[AniCache] Initial cache stamp set ✓');
      }, 12000);
    }

    console.log('[AniCache] index.html functions patched ✓');
  }

})();
