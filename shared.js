// shared.js – Inject header, footer, search, login, and all shared logic
(function () {
  const SUPABASE_URL = 'https://msazwxqbyxctdnwqrreb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYXp3eHFieXhjdGRud3FycmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDkzMzYsImV4cCI6MjA5MzEyNTMzNn0.jfaA3HMRabWWPJkPGK34HM-suUhde_L9JEU0YfGkpLY';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Turnstile site key (replace with your actual key)
  const TURNSTILE_SITE_KEY = '0x4AAAAAADHwF4HZ8mJhe0yRQeNHRG-xyWk';

  // Default profile image
  const DEFAULT_AVATAR = 'https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/flower.jpg';

  // TMDB and Jikan endpoints (reuse from homepage)
  const TMDB_PROXY = 'https://aniocen.bionmovies47.workers.dev';
  const JIKAN_BASE = 'https://api.jikan.moe/v4';
  let searchMode = 'non-anime'; // default

  // ─── HEADER HTML ───────────────────────────────
  const headerHTML = `
    <header class="site-header" id="siteHeader">
      <div class="hamburger" id="hamburgerBtn">
        <span></span><span></span><span></span>
      </div>
      <a href="/" class="header-logo">
        <img src="https://i.postimg.cc/X7d0fPtJ/1778142012237-removebg-preview.png" alt="logo" id="siteLogo">
      </a>
      <nav class="main-nav" id="mainNav">
        <a href="/" class="nav-link">Home</a>
        <div class="nav-dropdown-trigger">
          Genre ▾
          <div class="nav-dropdown" id="genreDropdown">
            <a href="/genre/action" class="genre-link">Action</a>
            <a href="/genre/adventure" class="genre-link">Adventure</a>
            <!-- add all other genre links -->
          </div>
        </div>
        <div class="nav-dropdown-trigger">
          Country ▾
          <div class="nav-dropdown" id="countryDropdown">
            <a href="/country/japan" class="country-link">Japan</a>
            <a href="/country/south-korea" class="country-link">South Korea</a>
            <!-- add all other country links -->
          </div>
        </div>
        <div class="nav-dropdown-trigger">
          Type ▾
          <div class="nav-dropdown" id="typeDropdown">
            <a href="/type/anime" class="nav-link-item">Anime</a>
            <a href="/type/drama" class="nav-link-item">Drama</a>
            <a href="/type/movie" class="nav-link-item">Movie</a>
            <a href="/type/tv-show" class="nav-link-item">TV Show</a>
          </div>
        </div>
        <a href="/status/ongoing" class="nav-link">Ongoing</a>
        <a href="/search?q=new+releases" class="nav-link">Updates</a>
        <a href="#" class="nav-link">News</a>
        <a href="#" class="nav-link">Forum</a>
      </nav>
      <div class="header-search-wrap" id="desktopSearchWrap">
        <div class="header-search-bar">
          <div class="search-toggle-tabs">
            <span class="search-toggle-tab active" data-search="non-anime">Non-Anime</span>
            <span class="search-toggle-tab" data-search="anime">Anime</span>
          </div>
          <input type="text" id="searchInput" placeholder="Search shows..." autocomplete="off">
        </div>
        <div class="search-suggestions" id="searchSuggestions"></div>
      </div>
      <div class="header-socials">
        <a href="https://discord.com" target="_blank" title="Discord"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317..."/></svg></a>
        <a href="https://tumblr.com" target="_blank" title="Tumblr"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14.563..."/></svg></a>
        <a href="https://bsky.app" target="_blank" title="Bluesky"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12..."/></svg></a>
        <a href="https://x.com" target="_blank" title="X"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244..."/></svg></a>
      </div>
      <button class="btn-login" id="btnLogin">Sign In</button>
      <img class="user-avatar" id="userAvatar" src="" alt="Profile" onclick="toggleProfileDropdown()">
      <div class="profile-dropdown" id="profileDropdown">
        <div class="profile-header">
          <img id="dropAvatar" src="" alt="avatar">
          <span id="dropUsername"></span>
        </div>
        <a href="/profile"><span class="icon">👤</span> My Profile</a>
        <a href="/continue-watching"><span class="icon">▶️</span> Continue Watching</a>
        <a href="/watchlist"><span class="icon">📋</span> Watchlist</a>
        <a href="/stats"><span class="icon">📊</span> Stats</a>
        <a href="/settings"><span class="icon">⚙️</span> Settings</a>
        <a href="#" id="btnLogout"><span class="icon">🚪</span> Sign Out</a>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" id="mobileOverlay"></div>
    <div class="mobile-menu" id="mobileMenu">
      <span class="mobile-close" id="mobileClose">&times;</span>
      <a href="/">Home</a>
      <div class="mobile-dropdown">
        <div class="mobile-dropdown-trigger">Genre ▾</div>
        <div class="mobile-dropdown-content" id="mobileGenreDropdown">
          <!-- dynamically filled with genres in 2 columns -->
        </div>
      </div>
      <div class="mobile-dropdown">
        <div class="mobile-dropdown-trigger">Country ▾</div>
        <div class="mobile-dropdown-content" id="mobileCountryDropdown">
          <!-- dynamically filled with countries in 2 columns -->
        </div>
      </div>
      <div class="mobile-dropdown">
        <div class="mobile-dropdown-trigger">Type ▾</div>
        <div class="mobile-dropdown-content">
          <a href="/type/anime">Anime</a>
          <a href="/type/drama">Drama</a>
          <a href="/type/movie">Movie</a>
          <a href="/type/tv-show">TV Show</a>
        </div>
      </div>
      <a href="/status/ongoing">Ongoing</a>
      <a href="/search?q=new+releases">Updates</a>
      <a href="#">News</a>
      <a href="#">Forum</a>
    </div>

    <!-- Search bar for mobile (hidden by default) -->
    <div class="mobile-search-container" id="mobileSearchContainer">
      <div class="header-search-bar">
        <div class="search-toggle-tabs">
          <span class="search-toggle-tab active" data-search="non-anime">Non-Anime</span>
          <span class="search-toggle-tab" data-search="anime">Anime</span>
        </div>
        <input type="text" id="mobileSearchInput" placeholder="Search..." autocomplete="off">
      </div>
      <div class="search-suggestions" id="mobileSearchSuggestions"></div>
    </div>
  `;

  // ─── FOOTER HTML (unmodified from earlier, keep as is) ──
  const footerHTML = `...`; // same as before but with updated copyright

  // ─── LOGIN MODAL HTML ──────────────────────────
  const loginModalHTML = `
    <div class="modal-overlay" id="loginModalOverlay">
      <div class="modal-content">
        <div class="modal-img">
          <img src="https://i.postimg.cc/pr6CQhM8/e1223c0a1599b039da4ac536a39f0223.jpg" alt="Welcome">
        </div>
        <div class="modal-form-wrap">
          <span class="modal-close" id="loginModalClose">&times;</span>

          <!-- Login form -->
          <div id="loginFormPanel">
            <h2>Welcome Back!</h2>
            <form id="loginForm" onsubmit="handleLogin(event)">
              <input type="text" id="loginUsername" placeholder="Username" required>
              <input type="password" id="loginPassword" placeholder="Password" required>
              <a class="forgot-link" id="gotoForgotPassword">Forgot Password?</a>
              <div id="turnstileContainer"></div> <!-- Turnstile widget -->
              <button type="submit" class="btn-submit">Sign In</button>
            </form>
            <button class="btn-google" onclick="signInWithGoogle()">
              <svg viewBox="-0.5 0 48 48" width="20" height="20"><path .../></svg>
              Continue with Google
            </button>
            <p class="form-switch">Don't have an account? <a id="gotoSignUp">Sign Up</a></p>
          </div>

          <!-- Sign Up form -->
          <div id="signUpFormPanel" style="display:none;">
            <h2>Create Your Account</h2>
            <form id="signUpForm" onsubmit="handleSignUp(event)">
              <div class="avatar-selection" id="avatarSelection">
                <img id="selectedAvatar" src="${DEFAULT_AVATAR}" alt="Choose avatar">
                <button type="button" id="changeAvatarBtn">Choose Avatar</button>
              </div>
              <input type="text" id="regUsername" placeholder="Username (max 12 chars)" maxlength="12" required pattern="[A-Za-z0-9]+">
              <input type="email" id="regEmail" placeholder="Email address" required>
              <input type="password" id="regPassword" placeholder="Password (max 20 chars)" maxlength="20" required pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$">
              <input type="password" id="regConfirmPassword" placeholder="Confirm password" required>
              <label class="checkbox-label">
                <input type="checkbox" id="acceptTerms" required>
                I accept the <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.
              </label>
              <div id="signupTurnstileContainer"></div>
              <button type="submit" class="btn-submit">Sign Up</button>
            </form>
            <p class="form-switch">Already have an account? <a id="gotoLogin">Sign In</a></p>
          </div>

          <!-- Forgot Password form -->
          <div id="forgotPasswordPanel" style="display:none;">
            <h2>Reset Your Password</h2>
            <form id="forgotPasswordForm" onsubmit="handleForgotPassword(event)">
              <input type="email" id="forgotEmail" placeholder="Enter your email" required>
              <button type="submit" class="btn-submit">Send Reset Link</button>
            </form>
            <p class="form-switch"><a id="backToLogin">Back to Sign In</a></p>
          </div>

          <div class="form-message" id="formMessage"></div>
        </div>
      </div>
    </div>

    <!-- Avatar selection popup (hidden by default) -->
    <div class="popup-overlay" id="avatarPopupOverlay">
      <div class="popup-card" id="avatarPopupCard">
        <span class="popup-close" id="avatarPopupClose">&times;</span>
        <h3>Choose your avatar</h3>
        <div class="avatar-grid" id="avatarGrid">
          <!-- fetched avatars will appear here -->
        </div>
        <label class="upload-avatar-btn">
          <input type="file" id="avatarUpload" accept="image/*" style="display:none;">
          Upload Your Own
        </label>
      </div>
    </div>
  `;

  // ─── INSERT ALL HTML (head, footer, modal) ─────
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    document.body.insertAdjacentHTML('beforeend', loginModalHTML);

    // Load Turnstile script dynamically
    if (!document.querySelector('script[src*="turnstile"]')) {
      const tsScript = document.createElement('script');
      tsScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
      tsScript.async = true;
      tsScript.defer = true;
      document.head.appendChild(tsScript);
    }

    // Initialize all interactive elements
    initHeaderInteractions();
    updateUserUI();
    loadGenreAndCountryLinks();
  });

  // ─── SEARCH FUNCTIONALITY ────────────────────
  function setupSearch(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const sug = document.getElementById(suggestionsId);
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 3) { sug.innerHTML = ''; sug.classList.remove('active'); return; }
      debounceTimer = setTimeout(() => fetchAndRenderSuggestions(q, sug), 250);
    });
    // Hide suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest(`#${inputId}`) && !e.target.closest(`#${suggestionsId}`)) {
        sug.classList.remove('active');
      }
    });
    // Toggle tabs inside search bar
    const container = input.closest('.header-search-bar');
    if (container) {
      container.querySelectorAll('.search-toggle-tab').forEach(tab => {
        tab.addEventListener('click', function() {
          this.parentElement.querySelectorAll('.search-toggle-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          searchMode = this.dataset.search;
          // Clear suggestions if mode changed
          sug.innerHTML = '';
        });
      });
    }
  }

  async function fetchAndRenderSuggestions(query, sugElement) {
    let results = [];
    try {
      if (searchMode === 'anime') {
        const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=6&order_by=popularity`);
        const data = await res.json();
        results = (data.data || []).map(a => ({
          id: `jikan-${a.mal_id}`,
          title: a.title_english || a.title,
          original: a.title_japanese || a.title,
          poster: a.images?.jpg?.image_url || '',
          type: 'Anime',
          year: a.aired?.from?.slice(0,4) || '',
          airingDate: a.aired?.from ? new Date(a.aired.from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
          duration: a.duration || '?',
          score: a.score ? a.score.toFixed(1) : 'N/A'
        }));
      } else {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`${TMDB_PROXY}/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`),
          fetch(`${TMDB_PROXY}/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1`)
        ]);
        const movieData = await movieRes.json();
        const tvData = await tvRes.json();
        const movies = (movieData.results || []).slice(0, 3).map(i => ({
          id: `tmdb-movie-${i.id}`,
          title: i.title,
          original: i.original_title,
          poster: i.poster_path ? `https://image.tmdb.org/t/p/w185${i.poster_path}` : '',
          type: 'Movie',
          year: i.release_date?.slice(0,4) || '',
          airingDate: i.release_date ? new Date(i.release_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
          duration: '?', // can be fetched separately if needed
          score: i.vote_average ? i.vote_average.toFixed(1) : 'N/A'
        }));
        const tvs = (tvData.results || []).slice(0, 3).map(i => ({
          id: `tmdb-tv-${i.id}`,
          title: i.name,
          original: i.original_name,
          poster: i.poster_path ? `https://image.tmdb.org/t/p/w185${i.poster_path}` : '',
          type: 'TV',
          year: i.first_air_date?.slice(0,4) || '',
          airingDate: i.first_air_date ? new Date(i.first_air_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
          duration: '?',
          score: i.vote_average ? i.vote_average.toFixed(1) : 'N/A'
        }));
        results = [...movies, ...tvs].slice(0, 6);
      }
    } catch (e) {
      console.error('Search fetch error:', e);
    }

    // Render suggestions
    if (!results.length) {
      sugElement.innerHTML = '<div class="suggestion-empty">No results found</div>';
    } else {
      sugElement.innerHTML = results.map(item => `
        <a href="/details/${item.id}" class="search-suggestion-item">
          <img src="${item.poster}" alt="${item.title}" onerror="this.style.display='none'">
          <div class="suggestion-text">
            <div class="ss-title">${item.title}</div>
            <div class="ss-original">${item.original || ''}</div>
            <div class="ss-meta">${item.airingDate} | ${item.type} | ${item.duration} | ${item.score} (${searchMode === 'anime' ? 'MAL' : 'TMDB'})</div>
          </div>
        </a>
      `).join('');
    }
    // Add "View All" button
    sugElement.innerHTML += `<a href="/search?q=${encodeURIComponent(query)}" class="search-view-all">View All <span class="arrow">›</span></a>`;
    sugElement.classList.add('active');
  }

  // ─── DROPDOWNS & MOBILE MENU ──────────────────
  function initHeaderInteractions() {
    // ... hamburger toggle, mobile menu, dropdown hover, etc.
    // (abbreviated – similar to previous but with functional search and proper mobile menu behavior)
  }

  // ─── AUTH FLOWS ───────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    // verify Turnstile token
    const turnstileToken = document.getElementById('cf-turnstile-response')?.value;
    if (!turnstileToken) { showFormMessage('Please complete the security check.'); return; }
    // Login via Supabase (username corresponds to email or profile?)
    // We assume login is via email (username could be stored in profiles)
    // For simplicity, treat username as email
    const { error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error) showFormMessage(error.message);
    else {
      closeLoginModal();
      updateUserUI();
    }
  }

  // Sign up, forgot password, Google login, etc.
  // ...

  // ─── AVATAR SELECTION ─────────────────────────
  async function openAvatarPopup() {
    const { data: files, error } = await supabase.storage.from('Profile Images').list('', { limit: 50 });
    // ... fetch public URLs and display in grid
  }

  // ─── PROFILE DROPDOWN ─────────────────────────
  function toggleProfileDropdown() {
    document.getElementById('profileDropdown').classList.toggle('active');
  }

  // ─── INITIALIZATION ───────────────────────────
  window.supabase = supabase;
  window.signInWithGoogle = async () => {
    await supabase.auth.signIn({ provider: 'google' });
  };
})();
