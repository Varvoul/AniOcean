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
        <div class="nav-dropdown-trigger" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">Genre ▾<div class="nav-dropdown" id="genreDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:520px;grid-template-columns:repeat(4,1fr);gap:4px;z-index:300;"></div></div>
        <div class="nav-dropdown-trigger" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">Country ▾<div class="nav-dropdown" id="countryDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:520px;grid-template-columns:repeat(4,1fr);gap:4px;z-index:300;">
        <a href="/search?country=argentina" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Argentina</a>
<a href="/search?country=australia" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Australia</a>
<a href="/search?country=austria" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Austria</a>
<a href="/search?country=belgium" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Belgium</a>
<a href="/search?country=brazil" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Brazil</a>
<a href="/search?country=canada" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Canada</a>
<a href="/search?country=china" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">China</a>
<a href="/search?country=colombia" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Colombia</a>
<a href="/search?country=czech-republic" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Czech Republic</a>
<a href="/search?country=denmark" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Denmark</a>
<a href="/search?country=finland" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Finland</a>
<a href="/search?country=france" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">France</a>
<a href="/search?country=germany" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Germany</a>
<a href="/search?country=hong-kong" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Hong Kong</a>
<a href="/search?country=hungary" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Hungary</a>
<a href="/search?country=india" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">India</a>
<a href="/search?country=ireland" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Ireland</a>
<a href="/search?country=israel" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Israel</a>
<a href="/search?country=italy" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Italy</a>
<a href="/search?country=japan" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Japan</a>
<a href="/search?country=luxembourg" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Luxembourg</a>
<a href="/search?country=mexico" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Mexico</a>
<a href="/search?country=netherlands" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Netherlands</a>
<a href="/search?country=new-zealand" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">New Zealand</a>
<a href="/search?country=nigeria" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Nigeria</a>
<a href="/search?country=norway" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Norway</a>
<a href="/search?country=philippines" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Philippines</a>
<a href="/search?country=poland" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Poland</a>
<a href="/search?country=romania" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Romania</a>
<a href="/search?country=russia" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Russia</a>
<a href="/search?country=south-africa" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">South Africa</a>
<a href="/search?country=south-korea" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">South Korea</a>
<a href="/search?country=spain" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Spain</a>
<a href="/search?country=sweden" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Sweden</a>
<a href="/search?country=switzerland" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Switzerland</a>
<a href="/search?country=taiwan" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Taiwan</a>
<a href="/search?country=thailand" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Thailand</a>
<a href="/search?country=turkey" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Turkey</a>
<a href="/search?country=united-kingdom" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">United Kingdom</a>
<a href="/search?country=united-states" class="country-link" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">United States</a>
        </div></div>
  <div class="nav-dropdown-trigger nav-link-item" style="position:relative;cursor:pointer;padding:8px 10px;font-size:0.8rem;color:#fff;border-radius:6px;">
    Type ▾
    <div class="nav-dropdown" id="typeDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:160px;z-index:300;">
      <a href="/search?type=anime" class="nav-link-item" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Anime</a>
      <a href="/search?type=drama" class="nav-link-item" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Drama</a>
      <a href="/search?type=movie" class="nav-link-item" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">Movie</a>
      <a href="/search?type=tv-show" class="nav-link-item" style="display:block;padding:6px 10px;font-size:0.75rem;color:var(--text-secondary);">TV Show</a>
    </div>
  </div>

  <a href="/search?q=ongoing" class="nav-link-item" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Ongoing</a>
  <a href="/search?q=new+releases" class="nav-link-item" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Updates</a>
  <a href="#" class="nav-link-item" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">News</a>
  <a href="#" class="nav-link-item" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Forum</a>
</nav>
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
        <div class="footer-logo" style="font-family:var(--font-title);font-size:1.4rem;color:#fff;margin-bottom:6px;">◈ Muvix‑VQ</div>
        <p class="footer-desc" style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">Your ultimate streaming destination for anime, movies & TV.</p>
        <div class="footer-socials" style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
          <a href="https://t.me" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12..."/></svg></a>
          <a href="https://bsky.app" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12..."/></svg></a>
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
