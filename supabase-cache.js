/**
 * AniOcean · supabase-cache.js  v2.1
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure utility library — exposes window.AniCache.
 * index.html and info.html call AniCache methods directly; no monkey-patching.
 *
 * DATA FLOW
 *   API fetch → media_cache (upsert, no duplicates) → mirror → shows
 *   Site reads → shows table first → fall back to API if empty/stale
 *
 * DEDUP RULES
 *   • media_id is the unique key for both tables.
 *   • Before writing a batch we bulk-check which media_ids already exist in
 *     media_cache. Existing rows within the 15-min window are SKIPPED entirely.
 *   • Existing rows older than 15 min get volatile fields updated (score,
 *     status, episodes, poster, fetched_at) — not a full rewrite.
 *   • New rows → full INSERT into media_cache AND shows.
 *
 * STATUS VALUES USED FOR FILTERING
 *   anime:  "Currently Airing" | "Finished Airing" | "Not yet aired"
 *   tv:     "Returning Series" | "Ended" | "Canceled" | "In Production" | "Planned"
 *   movie:  "Released" | "Post Production" | "In Production" | "Planned" | "Canceled"
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /* ── constants ─────────────────────────────────────────────────────────── */
  const REFRESH_MS  = 15 * 60 * 1000;   // 15 min
  const TS_KEY      = 'aniocean_cache_ts';

  /* ── supabase client (shared.js creates it first) ─────────────────────── */
  const supa = window.supabaseClient || null;
  if (!supa) {
    console.warn('[AniCache] supabaseClient not found — load shared.js first');
    window.AniCache = { save:()=>{}, get:()=>[], findShow:()=>null, getDetails:()=>null, saveDetails:()=>{}, saveSchedule:()=>{}, getSchedule:()=>[], needsRefresh:()=>true, stampRefresh:()=>{}, buildInfoUrl:s=>'/info/'+s.id };
    return;
  }

  /* ── time helpers ──────────────────────────────────────────────────────── */
  const now          = () => Date.now();
  const needsRefresh = () => now() - parseInt(localStorage.getItem(TS_KEY)||'0',10) > REFRESH_MS;
  const stampRefresh = () => localStorage.setItem(TS_KEY, String(now()));

  /* ── media-id normaliser ───────────────────────────────────────────────── */
  // Accepts the varied id prefixes used in index.html and converts to canonical form:
  //   jikan-{mal_id}         for anime
  //   tmdb-movie-{tmdb_id}   for movies
  //   tmdb-tv-{tmdb_id}      for TV
  function canonicalId(raw) {
    const id = String(raw.id || raw.media_id || '');
    // anime variants
    if (/^jikan-(air|up|comp|tr|pop|)-?(\d+)$/.test(id)) {
      return 'jikan-' + id.replace(/^jikan-(?:air|up|comp|tr|pop)-?/, '');
    }
    if (/^jikan-\d+$/.test(id)) return id;
    // movie variants
    if (/^tmdb-(mv|movie|up|tr|pop)-(\d+)$/.test(id)) {
      const num = id.replace(/^tmdb-(?:mv|movie|up|tr|pop)-/, '');
      return `tmdb-movie-${num}`;
    }
    if (/^tmdb-movie-\d+$/.test(id)) return id;
    // tv variants
    if (/^tmdb-(tv|comp|tr|pop)-(\d+)$/.test(id)) {
      const num = id.replace(/^tmdb-(?:tv|comp|tr|pop)-/, '');
      return `tmdb-tv-${num}`;
    }
    if (/^tmdb-tv-\d+$/.test(id)) return id;
    return id;
  }

  function mediaTypeOf(raw) {
    const t = (raw.type || raw.media_type || '').toLowerCase();
    if (t === 'anime') return 'anime';
    if (t === 'movie') return 'movie';
    return 'tv';
  }

  /* ── premiered helper (anime only) ────────────────────────────────────── */
  function buildPremiered(raw) {
    const from = raw.aired_from || raw.aired?.from || raw.releaseDate || '';
    if (!from) return null;
    const d = new Date(from);
    if (isNaN(d)) return null;
    const SEASONS = ['Winter','Winter','Spring','Spring','Spring','Summer','Summer','Summer','Fall','Fall','Fall','Winter'];
    return `${SEASONS[d.getMonth()]}-${d.getFullYear()}`;
  }

  /* ── row builder ───────────────────────────────────────────────────────── */
  function toRow(raw) {
    const mid  = canonicalId(raw);
    const mt   = mediaTypeOf(raw);
    const isA  = mt === 'anime';
    const ts   = new Date().toISOString();

    // Extract numeric IDs from canonical media_id
    let mal_id = raw.mal_id ? String(raw.mal_id) : null;
    let tmdb_id = raw.tmdb_id ? String(raw.tmdb_id) : null;
    if (!mal_id && isA)  { const m = mid.match(/^jikan-(\d+)$/);            if (m) mal_id  = m[1]; }
    if (!tmdb_id && !isA){ const m = mid.match(/^tmdb-(?:movie|tv)-(\d+)$/);if (m) tmdb_id = m[1]; }

    const studios   = Array.isArray(raw.studios)   ? raw.studios.map(s=>s?.name||s).filter(Boolean) : [];
    const producers = Array.isArray(raw.producers)  ? raw.producers.map(p=>p?.name||p).filter(Boolean) : [];
    const genreArr  = Array.isArray(raw.genres)     ? raw.genres.map(g=>g?.name||g).filter(Boolean) : [];

    return {
      media_id:    mid,
      show_id:     mid,
      media_type:  mt,
      mal_id,
      tmdb_id,
      ani_id:      raw.ani_id    ? String(raw.ani_id)   : null,
      aniko_id:    raw.aniko_id  ? String(raw.aniko_id) : null,

      eng_title:       raw.title || raw.eng_title || raw.name || null,
      default_title:   raw.title || raw.default_title || raw.name || null,
      original_title:  raw.original_title || null,
      romanji_title:   raw.romanji_title  || null,
      japanese_title:  raw.title_japanese || raw.japanese_title || null,
      synonyms:        Array.isArray(raw.synonyms) ? raw.synonyms.join(', ') : (raw.synonyms||null),

      synopsis:  raw.synopsis  || (isA ? raw.overview : null) || null,
      overview:  raw.overview  || (!isA ? raw.synopsis : null) || null,

      labels:       Array.isArray(raw.labels) ? raw.labels.join(', ') : (raw.labels||null),
      country_name: raw.country_name || null,
      genres:       genreArr.join(', ') || null,

      aired_date:         raw.aired_date || raw.releaseDate || raw.release_date || raw.first_air_date || null,
      broadcast_day_time: raw.broadcast_day_time || (
        raw.broadcast
          ? `${raw.broadcast.day||''} at ${raw.broadcast.time||''} (JST)`.trim()
          : null
      ),
      source:     raw.source_material || raw.source || null,
      rank:       raw.rank       ? parseInt(raw.rank,10)  : null,
      popularity: raw.popularity ? parseInt(raw.popularity,10) : (raw.members ? parseInt(raw.members,10) : null),

      studio_name:    studios.join(', ')   || raw.studio_name  || raw.studio   || null,
      producers_name: producers.join(', ') || raw.producers_name || null,

      season_eng_title: raw.season_eng_title || null,
      season_slug:      raw.season_slug      || null,
      season_badge:     raw.season_badge     || null,
      season_num:       raw.season_num ? parseInt(raw.season_num,10) : null,
      season_backdrop_landscape_image_link: raw.season_backdrop_landscape_image_link || null,

      total_episodes: raw.total_epi_num || raw.total_episodes || raw.episodes || null,
      dub_epi:  raw.dub_epi  != null ? parseInt(raw.dub_epi,10)  : (raw.is_dub  ? parseInt(raw.is_dub,10)  : null),
      sub_epi:  raw.sub_epi  != null ? parseInt(raw.sub_epi,10)  : (raw.is_sub  ? parseInt(raw.is_sub,10)  : null),
      is_sub:   raw.is_sub   != null ? parseInt(raw.is_sub,10)   : (raw.sub_epi ? 1 : 0),
      is_dub:   raw.is_dub   != null ? parseInt(raw.is_dub,10)   : (raw.dub_epi ? 1 : 0),

      intro_skip_start: raw.intro_skip_start || null,
      intro_skip_end:   raw.intro_skip_end   || null,
      outro_skip_start: raw.outro_skip_start || null,
      outro_skip_end:   raw.outro_skip_end   || null,

      format:             raw.format || raw.type_label || null,
      mal_score:          raw.mal_score  || (isA  ? (parseFloat(raw.score)||null) : null),
      tmdb_average_score: raw.tmdb_average_score || (!isA ? (parseFloat(raw.score)||null) : null),
      content_rating:     raw.content_rating || raw.certification || raw.rating || null,
      anime_duration_time:   isA ? (raw.anime_duration_time || raw.duration || null) : null,
      tmdb_movie_tv_runtime: !isA? (raw.tmdb_movie_tv_runtime || String(raw.runtime||raw.duration||'')||null):null,
      release_year: raw.release_year
        || (raw.releaseDate ? parseInt(raw.releaseDate.slice(0,4),10) : null)
        || (raw.aired?.from ? parseInt(raw.aired.from.slice(0,4),10)  : null)
        || null,
      rating_score: parseFloat(raw.score) || null,

      show_poster_link:                   raw.show_poster_link  || raw.poster   || null,
      show_backdrop_landscape_image_link: raw.show_backdrop_landscape_image_link || raw.backdrop || null,
      poster_path:   raw.poster   || null,
      backdrop_path: raw.backdrop || null,

      external_link:      raw.external_link  || raw.url     || null,
      trailer_video_link: raw.trailer_video_link || raw.trailer || null,

      show_status: raw.show_status || raw.status || raw.tmdb_status || null,
      premiered:   isA ? buildPremiered(raw) : null,

      fetched_at: ts,
      updated_at: ts,
    };
  }

  /* ── bulk existence check in media_cache ───────────────────────────────── */
  async function existingInCache(mediaIds) {
    if (!mediaIds.length) return new Map();
    try {
      const { data } = await supa
        .from('media_cache')
        .select('media_id, fetched_at')
        .in('media_id', mediaIds);
      const map = new Map();
      (data||[]).forEach(r => map.set(r.media_id, r.fetched_at));
      return map;
    } catch { return new Map(); }
  }

  /* ── upsert helper ─────────────────────────────────────────────────────── */
  async function upsertToCache(rows) {
    if (!rows.length) return;
    const { error } = await supa
      .from('media_cache')
      .upsert(rows, { onConflict: 'media_id' });
    if (error) console.warn('[AniCache] media_cache upsert:', error.message);
    else console.log(`[AniCache] ✓ media_cache: ${rows.length} rows`);
  }

  async function upsertToShows(rows) {
    if (!rows.length) return;
    // Strip media_cache-only fields before writing to shows
    const clean = rows.map(r => {
      const { fetched_at, poster_path, backdrop_path, rating_score, media_type_raw, show_ref_id, ...rest } = r;
      return rest;
    });
    const { error } = await supa
      .from('shows')
      .upsert(clean, { onConflict: 'media_id' });
    if (error) console.warn('[AniCache] shows upsert:', error.message);
    else console.log(`[AniCache] ✓ shows: ${clean.length} rows`);
  }

  /* ── VOLATILE FIELDS (only these are updated for existing rows) ─────────── */
  const VOLATILE = [
    'mal_score','tmdb_average_score','popularity','rank','show_status',
    'total_episodes','dub_epi','sub_epi','is_sub','is_dub',
    'show_poster_link','show_backdrop_landscape_image_link',
    'fetched_at','updated_at',
  ];

  /* ── PUBLIC: save items to media_cache + shows ─────────────────────────── */
  async function save(items) {
    if (!items || !items.length) return;
    const rows = items.filter(Boolean).map(toRow);
    const ids   = rows.map(r => r.media_id).filter(Boolean);
    if (!ids.length) return;

    const existMap = await existingInCache(ids);
    const staleTs  = new Date(now() - REFRESH_MS).toISOString();

    const fresh    = [];   // already in cache & fetched recently → SKIP
    const stale    = [];   // in cache but old → update volatile fields only
    const brandNew = [];   // not in cache → full insert

    rows.forEach(r => {
      if (!r.media_id) return;
      const cachedAt = existMap.get(r.media_id);
      if (!cachedAt)               brandNew.push(r);
      else if (cachedAt < staleTs) stale.push(r);
      else                         fresh.push(r);
    });

    if (fresh.length)    console.log(`[AniCache] Skipped ${fresh.length} fresh rows (no re-write needed)`);
    if (brandNew.length) { await upsertToCache(brandNew); await upsertToShows(brandNew); }
    if (stale.length) {
      const volatileRows = stale.map(r => {
        const out = { media_id: r.media_id };
        VOLATILE.forEach(k => { if (r[k] != null) out[k] = r[k]; });
        return out;
      });
      await upsertToCache(volatileRows);
      // Also update volatile in shows
      const { error } = await supa.from('shows')
        .upsert(volatileRows.map(r => { const {fetched_at, ...rest}=r; return rest; }), { onConflict: 'media_id' });
      if (error) console.warn('[AniCache] shows stale update:', error.message);
      else console.log(`[AniCache] ✓ Updated volatile fields for ${stale.length} stale rows`);
    }
  }

  /* ── PUBLIC: read from shows table ─────────────────────────────────────── */
  async function get(opts = {}) {
    const { section, media_type, limit = 30 } = opts;
    let q = supa.from('shows').select('*');

    if (media_type) {
      const types = media_type.split(',').map(t => t.trim());
      q = types.length === 1 ? q.eq('media_type', types[0]) : q.in('media_type', types);
    }

    switch (section) {
      case 'top_airing':
        q = q.or(
          'and(media_type.eq.anime,show_status.eq.Currently Airing),' +
          'and(media_type.eq.tv,show_status.in.(Returning Series,Ongoing,Airing))'
        ).order('popularity', { ascending: false });
        break;

      case 'upcoming':
        q = q.or(
          'and(media_type.eq.anime,show_status.eq.Not yet aired),' +
          'and(media_type.eq.tv,show_status.in.(Planned,In Production)),' +
          'and(media_type.eq.movie,show_status.in.(Planned,In Production,Post Production))'
        ).order('release_year', { ascending: true });
        break;

      case 'completed':
        q = q.or(
          'and(media_type.eq.anime,show_status.eq.Finished Airing),' +
          'and(media_type.eq.tv,show_status.in.(Ended,Canceled))'
        ).order('release_year', { ascending: false });
        break;

      case 'new_releases':
        q = q.or(
          'and(media_type.eq.anime,show_status.in.(Currently Airing,Finished Airing)),' +
          'and(media_type.eq.tv,show_status.in.(Returning Series,Ended,Airing)),' +
          'and(media_type.eq.movie,show_status.eq.Released)'
        ).order('release_year', { ascending: false });
        break;

      case 'trending':
      case 'popular':
      default:
        q = q.order('popularity', { ascending: false });
        break;
    }

    const { data, error } = await q.limit(limit);
    if (error) { console.warn('[AniCache] get error:', error.message); return []; }
    return (data || []).map(normalise);
  }

  /* ── PUBLIC: find a single show by media_id ────────────────────────────── */
  async function findShow(mediaId) {
    if (!mediaId) return null;
    const { data, error } = await supa
      .from('shows').select('*').eq('media_id', mediaId).maybeSingle();
    if (error || !data) return null;
    return normalise(data);
  }

  /* ── Schedule table helpers ─────────────────────────────────────────────── */
  async function saveSchedule(animeList) {
    if (!animeList || !animeList.length) return;
    const ts = new Date().toISOString();
    const rows = animeList.map(a => ({
      media_id:        `jikan-${a.mal_id}`,
      mal_id:          String(a.mal_id),
      eng_title:       a.title_english || a.title,
      default_title:   a.title,
      japanese_title:  a.title_japanese || null,
      show_poster_link:a.images?.jpg?.image_url || null,
      broadcast_day:   (a.broadcast?.day||'').toLowerCase() || null,
      broadcast_time:  a.broadcast?.time || null,
      total_episodes:  a.episodes || null,
      show_status:     a.status   || null,
      aired_date:      a.aired?.from ? a.aired.from.slice(0,10) : null,
      format:          a.type     || null,
      genres:          (a.genres||[]).map(g=>g.name).join(', ') || null,
      synopsis:        a.synopsis || null,
      studio_name:     (a.studios||[]).map(s=>s.name).join(', ') || null,
      mal_score:       a.score ? parseFloat(a.score) : null,
      content_rating:  a.rating  || null,
      fetched_at: ts, updated_at: ts,
    }));

    // Dedup: only insert new/stale rows
    const ids = rows.map(r => r.media_id);
    const { data: existing } = await supa.from('schedule').select('media_id,fetched_at').in('media_id', ids);
    const existMap = new Map((existing||[]).map(r => [r.media_id, r.fetched_at]));
    const staleTs  = new Date(now() - REFRESH_MS).toISOString();
    const toWrite  = rows.filter(r => {
      const t = existMap.get(r.media_id);
      return !t || t < staleTs;
    });

    if (!toWrite.length) return;
    const { error } = await supa.from('schedule').upsert(toWrite, { onConflict: 'media_id' });
    if (error) console.warn('[AniCache] schedule upsert:', error.message);
    else console.log(`[AniCache] ✓ schedule: ${toWrite.length} rows`);
  }

  async function getSchedule(day) {
    const { data, error } = await supa
      .from('schedule').select('*')
      .eq('broadcast_day', day.toLowerCase())
      .order('broadcast_time', { ascending: true });
    if (error) return [];
    return data || [];
  }

  /* ── show_details helpers (info page tabs) ──────────────────────────────── */
  async function saveDetails(mediaId, payload) {
    if (!mediaId || !payload) return;
    const ts = new Date().toISOString();
    const row = { media_id: mediaId, fetched_at: ts, updated_at: ts };
    ['cast_crew','artwork','trailers','themes','stats','seasons','recommendations']
      .forEach(k => { if (payload[k] != null) row[k] = payload[k]; });

    // Only write if stale/missing
    const { data: existing } = await supa
      .from('show_details').select('media_id,fetched_at').eq('media_id', mediaId).maybeSingle();
    const staleTs = new Date(now() - REFRESH_MS * 4).toISOString(); // 1 hour TTL for details
    if (existing?.fetched_at && existing.fetched_at > staleTs) {
      console.log('[AniCache] show_details fresh, skip write');
      return;
    }

    const { error } = await supa.from('show_details').upsert(row, { onConflict: 'media_id' });
    if (error) console.warn('[AniCache] show_details upsert:', error.message);
    else console.log(`[AniCache] ✓ show_details saved for ${mediaId}`);
  }

  async function getDetails(mediaId) {
    const { data, error } = await supa
      .from('show_details').select('*').eq('media_id', mediaId).maybeSingle();
    if (error || !data) return null;
    const staleTs = new Date(now() - REFRESH_MS * 4).toISOString();
    if (data.fetched_at < staleTs) return null; // expired
    return data;
  }

  /* ── normalise DB row → render-ready shape ──────────────────────────────── */
  function normalise(r) {
    const score = parseFloat(r.mal_score || r.tmdb_average_score || r.rating_score || 0);
    return {
      id:       r.media_id,
      media_id: r.media_id,
      title:    r.eng_title || r.default_title || '—',
      type:     r.media_type === 'anime' ? 'Anime' : r.media_type === 'movie' ? 'Movie' : 'TV',
      poster:   r.show_poster_link || r.poster_path || '',
      backdrop: r.show_backdrop_landscape_image_link || r.backdrop_path || '',
      score:    score.toFixed(1),
      year:     String(r.release_year || ''),
      genres:   r.genres ? r.genres.split(',').map(g => g.trim()) : [],
      synopsis: r.synopsis  || r.overview || '',
      overview: r.overview  || r.synopsis || '',
      duration: r.anime_duration_time || r.tmdb_movie_tv_runtime || '?',
      certification: r.content_rating || 'PG-13',
      studio:   r.studio_name || '',
      mal_id:   r.mal_id,
      tmdb_id:  r.tmdb_id,
      episodes: r.total_episodes,
      status:   r.show_status || r.format || '',
      show_status: r.show_status || '',
      premiered:   r.premiered || '',
      quality:  'HD',
      releaseDate: r.aired_date || '',
      original_title: r.original_title || '',
      japanese_title: r.japanese_title || '',
      romanji_title:  r.romanji_title  || '',
      broadcast_day_time: r.broadcast_day_time || '',
      popularity: r.popularity || 0,
      rank: r.rank || 0,
      members: r.popularity || 0,
      is_sub: r.is_sub || 0,
      is_dub: r.is_dub || 0,
    };
  }

  /* ── URL builder ────────────────────────────────────────────────────────── */
  function buildInfoUrl(s) {
    const id   = s.id || s.media_id || '';
    const slug = (s.title || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    if (/^jikan-\d+$/.test(id))       return `/info/anime/${id}/${slug}`;
    if (/^tmdb-movie-\d+$/.test(id))  return `/info/movie/${id}/${slug}`;
    if (/^tmdb-tv-\d+$/.test(id))     return `/info/tv/${id}/${slug}`;
    return `/${slug}`;
  }

  /* ── expose public API ──────────────────────────────────────────────────── */
  window.AniCache = {
    save,
    get,
    findShow,
    saveSchedule,
    getSchedule,
    saveDetails,
    getDetails,
    needsRefresh,
    stampRefresh,
    buildInfoUrl,
    normalise,
    canonicalId,
    toRow,
  };

  console.log('[AniCache] v2.1 ready ✓');
})();
