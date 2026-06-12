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
 * USAGE  (add before </body> in index.html and info.html):
 *   <script src="supabase-cache.js"></script>
 *
 * REQUIREMENT: supabase-js v2 must be loaded before this file, e.g.:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────────────────────
  const SUPABASE_URL  = 'https://msazwxqbyxctdnwqrreb.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYXp3eHFieXhjdGRud3FycmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDkzMzYsImV4cCI6MjA5MzEyNTMzNn0.jfaA3HMRabWWPJkPGK34HM-suUhde_L9JEU0YfGkpLY';

  /** Refresh interval in milliseconds (15 minutes) */
  const REFRESH_MS    = 15 * 60 * 1000;

  /** localStorage key that stores last-fetch timestamp */
  const TS_KEY        = 'aniocean_cache_ts';

  // ── SUPABASE CLIENT ─────────────────────────────────────────────────────────
  const supa = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
    : null;

  if (!supa) {
    console.warn('[AniCache] supabase-js not loaded — caching disabled');
    return;
  }

  // Expose so shared.js / info.html can also use the same client instance
  window.supabaseClient = window.supabaseClient || supa;

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
    if (id.startsWith('jikan-'))     return id.replace(/^jikan-(?:air|up|comp|tr|pop)-?/, 'jikan-');
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
      show_id:     mid,                               // convenience alias
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
      synopsis:  raw.synopsis || null,
      overview:  raw.overview || null,

      // Metadata
      labels:       Array.isArray(raw.labels) ? raw.labels.join(', ') : raw.labels || null,
      country_name: raw.country_name || null,
      genres:       Array.isArray(raw.genres) ? raw.genres.join(', ') : raw.genres || null,
      aired_date:   raw.aired_date   || raw.releaseDate || null,
      broadcast_day_time: raw.broadcast_day_time || raw.broadcast || null,
      source:       raw.source  || null,
      rank:         raw.rank    ? parseInt(raw.rank, 10)       : null,
      popularity:   raw.popularity ? parseInt(raw.popularity, 10) : raw.members ? parseInt(raw.members, 10) : null,

      // Production
      studio_name:    Array.isArray(raw.studios) ? raw.studios.join(', ') : raw.studio_name || raw.studio || null,
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
      format:          raw.format         || null,
      mal_score:       raw.mal_score       || (raw.type === 'Anime' ? parseFloat(raw.score) || null : null),
      tmdb_average_score: raw.tmdb_average_score || (raw.type !== 'Anime' ? parseFloat(raw.score) || null : null),
      content_rating:  raw.content_rating  || raw.certification || raw.rating || null,
      anime_duration_time: raw.anime_duration_time || (isAnime ? raw.duration || null : null),
      tmdb_movie_tv_runtime: raw.tmdb_movie_tv_runtime || (!isAnime ? raw.duration || null : null),
      rating_score:    parseFloat(raw.score) || null,   // generic score kept for media_cache compat
      release_year:    raw.release_year    || (raw.releaseDate ? parseInt(raw.releaseDate.slice(0,4), 10) : null)
                       || (raw.year ? parseInt(raw.year, 10) : null),

      // Images
      show_poster_link: raw.show_poster_link || raw.poster || null,
      show_backdrop_landscape_image_link: raw.show_backdrop_landscape_image_link || raw.backdrop || null,
      poster_path:   raw.poster   || null,
      backdrop_path: raw.backdrop || null,

      // Links
      external_link:       raw.external_link       || raw.url  || null,
      trailer_video_link:  raw.trailer_video_link  || raw.trailer || null,
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
    // shows table has additional columns; filter to what it needs
    const showRows = rows.map(r => {
      // Remove media_cache-specific columns not in shows
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
   * @param {object} filters  e.g. { media_type: 'anime', order: 'rank', limit: 20 }
   * @returns {Promise<Array>}
   */
  async function fetchFromShows({ media_type, limit = 30, order = 'popularity', section } = {}) {
    let q = supa.from('shows').select('*');

    if (media_type) {
      // Accept comma-list: 'anime,tv'
      const types = media_type.split(',').map(t => t.trim());
      if (types.length === 1) {
        q = q.eq('media_type', types[0]);
      } else {
        q = q.in('media_type', types);
      }
    }

    // Section-specific filters
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

    // Normalise back to the shape render functions expect
    return (data || []).map(r => ({
      id:           r.media_id,
      media_id:     r.media_id,
      title:        r.eng_title || r.default_title,
      type:         r.media_type === 'anime' ? 'Anime' : r.media_type === 'movie' ? 'Movie' : 'TV',
      poster:       r.show_poster_link || r.poster_path,
      backdrop:     r.show_backdrop_landscape_image_link || r.backdrop_path,
      score:        (r.mal_score || r.tmdb_average_score || r.rating_score || 0).toFixed(1),
      year:         String(r.release_year || ''),
      genres:       r.genres ? r.genres.split(',').map(g => g.trim()) : [],
      synopsis:     r.synopsis || r.overview || '',
      overview:     r.overview || r.synopsis || '',
      duration:     r.anime_duration_time || r.tmdb_movie_tv_runtime || '?',
      certification: r.content_rating || 'PG-13',
      studio:       r.studio_name,
      mal_id:       r.mal_id,
      tmdb_id:      r.tmdb_id,
      episodes:     r.total_episodes,
      status:       r.format || 'Airing',
      quality:      'HD',
      details:      r.tmdb_movie_tv_runtime || '1h 45m',
      cert:         r.content_rating || 'PG-13',
      releaseDate:  r.aired_date || '',
      original_title: r.original_title,
    }));
  }

  // ── PUBLIC API ───────────────────────────────────────────────────────────────

  /**
   * Call this with the raw results of any live-API fetch to persist them.
   * Usage (inside any loadXxx function, after building the `combined` array):
   *
   *   window.AniCache.save(combined);
   */
  async function save(items) {
    if (!Array.isArray(items)) items = [items];
    await cacheBatch(items.filter(Boolean));
  }

  /**
   * Try to serve a section from the `shows` table.
   * Returns [] if the table has no matching rows (fallback to live API).
   *
   * Usage example:
   *   const cached = await window.AniCache.get({ media_type: 'anime', section: 'trending', limit: 20 });
   *   if (cached.length) { renderTrending(cached); } else { /* live fetch *\/ }
   */
  async function get(opts) {
    return fetchFromShows(opts);
  }

  /**
   * Wrapper for the 15-minute refresh gate.
   * Call once at page load; it triggers a background refresh if the cache is stale.
   * The `refreshFn` is the caller's function that does live API fetches + calls save().
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
      const remaining = Math.round((REFRESH_MS - (now() - parseInt(localStorage.getItem(TS_KEY)||'0',10))) / 1000 / 60);
      console.log(`[AniCache] Cache fresh — next refresh in ~${remaining} min`);
    }
  }

  // Expose globally
  window.AniCache = { save, get, autoRefresh, needsRefresh, stampRefresh };

  // ── AUTO-INTEGRATION PATCH FOR index.html ───────────────────────────────────
  // This section monkey-patches the existing load functions so that:
  //   a) After each live fetch, results are saved to Supabase.
  //   b) Before each live fetch, we try to serve from Supabase first.
  //
  // It waits for DOMContentLoaded so the original functions are defined first.

  document.addEventListener('DOMContentLoaded', () => {
    // Give the inline <script> time to define its functions (same tick)
    setTimeout(patchIndexFunctions, 0);
  });

  function patchIndexFunctions() {

    // ── Helper: wrap an existing function to save results after live fetch ──

    function wrapSave(fnName, extractor) {
      const orig = window[fnName];
      if (typeof orig !== 'function') return;
      window[fnName] = async function (...args) {
        const result = await orig.apply(this, args);
        try {
          const items = extractor ? extractor(result) : result;
          if (Array.isArray(items) && items.length) await save(items);
        } catch (e) { console.warn(`[AniCache] post-save error in ${fnName}:`, e); }
        return result;
      };
    }

    // ── Cache-first wrapper: try shows table, fall back to live, then save ──

    function wrapCacheFirst(fnName, getOpts, renderFn) {
      const origLoad = window[fnName];
      if (typeof origLoad !== 'function') return;
      window[fnName] = async function (...args) {
        try {
          const cached = await get(getOpts);
          if (cached.length) {
            renderFn(cached);
            // Background refresh if stale
            if (needsRefresh()) {
              origLoad.apply(this, args).catch(() => {});
            }
            return;
          }
        } catch (e) { console.warn(`[AniCache] cache-first read error in ${fnName}:`, e); }
        // Fallback to live
        return origLoad.apply(this, args);
      };
    }

    // ── HERO ────────────────────────────────────────────────────────────────
    // Hero uses heroData array + renderHero() — patch loadHero to save after fetch
    const origLoadHero = window.loadHero;
    if (typeof origLoadHero === 'function') {
      window.loadHero = async function () {
        // Try cache first (all types, newest)
        const cached = await get({ limit: 19, section: 'new_releases' }).catch(() => []);
        if (cached.length >= 5) {
          // heroData is a scoped variable; we use a custom event to pass data
          const evt = new CustomEvent('aniocean:heroData', { detail: cached.slice(0, 19) });
          document.dispatchEvent(evt);
        }
        // Always run live fetch in background to keep cache warm
        return origLoadHero.apply(this, arguments).then(async () => {
          if (window.heroData && window.heroData.length) await save(window.heroData);
        }).catch(() => {});
      };
    }

    // ── TOP AIRING ──────────────────────────────────────────────────────────
    wrapCacheFirst(
      'loadTopAiring',
      { limit: 60, section: 'top_airing' },
      (items) => {
        if (typeof window.renderTopAiring === 'function') window.renderTopAiring(items);
      }
    );
    // Still save live results
    const origTopAiring = window.loadTopAiring;
    if (typeof origTopAiring === 'function') {
      window.loadTopAiring = async function () {
        await origTopAiring.apply(this, arguments);
        // After render, topAiringScroll contains cards — data already stored
      };
    }

    // ── NEW RELEASES ────────────────────────────────────────────────────────
    const origNewReleases = window.loadNewReleases;
    if (typeof origNewReleases === 'function') {
      window.loadNewReleases = async function () {
        // Try cache
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
        // Cache first only for default 'today' period
        if (!period || period === 'today') {
          const cached = await get({ limit: 20, section: 'trending' }).catch(() => []);
          if (cached.length) {
            cached.forEach((s, i) => s.rank = i + 1);
            if (window.trendingData !== undefined) window.trendingData = cached;
            const list = document.getElementById('trendingList');
            if (list) {
              list.innerHTML = cached.map(s => `
                <a href="${buildInfoUrl(s)}" class="sidebar-list-item">
                  <span class="sidebar-rank">${s.rank}</span>
                  <img class="sidebar-poster" src="${s.poster||''}" onerror="this.style.display='none'">
                  <div class="sidebar-info"><h4>${s.title||''}</h4>
                  <div class="side-meta"><i class="fas fa-star"></i> ${s.score} · ${s.type}</div></div>
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
              <a href="${buildInfoUrl(s)}" class="sidebar-list-item">
                <span class="sidebar-rank">${s.rank}</span>
                <img class="sidebar-poster" src="${s.poster||''}">
                <div class="sidebar-info"><h4>${s.title||''}</h4>
                <div class="side-meta"><i class="fas fa-star"></i> ${s.score} · ${s.members||0} members</div></div>
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

    // ── SAVE HOOK: after each live load, persist to Supabase ────────────────
    // We hook into the render functions to capture the final arrays

    const _origRenderTopAiring = window.renderTopAiring;
    if (typeof _origRenderTopAiring === 'function') {
      window.renderTopAiring = function (shows) {
        save(shows).catch(() => {});
        return _origRenderTopAiring.apply(this, arguments);
      };
    }

    const _origRenderUpcoming = window.renderUpcoming;
    if (typeof _origRenderUpcoming === 'function') {
      window.renderUpcoming = function () {
        if (window.upcomingShows && window.upcomingShows.length) {
          save(window.upcomingShows).catch(() => {});
        }
        return _origRenderUpcoming.apply(this, arguments);
      };
    }

    // For trending/popular we hook after the innerHTML write by checking
    // the data arrays that index.html maintains
    setTimeout(() => {
      if (window.trendingData && window.trendingData.length) save(window.trendingData).catch(() => {});
      if (window.popularData  && window.popularData.length)  save(window.popularData).catch(() => {});
    }, 8000); // 8 s after page load — live fetches should be done by then

    // ── SCHEDULE — save anime items to cache ────────────────────────────────
    // The schedule fetches Jikan anime; we save them after scheduleData is built
    const origLoadSchedule = window.loadSchedule;
    if (typeof origLoadSchedule === 'function') {
      window.loadSchedule = async function () {
        await origLoadSchedule.apply(this, arguments);
        if (window.scheduleData) {
          const all = Object.values(window.scheduleData).flat();
          if (all.length) {
            const mapped = all.map(a => ({
              id: `jikan-${a.mal_id}`,
              type: 'Anime',
              title: a.title_english || a.title,
              poster: a.images?.jpg?.image_url || '',
              score: (a.score || 0).toFixed(1),
              genres: (a.genres || []).map(g => g.name),
              synopsis: a.synopsis || '',
              duration: a.duration || '',
              aired_date: a.aired?.from ? a.aired.from.slice(0, 10) : null,
              broadcast_day_time: a.broadcast ? `${a.broadcast.day} at ${a.broadcast.time} (JST)` : null,
              studio_name: (a.studios || []).map(s => s.name).join(', '),
            }));
            await save(mapped).catch(() => {});
          }
        }
      };
    }

    console.log('[AniCache] index.html functions patched ✓');
  }

  // ── UTILITY: build info URL from a show object ───────────────────────────────
  function buildInfoUrl(s) {
    const id = s.id || s.media_id || '';
    const slug = (s.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (id.startsWith('jikan-'))         return `/info/anime/${id}/${slug}`;
    if (id.startsWith('tmdb-movie-'))    return `/info/movie/${id}/${slug}`;
    if (id.startsWith('tmdb-tv-'))       return `/info/tv/${id}/${slug}`;
    return `/info/${id}/${slug}`;
  }
  window.AniCache.buildInfoUrl = buildInfoUrl;

})();
