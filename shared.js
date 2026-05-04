// shared.js – injects header, footer, and all shared interactive logic
(function () {
  const SUPABASE_URL = 'https://msazwxqbyxctdnwqrreb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYXp3eHFieXhjdGRud3FycmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDkzMzYsImV4cCI6MjA5MzEyNTMzNn0.jfaA3HMRabWWPJkPGK34HM-suUhde_L9JEU0YfGkpLY';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ─── HEADER HTML ───────────────────────────────
  const headerHTML = `
    <header class="site-header" style="background:var(--bg-header);padding:8px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle);position:sticky;top:0;z-index:200;min-height:54px;">
      <div class="hamburger" id="hamburgerBtn"><span></span><span></span><span></span></div>
      <a href="/" class="header-logo" style="flex-shrink:0;font-family:var(--font-title);font-size:1.35rem;color:#fff;display:flex;align-items:center;gap:6px;cursor:pointer;">
        <img src="" alt="logo" id="siteLogo" style="width:28px;height:28px;"> ◈ Muvix‑VQ
      </a>
      <nav class="main-nav" id="mainNav" style="display:flex;align-items:center;gap:2px;flex-shrink:0;">
        <a href="/" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;position:relative;">Home</a>
        <div class="nav-dropdown-trigger" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">Genre ▾<div class="nav-dropdown" id="genreDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:520px;grid-template-columns:repeat(4,1fr);gap:4px;z-index:300;">
        <a href="/genre/action" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Action</a>
<a href="/genre/adventure" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Adventure</a>
<a href="/genre/animation" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Animation</a>
<a href="/genre/apocalyptic" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Apocalyptic</a>
<a href="/genre/avant-garde" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Avant Garde</a>
<a href="/genre/biography" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Biography</a>
<a href="/genre/boys-love" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Boys Love</a>
<a href="/genre/comedy" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Comedy</a>
<a href="/genre/cult" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Cult</a>
<a href="/genre/demons" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Demons</a>
<a href="/genre/documentary" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Documentary</a>
<a href="/genre/drama" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Drama</a>
<a href="/genre/ecchi" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Ecchi</a>
<a href="/genre/family" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Family</a>
<a href="/genre/fantasy" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Fantasy</a>
<a href="/genre/film-noir" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Film-Noir</a>
<a href="/genre/girls-love" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Girls Love</a>
<a href="/genre/gourmet" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Gourmet</a>
<a href="/genre/harem" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Harem</a>
<a href="/genre/horror" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Horror</a>
<a href="/genre/isekai" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Isekai</a>
<a href="/genre/iyashikei" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Iyashikei</a>
<a href="/genre/josei" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Josei</a>
<a href="/genre/kids" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Kids</a>
<a href="/genre/kodomomuke" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Kodomomuke</a>
<a href="/genre/magic" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Magic</a>
<a href="/genre/mahou-shoujo" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Mahou Shoujo</a>
<a href="/genre/martial-arts" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Martial Arts</a>
<a href="/genre/mecha" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Mecha</a>
<a href="/genre/military" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Military</a>
<a href="/genre/music" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Music</a>
<a href="/genre/music-musical" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Music &amp; Musical</a>
<a href="/genre/mystery" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Mystery</a>
<a href="/genre/parody" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Parody</a>
<a href="/genre/psychological" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Psychological</a>
<a href="/genre/reverse-harem" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Reverse Harem</a>
<a href="/genre/rom-com" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Rom-Com</a>
<a href="/genre/romance" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Romance</a>
<a href="/genre/school" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">School</a>
<a href="/genre/sci-fi" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Sci-Fi</a>
<a href="/genre/seinen" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Seinen</a>
<a href="/genre/shoujo" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Shoujo</a>
<a href="/genre/shounen" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Shounen</a>
<a href="/genre/slice-of-life" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Slice of Life</a>
<a href="/genre/space" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Space</a>
<a href="/genre/sports" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Sports</a>
<a href="/genre/super-power" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Super Power</a>
<a href="/genre/supernatural" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Supernatural</a>
<a href="/genre/suspense" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Suspense</a>
<a href="/genre/thriller" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Thriller</a>
<a href="/genre/vampire" class="genre-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Vampire</a>
        </div></div>
           <div class="nav-dropdown-trigger" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">Country ▾<div class="nav-dropdown" id="countryDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:520px;grid-template-columns:repeat(4,1fr);gap:4px;z-index:300;">
           <a href="/country/argentina" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Argentina</a>
<a href="/country/australia" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Australia</a>
<a href="/country/austria" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Austria</a>
<a href="/country/belgium" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Belgium</a>
<a href="/country/brazil" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Brazil</a>
<a href="/country/canada" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Canada</a>
<a href="/country/china" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">China</a>
<a href="/country/colombia" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Colombia</a>
<a href="/country/czech-republic" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Czech Republic</a>
<a href="/country/denmark" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Denmark</a>
<a href="/country/finland" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Finland</a>
<a href="/country/france" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">France</a>
<a href="/country/germany" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Germany</a>
<a href="/country/hong-kong" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Hong Kong</a>
<a href="/country/hungary" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Hungary</a>
<a href="/country/india" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">India</a>
<a href="/country/ireland" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Ireland</a>
<a href="/country/israel" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Israel</a>
<a href="/country/italy" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Italy</a>
<a href="/country/japan" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Japan</a>
<a href="/country/luxembourg" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Luxembourg</a>
<a href="/country/mexico" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Mexico</a>
<a href="/country/netherlands" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Netherlands</a>
<a href="/country/new-zealand" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">New Zealand</a>
<a href="/country/nigeria" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Nigeria</a>
<a href="/country/norway" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Norway</a>
<a href="/country/philippines" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Philippines</a>
<a href="/country/poland" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Poland</a>
<a href="/country/romania" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Romania</a>
<a href="/country/russia" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Russia</a>
<a href="/country/south-africa" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">South Africa</a>
<a href="/country/south-korea" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">South Korea</a>
<a href="/country/spain" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Spain</a>
<a href="/country/sweden" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Sweden</a>
<a href="/country/switzerland" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Switzerland</a>
<a href="/country/taiwan" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Taiwan</a>
<a href="/country/thailand" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Thailand</a>
<a href="/country/turkey" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Turkey</a>
<a href="/country/united-kingdom" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">United Kingdom</a>
<a href="/country/united-states" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">United States</a>
           </div></div>
  <div class="nav-dropdown-trigger nav-link-item" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">
    Type ▾
    <div class="nav-dropdown" id="typeDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:160px;z-index:300;">
      <a href="/type/anime" class="nav-link-item" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Anime</a>
      <a href="/type/drama" class="nav-link-item" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Drama</a>
      <a href="/type/movie" class="nav-link-item" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Movie</a>
      <a href="/type/tv-show" class="nav-link-item" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">TV Show</a>
    </div>
  </div>

  <a href="/status/ongoing" class="nav-link-item" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Ongoing</a>
  <a href="/search?q=new+releases" class="nav-link-item" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Updates</a>
  <a href="#" class="nav-link-item" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">News</a>
  <a href="#" class="nav-link-item" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Forum</a>

      </nav>
      <div class="header-search-wrap" style="flex:1;max-width:340px;margin:0 8px;position:relative;">
        <div class="header-search-bar" style="display:flex;align-items:center;background:var(--bg-surface);border:1px solid var(--border-medium);border-radius:50px;overflow:hidden;">
          <div class="search-toggle-tabs" style="display:flex;padding:4px 4px;gap:2px;">
            <span class="search-toggle-tab active" data-search="non-anime" style="padding:4px 8px;font-size:0.62rem;font-weight:600;border-radius:50px;cursor:pointer;color:var(--text-muted);white-space:nowrap;">Non-Anime</span>
            <span class="search-toggle-tab" data-search="anime" style="padding:4px 8px;font-size:0.62rem;font-weight:600;border-radius:50px;cursor:pointer;color:var(--text-muted);white-space:nowrap;">Anime</span>
          </div>
          <input type="text" id="searchInput" placeholder="Search shows..." autocomplete="off" style="flex:1;padding:9px 6px;background:transparent;border:none;color:#fff;font-size:0.8rem;min-width:60px;">
        </div>
        <div class="search-suggestions" id="searchSuggestions" style="display:none;position:absolute;top:110%;left:0;right:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;max-height:400px;overflow-y:auto;z-index:350;"></div>
      </div>
      <div class="header-socials" style="display:flex;gap:6px;flex-shrink:0;">
        <a href="https://discord.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317..."/></svg></a>
        <a href="https://tumblr.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14.563..."/></svg></a>
        <a href="https://bsky.app" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12..."/></svg></a>
        <a href="https://x.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244..."/></svg></a>
      </div>
      <button class="btn-login" id="btnLogin" style="padding:8px 16px;background:var(--btn-primary);color:#fff;border-radius:50px;font-weight:600;font-size:0.75rem;border:none;cursor:pointer;white-space:nowrap;">Sign In</button>
      <img class="user-avatar" id="userAvatar" src="" alt="Profile" style="display:none;width:34px;height:34px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid var(--btn-primary);" onclick="toggleProfileDropdown()">
      <div class="profile-dropdown" id="profileDropdown" style="display:none;position:absolute;top:100%;right:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;min-width:150px;padding:8px;z-index:350;">
        <a href="/profile" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);">Profile</a>
        <a href="/continue-watching" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);">Continue Watching</a>
        <a href="/watchlist" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);">Watchlist</a>
        <a href="/settings" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);">Settings</a>
        <a href="#" id="btnLogout" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);">Logout</a>
      </div>
    </header>
  `;

  // ─── FOOTER HTML ───────────────────────────────
  const footerHTML = `
    <footer class="site-footer" style="background:var(--bg-header);padding:28px 16px;margin-top:50px;border-top:1px solid var(--border-subtle);display:flex;flex-wrap:wrap;gap:20px;justify-content:space-between;align-items:flex-start;">
      <div class="footer-left" style="flex:1;min-width:250px;">
        <div class="footer-logo" style="font-family:var(--font-title);font-size:1.4rem;color:#fff;margin-bottom:6px;">◈ AniOcean</div>
        <p class="footer-desc" style="font-size:0.90rem;color:var(--text-muted);margin-bottom:8px;">Stream free anime, movies, and TV shows on Aniocean. Enjoy fast, high-quality streaming with multi-language subtitles and real-time updates. Watch now!</p>
        <div class="footer-socials" style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;"><p class="footer-desc" style="font-size:0.90rem;color:#fff;margin-bottom:8px;">Follow us!</p>
          <a href="https://t.me" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg fill="currentColor" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" xml:space="preserve" width="23px" height="23px"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:none;} </style> <path d="M19.2,4.4L2.9,10.7c-1.1,0.4-1.1,1.1-0.2,1.3l4.1,1.3l1.6,4.8c0.2,0.5,0.1,0.7,0.6,0.7c0.4,0,0.6-0.2,0.8-0.4 c0.1-0.1,1-1,2-2l4.2,3.1c0.8,0.4,1.3,0.2,1.5-0.7l2.8-13.1C20.6,4.6,19.9,4,19.2,4.4z M17.1,7.4l-7.8,7.1L9,17.8L7.4,13l9.2-5.8 C17,6.9,17.4,7.1,17.1,7.4z"></path> <rect y="0" class="st0" width="24" height="24"></rect> </g></svg></a>
          <a href="https://bsky.app" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg width="23px" height="23px" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 1H0V5C0 6.65685 1.34315 8 3 8L2.03553 8.96447C1.37249 9.62751 1 10.5268 1 11.4645C1 13.4171 2.58291 15 4.53553 15C5.47322 15 6.37249 14.6275 7.03553 13.9645L8 13L8.96447 13.9645C9.62751 14.6275 10.5268 15 11.4645 15C13.4171 15 15 13.4171 15 11.4645C15 10.5268 14.6275 9.62751 13.9645 8.96447L13 8C14.6569 8 16 6.65685 16 5V1H13L8 6L3 1Z" fill="#000000"></path> </g></svg></a>
          <a href="https://discord.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg width="23px" height="23px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.59 5.88997C17.36 5.31997 16.05 4.89997 14.67 4.65997C14.5 4.95997 14.3 5.36997 14.17 5.69997C12.71 5.47997 11.26 5.47997 9.83001 5.69997C9.69001 5.36997 9.49001 4.95997 9.32001 4.65997C7.94001 4.89997 6.63001 5.31997 5.40001 5.88997C2.92001 9.62997 2.25001 13.28 2.58001 16.87C4.23001 18.1 5.82001 18.84 7.39001 19.33C7.78001 18.8 8.12001 18.23 8.42001 17.64C7.85001 17.43 7.31001 17.16 6.80001 16.85C6.94001 16.75 7.07001 16.64 7.20001 16.54C10.33 18 13.72 18 16.81 16.54C16.94 16.65 17.07 16.75 17.21 16.85C16.7 17.16 16.15 17.42 15.59 17.64C15.89 18.23 16.23 18.8 16.62 19.33C18.19 18.84 19.79 18.1 21.43 16.87C21.82 12.7 20.76 9.08997 18.61 5.88997H18.59ZM8.84001 14.67C7.90001 14.67 7.13001 13.8 7.13001 12.73C7.13001 11.66 7.88001 10.79 8.84001 10.79C9.80001 10.79 10.56 11.66 10.55 12.73C10.55 13.79 9.80001 14.67 8.84001 14.67ZM15.15 14.67C14.21 14.67 13.44 13.8 13.44 12.73C13.44 11.66 14.19 10.79 15.15 10.79C16.11 10.79 16.87 11.66 16.86 12.73C16.86 13.79 16.11 14.67 15.15 14.67Z" fill="currentColor"></path> </g></svg></a>
          <a href="https://x.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg width="23px" height="23px" viewBox="0 -2 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>twitter [#154]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-60.000000, -7521.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M10.29,7377 C17.837,7377 21.965,7370.84365 21.965,7365.50546 C21.965,7365.33021 21.965,7365.15595 21.953,7364.98267 C22.756,7364.41163 23.449,7363.70276 24,7362.8915 C23.252,7363.21837 22.457,7363.433 21.644,7363.52751 C22.5,7363.02244 23.141,7362.2289 23.448,7361.2926 C22.642,7361.76321 21.761,7362.095 20.842,7362.27321 C19.288,7360.64674 16.689,7360.56798 15.036,7362.09796 C13.971,7363.08447 13.518,7364.55538 13.849,7365.95835 C10.55,7365.79492 7.476,7364.261 5.392,7361.73762 C4.303,7363.58363 4.86,7365.94457 6.663,7367.12996 C6.01,7367.11125 5.371,7366.93797 4.8,7366.62489 L4.8,7366.67608 C4.801,7368.5989 6.178,7370.2549 8.092,7370.63591 C7.488,7370.79836 6.854,7370.82199 6.24,7370.70483 C6.777,7372.35099 8.318,7373.47829 10.073,7373.51078 C8.62,7374.63513 6.825,7375.24554 4.977,7375.24358 C4.651,7375.24259 4.325,7375.22388 4,7375.18549 C5.877,7376.37088 8.06,7377 10.29,7376.99705" id="twitter-[#154]"> </path> </g> </g> </g> </g></svg></a>
          <a href="https://quora.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="23" height="23"><text x="5" y="18" font-size="18" font-weight="700">Q</text></svg></a>
          <a href="https://tumblr.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="23px" height="23px" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="7935ec95c421cee6d86eb22ecd12e94e"> <path style="display: inline;" d="M412.904,405.777c0.123-0.088,0.225-0.213,0.324-0.313v0.313v89.785 c-17.043,9.107-31.264,15.932-105.418,15.932c-10.729,0-20.66-0.074-31.713,0c-48.542,0.324-119.016-13.697-119.016-92.305v-185.1 v-22.767h-58.31v-84.222H109.5c17.278,0,33.491-6.362,47.582-17.44c8.745-6.862,16.623-15.606,23.447-25.774 c14.858-22.157,24.502-51.187,26.254-83.386h69.527v126.601h121.422v62.453v21.769H276.311v84.658v107.514 c0,10.779,36.314,26.859,62.775,26.859S391.496,419.414,412.904,405.777z"> </path> </g> </g></svg></a>
        </div>
        <div class="footer-links" style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.7rem;">
          <a href="/" style="color:#fff;">Home</a><a href="#" style="color:#fff;">Blog</a>
          <a href="#" style="color:#fff;">Forum</a><a href="#" style="color:#fff;">Report</a>
          <a href="#" style="color:#fff;">Send Request</a>
          <a href="#" style="color:#fff;">Terms & Conditions</a>
          <a href="#" style="color:#fff;">Support</a>
        </div>
        <p class="footer-disclaimer" style="font-size:0.69rem;color:var(--text-muted);margin-top:6px;">This site does not store any files on its server. All contents are provided by non‑affiliated third parties.</p>
        <p class="footer-disclaimer" style="font-size:0.67rem;color:var(--text-muted);">Copyright © ${new Date().getFullYear()} AniOcean. All Rights Reserved</p>
      </div>
      <div class="footer-right">
        <img src="https://i.postimg.cc/hPqN8Q8v/Chisato-bow-Lycoris-Recoil-01-removebg-preview.png" alt="Mascot" style="height:100%;  width:auto; object-fit:contain;">
      </div>
    </footer>
  `;

  // ─── INSERT INTO PAGE ──────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Inject header at beginning of body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Inject footer at end of body
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // ─── NOW BIND ALL INTERACTIVITY (events, dropdowns, auth) ───
    initHeaderInteractions();
    updateUserUI();
  });

  // ─── INTERACTIVE LOGIC ─────────────────────────
  function initHeaderInteractions() {
    // Hamburger (mobile) – simple placeholder, you can expand
    const hamburger = document.getElementById('hamburgerBtn');
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        alert('Mobile menu – implement as needed');
      });
    }

    // Dropdown hover
    document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
      const dropdown = trigger.querySelector('.nav-dropdown');
      if (!dropdown) return;
      trigger.addEventListener('mouseenter', () => { dropdown.style.display = 'grid'; });
      trigger.addEventListener('mouseleave', () => { dropdown.style.display = 'none'; });
    });

    // Search toggle tabs
    document.querySelectorAll('.search-toggle-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        this.parentElement.querySelectorAll('.search-toggle-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        window.currentSearchMode = this.dataset.search;
      });
    });

    // Search suggestions (simple mock – use your existing fetchSuggestions)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const q = this.value.trim();
        const sug = document.getElementById('searchSuggestions');
        if (q.length < 3) { sug.style.display = 'none'; return; }
        sug.style.display = 'block';
        sug.innerHTML = `<div style="padding:14px;color:var(--text-muted);">Search for "${q}"…</div>`;
        // (You can plug in the full fetchSuggestions logic from the homepage)
      });
      document.addEventListener('click', (e) => {
        const sug = document.getElementById('searchSuggestions');
        if (!e.target.closest('.header-search-wrap')) sug.style.display = 'none';
      });
    }

    // Login modal (assuming you have a global modal or include it here)
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin) btnLogin.addEventListener('click', () => {
      // Your login modal open logic – call existing function or inline
      if (typeof openLoginModal === 'function') openLoginModal();
      else alert('Login modal should be implemented');
    });

    // User avatar dropdown
    window.toggleProfileDropdown = function () {
      const dropdown = document.getElementById('profileDropdown');
      if (dropdown) dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    };
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-avatar') && !e.target.closest('#profileDropdown')) {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.style.display = 'none';
      }
    });

    // Logout button
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      updateUserUI();
      document.getElementById('profileDropdown').style.display = 'none';
    });
  }

  async function updateUserUI() {
    const { data: { user } } = await supabase.auth.getUser();
    const btnLogin = document.getElementById('btnLogin');
    const avatar = document.getElementById('userAvatar');
    if (user) {
      btnLogin.style.display = 'none';
      avatar.style.display = 'block';
      avatar.src = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=2b6cb0&color=fff`;
    } else {
      btnLogin.style.display = '';
      avatar.style.display = 'none';
    }
  }

  // Expose auth helpers globally so pages can use them
  window.supabase = supabase;
  window.signInWithGoogle = async () => {
    await supabase.auth.signIn({ provider: 'google' });
  };
})();
