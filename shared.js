// shared.js – injects header, footer, search, auth, and all shared interactive logic
(function () {
  /* ========== SUPABASE ========== */
  const SUPABASE_URL = 'https://msazwxqbyxctdnwqrreb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYXp3eHFieXhjdGRud3FycmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDkzMzYsImV4cCI6MjA5MzEyNTMzNn0.jfaA3HMRabWWPJkPGK34HM-suUhde_L9JEU0YfGkpLY';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ========== GLOBAL CONFIG ========== */
  const TMDB_PROXY = 'https://aniocen.bionmovies47.workers.dev'; // replace with your actual worker URL if different
  const JIKAN_BASE = 'https://api.jikan.moe/v4';
  const TMDB_IMAGE = 'https://image.tmdb.org/t/p';
  const TURNSTILE_SITE_KEY = '0x4AAAAAADHwF4HZ8mJhe0yRQeNHRG-xyWk';

  // dedicated image helpers
  const tmdbImg = (p, s = 'w200') => p ? `${TMDB_IMAGE}/${s}${p}` : '';
  const tmdbSmall = (p) => tmdbImg(p, 'w92');

  // genre ID → name mapping
  const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
    878: 'Science Fiction', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War',
    37: 'Western', 10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
    10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk',
    10768: 'War & Politics'
  };

  /* ========== HEADER HTML ========== */
  const headerHTML = `
    <header class="site-header" style="background:var(--bg-header);padding:8px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle);position:sticky;top:0;z-index:200;min-height:54px;flex-wrap:nowrap;">
      <!-- hamburger (mobile) -->
      <div class="hamburger" id="hamburgerBtn" style="display:none;flex-direction:column;gap:5px;cursor:pointer;padding:6px;">
        <span style="width:20px;height:2px;background:#fff;border-radius:2px;"></span>
        <span style="width:20px;height:2px;background:#fff;border-radius:2px;"></span>
        <span style="width:20px;height:2px;background:#fff;border-radius:2px;"></span>
      </div>

      <!-- logo -->
      <a href="/" class="header-logo" style="flex-shrink:0;display:flex;align-items:center;gap:6px;cursor:pointer;text-decoration:none;">
        <img src="" alt="logo" id="siteLogo" style="height:28px;width:auto;max-width:120px;object-fit:contain;">
        <span style="font-family:var(--font-title);font-size:1.35rem;color:#fff;">◈ Muvix‑VQ</span>
      </a>

      <!-- desktop navigation -->
      <nav class="main-nav" id="mainNav" style="display:flex;align-items:center;gap:2px;flex-shrink:0;">
        <a href="/" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;position:relative;">Home</a>
        <div class="nav-dropdown-trigger" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">Genre ▾<div class="nav-dropdown" id="genreDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:520px;grid-template-columns:repeat(4,1fr);gap:4px;z-index:300;"></div></div>
        <div class="nav-dropdown-trigger" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">Country ▾<div class="nav-dropdown" id="countryDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:520px;grid-template-columns:repeat(4,1fr);gap:4px;z-index:300;"></div></div>
        <div class="nav-dropdown-trigger" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">Type ▾<div class="nav-dropdown" id="typeDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:160px;z-index:300;">
          <a href="/search?type=anime" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Anime</a>
          <a href="/search?type=drama" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Drama</a>
          <a href="/search?type=movie" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Movie</a>
          <a href="/search?type=tv-show" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">TV Show</a>
        </div></div>
        <a href="/search?q=ongoing" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Ongoing</a>
        <a href="/search?q=new+releases" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Updates</a>
        <a href="#" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">News</a>
        <a href="#" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Forum</a>
      </nav>

      <!-- search bar with toggle -->
      <div class="header-search-wrap" style="flex:1;max-width:340px;margin:0 8px;position:relative;z-index:350;">
        <div class="header-search-bar" style="display:flex;align-items:center;background:var(--bg-surface);border:1px solid var(--border-medium);border-radius:50px;overflow:hidden;padding:0;">
          <div class="search-toggle-tabs" style="display:flex;padding:4px 4px;gap:2px;">
            <span class="search-toggle-tab active" data-search="non-anime" style="padding:4px 8px;font-size:0.62rem;font-weight:600;border-radius:50px;cursor:pointer;color:var(--text-muted);white-space:nowrap;">Non‑Anime</span>
            <span class="search-toggle-tab" data-search="anime" style="padding:4px 8px;font-size:0.62rem;font-weight:600;border-radius:50px;cursor:pointer;color:var(--text-muted);white-space:nowrap;">Anime</span>
          </div>
          <input type="text" id="searchInput" placeholder="Search shows..." autocomplete="off" style="flex:1;padding:9px 6px;background:transparent;border:none;color:#fff;font-size:0.8rem;min-width:60px;outline:none;">
        </div>
        <div class="search-suggestions" id="searchSuggestions" style="display:none;position:absolute;top:110%;left:0;right:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;max-height:420px;overflow-y:auto;z-index:360;box-shadow:0 8px 24px rgba(0,0,0,0.5);"></div>
      </div>

      <!-- social icons (desktop) -->
      <div class="header-socials" style="display:flex;gap:6px;flex-shrink:0;">
        <a href="https://discord.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;" title="Discord"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg></a>
        <a href="https://tumblr.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;" title="Tumblr"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14.563 18c-3.031 0-4.219-2.25-4.219-3.844V9.938H8.25V7.22c2.625-.938 3.281-3.282 3.406-4.688h2.437v4.219h3.094v3.188h-3.094v4.031c0 1.125.656 1.5 1.688 1.5H18V18h-3.437z"/></svg></a>
        <a href="https://bsky.app" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;" title="Bluesky"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 10.8c-1.1-3.2-4.1-6.1-7.2-7.6C2.3 2.1 0 3.5 0 6.6c0 .9.5 7.3 3 8.3 1.5.6 3.5.1 5-1.1-1.2 3.4-1.8 6.3-1 7.9 1.5 3 5.5 2.2 7-1.2.8-1.8.8-4.2 0-7.6.8.7 1.8 1.2 2.8 1.2 2.5 0 3-7.4 3-8.3 0-3.1-2.3-4.5-4.8-3.4-3.1 1.5-6.1 4.4-7.2 7.6z"/></svg></a>
        <a href="https://x.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;" title="X"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
      </div>

      <!-- login button / avatar -->
      <button class="btn-login" id="btnLogin" style="padding:8px 16px;background:var(--btn-primary);color:#fff;border-radius:50px;font-weight:600;font-size:0.75rem;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;order:30;">Sign In</button>
      <div style="position:relative;flex-shrink:0;order:30;">
        <img class="user-avatar" id="userAvatar" src="" alt="Profile" style="display:none;width:34px;height:34px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid var(--btn-primary);" onclick="toggleProfileDropdown()">
        <div class="profile-dropdown" id="profileDropdown" style="display:none;position:absolute;top:calc(100% + 4px);right:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;min-width:180px;padding:8px;z-index:400;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
          <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px;">
            <img id="dropdownAvatar" src="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            <span id="dropdownUserName" style="font-weight:600;font-size:0.8rem;color:#fff;"></span>
          </div>
          <a href="/profile" style="display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:0.75rem;color:var(--text-secondary);border-radius:6px;transition:background 0.2s;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Profile</a>
          <a href="/continue-watching" style="display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:0.75rem;color:var(--text-secondary);border-radius:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Continue Watching</a>
          <a href="/watchlist" style="display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:0.75rem;color:var(--text-secondary);border-radius:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Watchlist</a>
          <a href="/stats" style="display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:0.75rem;color:var(--text-secondary);border-radius:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> Stats</a>
          <a href="/settings" style="display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:0.75rem;color:var(--text-secondary);border-radius:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Settings</a>
          <a href="#" id="btnLogout" style="display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:0.75rem;color:var(--text-secondary);border-radius:6px;margin-top:4px;border-top:1px solid var(--border-subtle);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Logout</a>
        </div>
      </div>
    </header>

    <!-- Mobile menu overlay -->
    <div class="mobile-menu-overlay" id="mobileOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:399;display:none;"></div>
    <div class="mobile-menu" id="mobileMenu" style="position:fixed;top:0;left:0;width:280px;height:100vh;background:var(--bg-header);z-index:400;padding:20px;transform:translateX(-100%);transition:transform 0.3s ease;overflow-y:auto;border-right:1px solid var(--border-medium);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <span style="font-family:var(--font-title);font-size:1.1rem;color:#fff;">◈ Muvix‑VQ</span>
        <span id="mobileClose" style="font-size:1.4rem;cursor:pointer;color:#fff;">&times;</span>
      </div>
      <a href="/" style="display:block;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">Home</a>
      <div class="mobile-dropdown-trigger" style="cursor:pointer;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">Genre ▾<div class="mobile-dropdown-content" id="mobileGenreDropdown" style="display:none;padding-left:12px;columns:2;"></div></div>
      <div class="mobile-dropdown-trigger" style="cursor:pointer;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">Country ▾<div class="mobile-dropdown-content" id="mobileCountryDropdown" style="display:none;padding-left:12px;columns:2;"></div></div>
      <a href="/search?type=anime" style="display:block;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">Anime</a>
      <a href="/search?type=movie" style="display:block;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">Movies</a>
      <a href="/search?type=tv-show" style="display:block;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">TV Shows</a>
      <a href="/search?q=ongoing" style="display:block;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">Ongoing</a>
      <a href="/search?q=new+releases" style="display:block;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">Updates</a>
      <a href="#" style="display:block;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">News</a>
      <a href="#" style="display:block;padding:10px 14px;font-size:0.9rem;color:#fff;border-radius:6px;">Forum</a>
    </div>
  `;

  /* ========== FOOTER HTML ========== */
  const footerHTML = `
    <footer class="site-footer" style="background:var(--bg-header);padding:28px 16px;margin-top:50px;border-top:1px solid var(--border-subtle);display:flex;flex-wrap:wrap;gap:20px;justify-content:space-between;align-items:flex-start;">
      <div class="footer-left" style="flex:1;min-width:250px;">
        <div class="footer-logo" style="font-family:var(--font-title);font-size:1.4rem;color:#fff;margin-bottom:6px;">◈ Muvix‑VQ</div>
        <p class="footer-desc" style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">Your ultimate streaming destination for anime, movies & TV.</p>
        <div class="footer-socials" style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
          <a href="https://t.me" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.41-.88.03-.24.37-.49 1.02-.74 4.01-1.75 6.68-2.9 8.01-3.45 3.81-1.59 4.61-1.86 5.12-1.87.11 0 .37.03.54.16.14.11.18.26.2.38.02.12.05.37.03.52z"/></svg></a>
          <a href="https://bsky.app" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 10.8..."/></svg></a>
          <a href="https://discord.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.317..."/></svg></a>
          <a href="https://x.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244..."/></svg></a>
          <a href="https://quora.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><text x="5" y="18" font-size="18" font-weight="700">Q</text></svg></a>
          <a href="https://tumblr.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M14.563..."/></svg></a>
        </div>
        <div class="footer-links" style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.7rem;">
          <a href="/" style="color:var(--text-muted);">Home</a><a href="#" style="color:var(--text-muted);">Blog</a>
          <a href="#" style="color:var(--text-muted);">Forum</a><a href="#" style="color:var(--text-muted);">Report</a>
          <a href="#" style="color:var(--text-muted);">Send Request</a>
          <a href="#" style="color:var(--text-muted);">Terms & Conditions</a>
          <a href="#" style="color:var(--text-muted);">Support</a>
        </div>
        <p class="footer-disclaimer" style="font-size:0.62rem;color:var(--text-muted);margin-top:6px;">This site does not store any files on its server. All contents are provided by non‑affiliated third parties.</p>
        <p class="footer-disclaimer" style="font-size:0.62rem;color:var(--text-muted);">Copyright © ${new Date().getFullYear()} AnimeKAI. All Rights Reserved</p>
      </div>
      <div class="footer-right">
        <img src="https://i.postimg.cc/hPqN8Q8v/Chisato-bow-Lycoris-Recoil-01-removebg-preview.png" alt="Mascot" style="height:180px;object-fit:contain;">
      </div>
    </footer>
  `;

  /* ========== LOGIN/REGISTRATION MODAL HTML ========== */
  const modalHTML = `
    <div class="modal-overlay" id="loginModalOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:600;display:none;align-items:center;justify-content:center;">
      <div class="modal-content" style="background:var(--bg-body);border:1px solid var(--border-medium);border-radius:var(--radius-lg);display:flex;max-width:700px;width:94%;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow-lg);position:relative;">
        <span class="modal-close" id="loginModalClose" style="position:absolute;top:12px;right:16px;font-size:1.4rem;cursor:pointer;color:#cbd5e1;z-index:5;">&times;</span>
        <div class="modal-img" style="flex:0 0 40%;background-size:cover;background-position:center;display:none;min-height:300px;" id="modalImg"></div>
        <div class="modal-form-wrap" style="flex:1;padding:24px 20px;display:flex;flex-direction:column;">
          <h2 id="loginModalTitle" style="font-family:var(--font-title);font-size:1.3rem;margin-bottom:8px;">Welcome back</h2>
          <p id="loginModalDesc" style="font-size:0.78rem;color:var(--text-muted);margin-bottom:16px;">Sign in to continue your journey</p>
          <!-- Login Form -->
          <form id="loginForm" style="display:flex;flex-direction:column;gap:10px;">
            <input type="text" id="loginUsername" placeholder="Username or email" required style="padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.85rem;">
            <input type="password" id="loginPassword" placeholder="Password" required style="padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.85rem;">
            <a id="forgotPasswordLink" style="font-size:0.68rem;color:var(--text-muted);text-align:right;cursor:pointer;">Forgot Password?</a>
            <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" style="margin:8px 0;"></div>
            <button type="submit" class="btn-submit" style="background:var(--btn-primary);color:#fff;border:none;padding:10px;border-radius:var(--radius-pill);font-weight:700;font-size:0.9rem;cursor:pointer;transition:background 0.2s;">Login</button>
          </form>
          <!-- Register Form -->
          <form id="registerForm" style="display:none;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
              <div id="avatarSelectFrame" style="width:64px;height:64px;border-radius:50%;border:2px dashed var(--border-medium);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;position:relative;">
                <img id="avatarPreview" src="https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/flower.jpg" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:none;">
                <span id="avatarPlaceholder" style="font-size:0.7rem;color:var(--text-muted);">+</span>
              </div>
              <div style="flex:1;">
                <input type="text" id="regUsername" placeholder="Username (max 12 chars)" maxlength="12" required style="width:100%;padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.85rem;">
              </div>
            </div>
            <input type="email" id="regEmail" placeholder="Email address" required style="padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.85rem;">
            <input type="password" id="regPassword" placeholder="Password (A1b!… max 20)" maxlength="20" required style="padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.85rem;">
            <input type="password" id="regConfirmPassword" placeholder="Confirm password" required style="padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.85rem;">
            <label style="display:flex;align-items:center;gap:6px;font-size:0.7rem;color:var(--text-muted);">
              <input type="checkbox" id="termsCheckbox" required> I agree to the <a href="/terms" target="_blank" style="color:var(--link-accent);">Terms & Conditions</a> and <a href="/privacy" target="_blank" style="color:var(--link-accent);">Privacy Policy</a>
            </label>
            <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" style="margin:8px 0;"></div>
            <button type="submit" class="btn-submit" style="background:var(--popup-btn);color:#fff;border:none;padding:10px;border-radius:var(--radius-pill);font-weight:700;font-size:0.9rem;cursor:pointer;">Create Account</button>
          </form>
          <!-- Password Reset Form -->
          <form id="resetForm" style="display:none;flex-direction:column;gap:10px;">
            <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;">Enter your email to receive a password reset link.</p>
            <input type="email" id="resetEmail" placeholder="Email address" required style="padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.85rem;">
            <button type="submit" class="btn-submit" style="background:var(--btn-primary);color:#fff;border:none;padding:10px;border-radius:var(--radius-pill);font-weight:700;font-size:0.9rem;cursor:pointer;">Reset Password</button>
          </form>
          <button id="googleSignInBtn" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#4285f4;color:#fff;border:none;padding:8px;border-radius:var(--radius-pill);font-weight:600;font-size:0.8rem;cursor:pointer;margin-top:12px;">
            <svg width="18" height="18" viewBox="-0.5 0 48 48"><path d="M9.8 24c0-1.5.3-3 .7-4.4L2.6 13.6C1.1 16.7.2 20.3.2 24s.9 7.3 2.4 10.4l7.9-6.1c-.4-1.3-.7-2.8-.7-4.3" fill="#FBBC05"/><path d="M23.7 10.1c3.3 0 6.3 1.2 8.7 3.1l6.8-6.8C35 2.8 29.7.5 23.7.5 14.4.5 6.4 5.8 2.6 13.6l7.9 6.1c1.8-5.5 7-9.6 13.2-9.6" fill="#EB4335"/><path d="M23.7 37.9c-6.2 0-11.4-4-13.2-9.7l-7.9 6.1c3.8 7.8 11.8 13.1 21.1 13.1 5.7 0 11.2-2 15.3-5.8l-7.5-5.8c-2.1 1.3-4.8 2-7.8 2" fill="#34A853"/><path d="M46.1 24c0-1.4-.2-2.9-.5-4.3H23.7v9h12.6c-.6 3.1-2.3 5.5-4.8 7l7.5 5.8c4.3-4 7.1-10 7.1-17.5" fill="#4285F4"/></svg>
            Continue with Google
          </button>
          <div class="form-switch" style="font-size:0.72rem;color:var(--text-muted);text-align:center;margin-top:12px;">
            <span id="switchToRegister">Don't have an account? <a style="color:var(--link-accent);cursor:pointer;">Sign up</a></span>
            <span id="switchToLogin" style="display:none;">Already have an account? <a style="color:var(--link-accent);cursor:pointer;">Sign in</a></span>
          </div>
          <div class="form-message" id="formMessage" style="font-size:0.72rem;color:var(--accent-gold);text-align:center;margin-top:6px;"></div>
        </div>
      </div>
    </div>

    <!-- Avatar selection pop-up -->
    <div class="modal-overlay" id="avatarModalOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:700;display:none;align-items:center;justify-content:center;">
      <div style="background:var(--bg-popup);border:1px solid var(--border-medium);border-radius:var(--radius-lg);padding:16px;max-width:400px;width:90%;max-height:70vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="font-size:0.9rem;color:#fff;">Choose Avatar</h3>
          <span id="avatarModalClose" style="cursor:pointer;font-size:1.2rem;color:#cbd5e1;">&times;</span>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <button id="uploadAvatarBtn" style="background:var(--btn-primary);color:#fff;border:none;padding:6px 12px;border-radius:var(--radius-pill);font-size:0.7rem;cursor:pointer;">Upload custom</button>
          <input type="file" id="avatarFileInput" accept="image/*" style="display:none;">
        </div>
        <div id="avatarGrid" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div>
      </div>
    </div>
  `;

  /* ========== INSERT HEADER, FOOTER, MODAL INTO PAGE ========== */
  document.addEventListener('DOMContentLoaded', () => {
    // Inject header
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    // Inject footer
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    // Inject modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Load Turnstile script if not present
    if (!document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Initialize all interactive elements
    initInteractions();
    updateUserUI();
  });

  /* ========== INITIALIZE EVERYTHING ========== */
  function initInteractions() {
    // Hamburger menu (mobile)
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileClose = document.getElementById('mobileClose');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.style.transform = 'translateX(0)';
        mobileOverlay.style.display = 'block';
      });
      mobileClose.addEventListener('click', closeMobileMenu);
      mobileOverlay.addEventListener('click', closeMobileMenu);
      function closeMobileMenu() {
        mobileMenu.style.transform = 'translateX(-100%)';
        mobileOverlay.style.display = 'none';
      }
    }

    // Desktop dropdowns hover
    document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
      const dropdown = trigger.querySelector('.nav-dropdown');
      if (!dropdown) return;
      trigger.addEventListener('mouseenter', () => { dropdown.style.display = 'grid'; });
      trigger.addEventListener('mouseleave', () => { dropdown.style.display = 'none'; });
    });

    // Mobile dropdown toggles
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        const content = trigger.querySelector('.mobile-dropdown-content');
        if (content) content.style.display = content.style.display === 'block' ? 'none' : 'block';
      });
    });

    // Populate genre & country dropdowns (same as before)
    populateDropdowns();

    // Search toggle
    let searchMode = 'non-anime';
    document.querySelectorAll('.search-toggle-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        this.parentElement.querySelectorAll('.search-toggle-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        searchMode = this.dataset.search;
      });
    });

    // Search input with live suggestions
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    let debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      const q = this.value.trim();
      if (q.length < 3) {
        searchSuggestions.style.display = 'none';
        return;
      }
      debounceTimer = setTimeout(() => fetchSearchSuggestions(q), 300);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search-wrap')) {
        searchSuggestions.style.display = 'none';
      }
    });

    // Login modal
    const loginModal = document.getElementById('loginModalOverlay');
    const btnLogin = document.getElementById('btnLogin');
    const loginModalClose = document.getElementById('loginModalClose');
    btnLogin.addEventListener('click', () => {
      loginModal.style.display = 'flex';
      showLoginForm();
    });
    loginModalClose.addEventListener('click', () => {
      loginModal.style.display = 'none';
    });
    loginModal.addEventListener('click', function (e) {
      if (e.target === this) this.style.display = 'none';
    });

    // Switch forms
    document.getElementById('switchToRegister').addEventListener('click', showRegisterForm);
    document.getElementById('switchToLogin').addEventListener('click', showLoginForm);
    document.getElementById('forgotPasswordLink').addEventListener('click', showResetForm);

    // Login submit
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('resetForm').addEventListener('submit', handlePasswordReset);

    // Google sign-in
    document.getElementById('googleSignInBtn').addEventListener('click', signInWithGoogle);

    // Avatar selection
    const avatarSelectFrame = document.getElementById('avatarSelectFrame');
    const avatarModalOverlay = document.getElementById('avatarModalOverlay');
    const avatarModalClose = document.getElementById('avatarModalClose');
    avatarSelectFrame.addEventListener('click', () => {
      avatarModalOverlay.style.display = 'flex';
      loadAvatarImages();
    });
    avatarModalClose.addEventListener('click', () => avatarModalOverlay.style.display = 'none');
    avatarModalOverlay.addEventListener('click', (e) => {
      if (e.target === avatarModalOverlay) avatarModalOverlay.style.display = 'none';
    });

    // Upload custom avatar
    document.getElementById('uploadAvatarBtn').addEventListener('click', () => {
      document.getElementById('avatarFileInput').click();
    });
    document.getElementById('avatarFileInput').addEventListener('change', handleAvatarUpload);

    // Logout button (in dropdown)
    document.getElementById('btnLogout').addEventListener('click', async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      updateUserUI();
      document.getElementById('profileDropdown').style.display = 'none';
    });
  }

  /* ========== SEARCH SUGGESTIONS ========== */
  async function fetchSearchSuggestions(query) {
    const sug = document.getElementById('searchSuggestions');
    sug.style.display = 'block';
    sug.innerHTML = '<div style="padding:14px;color:var(--text-muted);">Searching…</div>';

    try {
      let results = [];
      if (window.currentSearchMode === 'anime' || searchMode === 'anime') {
        const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        results = (data.data || []).map(a => ({
          id: `jikan-${a.mal_id}`,
          title: a.title_english || a.title,
          original_title: a.title_japanese || a.title,
          type: 'Anime',
          year: a.aired?.from ? new Date(a.aired.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '?',
          duration: a.duration || '?',
          score: a.score || '?',
          poster: a.images?.jpg?.image_url || '',
          url: `/details/jikan-${a.mal_id}`
        }));
      } else {
        const [moviesRes, tvRes] = await Promise.all([
          fetch(`${TMDB_PROXY}/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`),
          fetch(`${TMDB_PROXY}/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1`)
        ]);
        const movies = (await moviesRes.json()).results || [];
        const tvs = (await tvRes.json()).results || [];
        const mappedMovies = movies.slice(0, 4).map(i => ({
          id: `tmdb-movie-${i.id}`,
          title: i.title,
          original_title: i.original_title || i.title,
          type: 'Movie',
          year: i.release_date ? new Date(i.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '?',
          duration: '?', // would need another call, skip for speed
          score: i.vote_average || '?',
          poster: tmdbSmall(i.poster_path),
          url: `/details/tmdb-movie-${i.id}`
        }));
        const mappedTVs = tvs.slice(0, 2).map(i => ({
          id: `tmdb-tv-${i.id}`,
          title: i.name,
          original_title: i.original_name || i.name,
          type: 'TV',
          year: i.first_air_date ? new Date(i.first_air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '?',
          duration: '?',
          score: i.vote_average || '?',
          poster: tmdbSmall(i.poster_path),
          url: `/details/tmdb-tv-${i.id}`
        }));
        results = [...mappedMovies, ...mappedTVs].slice(0, 6);
      }

      if (results.length === 0) {
        sug.innerHTML = '<div style="padding:14px;color:var(--text-muted);">No results found.</div>';
      } else {
        sug.innerHTML = results.map(r => `
          <a href="${r.url}" style="display:flex;gap:10px;padding:10px 12px;cursor:pointer;transition:background 0.2s;align-items:center;text-decoration:none;color:inherit;" onmouseenter="this.style.background='var(--bg-surface)'" onmouseleave="this.style.background='none'">
            <img src="${r.poster}" alt="" style="width:36px;height:52px;object-fit:cover;border-radius:4px;flex-shrink:0;" onerror="this.style.display='none'">
            <div style="flex:1;min-width:0;">
              <div style="font-size:10px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.title}</div>
              <div style="font-size:9px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.original_title}</div>
              <div style="font-size:0.65rem;color:var(--text-muted);margin-top:2px;">${r.year} · ${r.type} · ${r.duration} · ⭐ ${r.score}</div>
            </div>
          </a>
        `).join('') + `
          <a href="/search?q=${encodeURIComponent(query)}" style="display:block;text-align:center;padding:8px;font-size:0.7rem;font-weight:600;color:var(--popup-btn);border-top:1px solid var(--border-subtle);">
            View All <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>`;
      }
    } catch (err) {
      sug.innerHTML = '<div style="padding:14px;color:var(--text-muted);">Failed to load results.</div>';
    }
  }

  /* ========== AUTH & FORMS ========== */
  function showLoginForm() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'none';
    document.getElementById('loginModalTitle').textContent = 'Welcome back';
    document.getElementById('loginModalDesc').textContent = 'Sign in to continue your journey';
    document.getElementById('switchToRegister').style.display = '';
    document.getElementById('switchToLogin').style.display = 'none';
    document.getElementById('formMessage').textContent = '';
  }

  function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'flex';
    document.getElementById('resetForm').style.display = 'none';
    document.getElementById('loginModalTitle').textContent = 'Join the community';
    document.getElementById('loginModalDesc').textContent = 'Create your account and start watching';
    document.getElementById('switchToRegister').style.display = 'none';
    document.getElementById('switchToLogin').style.display = '';
    document.getElementById('formMessage').textContent = '';
  }

  function showResetForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'flex';
    document.getElementById('loginModalTitle').textContent = 'Reset your password';
    document.getElementById('loginModalDesc').textContent = 'We’ll send a reset link to your email';
    document.getElementById('switchToRegister').style.display = 'none';
    document.getElementById('switchToLogin').style.display = 'none';
    document.getElementById('formMessage').textContent = '';
  }

  async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    // Check if username is email or username; for simplicity we use email login
    const { error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) {
      document.getElementById('formMessage').textContent = error.message;
    } else {
      document.getElementById('loginModalOverlay').style.display = 'none';
      updateUserUI();
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    if (password !== confirm) {
      document.getElementById('formMessage').textContent = 'Passwords do not match.';
      return;
    }
    if (!document.getElementById('termsCheckbox').checked) {
      document.getElementById('formMessage').textContent = 'You must accept the terms.';
      return;
    }
    const avatarUrl = document.getElementById('avatarPreview').src;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: avatarUrl || 'https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/flower.jpg'
        }
      }
    });
    if (error) {
      document.getElementById('formMessage').textContent = error.message;
    } else {
      document.getElementById('formMessage').textContent = 'Account created! Please check your email to confirm.';
      // Automatically sign in? No, need confirmation. Clear form.
      setTimeout(() => {
        document.getElementById('loginModalOverlay').style.display = 'none';
        showLoginForm();
      }, 2000);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      document.getElementById('formMessage').textContent = error.message;
    } else {
      document.getElementById('formMessage').textContent = 'If that email is registered, a reset link has been sent.';
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error('Google sign-in error:', error);
  }

  /* ========== AVATAR HANDLING ========== */
  async function loadAvatarImages() {
    const grid = document.getElementById('avatarGrid');
    grid.innerHTML = '<div style="color:var(--text-muted);font-size:0.7rem;">Loading…</div>';
    const { data, error } = await supabase.storage.from('Profile Images').list('', { limit: 30 });
    if (data) {
      const images = data.filter(f => !f.name.startsWith('.') && f.metadata);
      grid.innerHTML = images.map(file => {
        const url = `https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/${file.name}`;
        return `<img src="${url}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid transparent;transition:border 0.2s;" onmouseenter="this.style.border='2px solid var(--btn-primary)'" onmouseleave="this.style.border='2px solid transparent'" onclick="selectAvatar('${url}')">`;
      }).join('');
    } else {
      grid.innerHTML = '<div style="color:var(--text-muted);font-size:0.7rem;">No images found.</div>';
    }
  }

  window.selectAvatar = function (url) {
    document.getElementById('avatarPreview').src = url;
    document.getElementById('avatarPreview').style.display = 'block';
    document.getElementById('avatarPlaceholder').style.display = 'none';
    document.getElementById('avatarModalOverlay').style.display = 'none';
  };

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const { data, error } = await supabase.storage.from('Profile Images').upload(`user_${Date.now()}_${file.name}`, file);
    if (error) {
      alert('Upload failed: ' + error.message);
    } else {
      const url = `https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/${data.path}`;
      selectAvatar(url);
      loadAvatarImages(); // refresh grid
    }
  }

  /* ========== DROPDOWNS POPULATE ========== */
  function populateDropdowns() {
    const genres = [
      'Action','Adventure','Animation','Biography','Comedy','Crime','Documentary','Drama','Family','Fantasy','History','Horror','Music','Mystery','Romance','Sci-Fi','Sport','Thriller','War','Western','Shounen','Seinen','Shoujo','Josei','Mecha','Isekai','Slice of Life','Supernatural','Psychological','School','Yaoi','Yuri','Harem','Reverse Harem','Vampire','Zombie','Post-Apocalyptic','Cyberpunk','Steampunk','Space','Pirates','Ninja','Samurai','Martial Arts','Cooking','Gaming','Idol','Magical Girl','Demons','Ghost','Villainess','Reincarnation','Time Travel','Parallel World','Otome','Boys Love','Girls Love','Adult Cast','Anthropomorphic','CGDCT','Delinquents'
    ].sort();
    const countries = [
      'Japan','United States','South Korea','China','India','United Kingdom','France','Germany','Italy','Spain','Canada','Australia','Brazil','Mexico','Turkey','Thailand','Philippines','Indonesia','Malaysia','Singapore','Vietnam','Taiwan','Hong Kong','Pakistan','Bangladesh','Nigeria','South Africa','Egypt','Kenya','Argentina','Colombia','Chile','Peru','Venezuela','Russia','Ukraine','Poland','Netherlands','Belgium','Sweden','Norway','Denmark','Finland','Portugal','Greece','Czech Republic','Austria','Switzerland','Ireland','New Zealand','Saudi Arabia','UAE','Qatar','Kuwait','Israel','Iran','Iraq','Morocco','Ghana','Ethiopia'
    ].sort();

    const renderDropdown = (container, items, cols) => {
      const cont = document.getElementById(container);
      if (!cont) return;
      cont.style.display = 'grid';
      cont.style.gridTemplateColumns = `repeat(${cols},1fr)`;
      const perCol = Math.ceil(items.length / cols);
      cont.innerHTML = '';
      for (let c = 0; c < cols; c++) {
        const colDiv = document.createElement('div');
        colDiv.style.display = 'flex';
        colDiv.style.flexDirection = 'column';
        colDiv.style.gap = '2px';
        items.slice(c * perCol, (c + 1) * perCol).forEach(item => {
          const a = document.createElement('a');
          a.href = `/search?${container.includes('genre')?'genre':'country'}=${encodeURIComponent(item.toLowerCase())}`;
          a.textContent = item;
          a.style.padding = '4px 8px';
          a.style.fontSize = '0.7rem';
          a.style.color = 'var(--text-secondary)';
          a.style.borderRadius = '4px';
          a.onmouseenter = () => a.style.background = 'var(--popup-btn)';
          a.onmouseleave = () => a.style.background = 'none';
          colDiv.appendChild(a);
        });
        cont.appendChild(colDiv);
      }
      // mobile versions
      const mobileId = container === 'genreDropdown' ? 'mobileGenreDropdown' : 'mobileCountryDropdown';
      const mobileCont = document.getElementById(mobileId);
      if (mobileCont) {
        mobileCont.innerHTML = items.map(i => `<a href="/search?${container.includes('genre')?'genre':'country'}=${encodeURIComponent(i.toLowerCase())}" style="display:block;padding:5px 8px;font-size:0.7rem;color:var(--text-secondary);">${i}</a>`).join('');
      }
    };
    renderDropdown('genreDropdown', genres, 4);
    renderDropdown('countryDropdown', countries, 4);
  }

  /* ========== USER UI UPDATE ========== */
  async function updateUserUI() {
    const { data: { user } } = await supabase.auth.getUser();
    const btnLogin = document.getElementById('btnLogin');
    const avatar = document.getElementById('userAvatar');
    const dropdown = document.getElementById('profileDropdown');
    if (user) {
      btnLogin.style.display = 'none';
      avatar.style.display = 'block';
      const avatarUrl = user.user_metadata?.avatar_url || 'https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/flower.jpg';
      avatar.src = avatarUrl;
      document.getElementById('dropdownAvatar').src = avatarUrl;
      document.getElementById('dropdownUserName').textContent = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    } else {
      btnLogin.style.display = '';
      avatar.style.display = 'none';
      dropdown.style.display = 'none';
    }
  }

  // Expose globals
  window.toggleProfileDropdown = function () {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  };

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-avatar') && !e.target.closest('#profileDropdown')) {
      const dropdown = document.getElementById('profileDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }
  });

  // Ensure search mode is global
  window.currentSearchMode = 'non-anime';
})();
