(function () {
  // ═══════ SUPABASE CONFIG ═══════
  const SUPABASE_URL = 'https://msazwxqbyxctdnwqrreb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYXp3eHFieXhjdGRud3FycmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDkzMzYsImV4cCI6MjA5MzEyNTMzNn0.jfaA3HMRabWWPJkPGK34HM-suUhde_L9JEU0YfGkpLY';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ═══════ GLOBAL STATE ═══════
  let currentSearchMode = 'non-anime';  // 'anime' or 'non-anime'

  // ═══════ INJECT HEADER, FOOTER, LOGIN MODAL ═══════
  const headerHTML = `
    <header class="site-header" style="background:var(--bg-header);padding:8px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle);position:sticky;top:0;z-index:200;min-height:54px;flex-wrap:wrap;">
      <!-- Hamburger (mobile/tablet only) -->
      <div class="hamburger" id="hamburgerBtn" style="display:none;">
        <span></span><span></span><span></span>
      </div>
      <!-- Logo -->
      <a href="/" class="header-logo" style="flex-shrink:0;display:flex;align-items:center;gap:6px;">
        <img src="https://i.postimg.cc/X7d0fPtJ/1778142012237-removebg-preview.png" alt="logo" id="siteLogo" style="max-height:90px;max-width:170px;width:auto;height:auto;">
      </a>
      <!-- Desktop Navigation -->
      <nav class="main-nav" id="mainNav" style="display:flex;align-items:center;gap:2px;flex-shrink:1;">
        <a href="/" style="padding:8px 10px;font-size:0.8rem;font-weight:500;color:#fff;border-radius:6px;">Home</a>
        <!-- Genre Dropdown -->
        <div class="nav-dropdown-trigger" style="position:relative;padding:8px 10px;font-size:0.8rem;color:#fff;cursor:pointer;">Genre ▾
          <div class="nav-dropdown" id="genreDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:560px;grid-template-columns:repeat(4,1fr);gap:4px;z-index:300;">
            <!-- Pre-filled genres (alphabetical) -->
            <a href="/genre/action">Action</a><a href="/genre/adventure">Adventure</a><a href="/genre/animation">Animation</a>
            <a href="/genre/biography">Biography</a><a href="/genre/boys-love">Boys Love</a><a href="/genre/comedy">Comedy</a>
            <a href="/genre/crime">Crime</a><a href="/genre/documentary">Documentary</a><a href="/genre/drama">Drama</a>
            <a href="/genre/ecchi">Ecchi</a><a href="/genre/family">Family</a><a href="/genre/fantasy">Fantasy</a>
            <a href="/genre/girls-love">Girls Love</a><a href="/genre/harem">Harem</a><a href="/genre/horror">Horror</a>
            <a href="/genre/isekai">Isekai</a><a href="/genre/josei">Josei</a><a href="/genre/kids">Kids</a>
            <a href="/genre/magic">Magic</a><a href="/genre/mahou-shoujo">Mahou Shoujo</a><a href="/genre/martial-arts">Martial Arts</a>
            <a href="/genre/mecha">Mecha</a><a href="/genre/music">Music</a><a href="/genre/mystery">Mystery</a>
            <a href="/genre/psychological">Psychological</a><a href="/genre/reverse-harem">Reverse Harem</a><a href="/genre/romance">Romance</a>
            <a href="/genre/school">School</a><a href="/genre/sci-fi">Sci-Fi</a><a href="/genre/seinen">Seinen</a>
            <a href="/genre/shoujo">Shoujo</a><a href="/genre/shounen">Shounen</a><a href="/genre/slice-of-life">Slice of Life</a>
            <a href="/genre/space">Space</a><a href="/genre/sports">Sports</a><a href="/genre/super-power">Super Power</a>
            <a href="/genre/supernatural">Supernatural</a><a href="/genre/suspense">Suspense</a><a href="/genre/thriller">Thriller</a>
            <a href="/genre/vampire">Vampire</a><a href="/genre/war">War</a><a href="/genre/western">Western</a>
          </div>
        </div>
        <!-- Country Dropdown -->
        <div class="nav-dropdown-trigger" style="position:relative;padding:8px 10px;font-size:0.8rem;color:#fff;cursor:pointer;">Country ▾
          <div class="nav-dropdown" id="countryDropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:560px;grid-template-columns:repeat(4,1fr);gap:4px;z-index:300;">
            <!-- Pre-filled countries (alphabetical) -->
            <a href="/country/argentina">Argentina</a><a href="/country/australia">Australia</a><a href="/country/austria">Austria</a>
            <a href="/country/belgium">Belgium</a><a href="/country/brazil">Brazil</a><a href="/country/canada">Canada</a>
            <a href="/country/china">China</a><a href="/country/colombia">Colombia</a><a href="/country/czech-republic">Czech Republic</a>
            <a href="/country/denmark">Denmark</a><a href="/country/finland">Finland</a><a href="/country/france">France</a>
            <a href="/country/germany">Germany</a><a href="/country/hong-kong">Hong Kong</a><a href="/country/hungary">Hungary</a>
            <a href="/country/india">India</a><a href="/country/ireland">Ireland</a><a href="/country/israel">Israel</a>
            <a href="/country/italy">Italy</a><a href="/country/japan">Japan</a><a href="/country/luxembourg">Luxembourg</a>
            <a href="/country/mexico">Mexico</a><a href="/country/netherlands">Netherlands</a><a href="/country/new-zealand">New Zealand</a>
            <a href="/country/nigeria">Nigeria</a><a href="/country/norway">Norway</a><a href="/country/philippines">Philippines</a>
            <a href="/country/poland">Poland</a><a href="/country/romania">Romania</a><a href="/country/russia">Russia</a>
            <a href="/country/south-africa">South Africa</a><a href="/country/south-korea">South Korea</a><a href="/country/spain">Spain</a>
            <a href="/country/sweden">Sweden</a><a href="/country/switzerland">Switzerland</a><a href="/country/taiwan">Taiwan</a>
            <a href="/country/thailand">Thailand</a><a href="/country/turkey">Turkey</a><a href="/country/united-kingdom">United Kingdom</a>
            <a href="/country/united-states">United States</a>
          </div>
        </div>
        <!-- Type Dropdown -->
        <div class="nav-dropdown-trigger" style="position:relative;padding:8px 10px;font-size:0.8rem;color:#fff;cursor:pointer;">Type ▾
          <div class="nav-dropdown" style="display:none;position:absolute;top:100%;left:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;padding:12px;min-width:160px;z-index:300;">
            <a href="/type/anime">Anime</a><a href="/type/drama">Drama</a><a href="/type/movie">Movie</a><a href="/type/tv-show">TV Show</a>
          </div>
        </div>
        <a href="/status/ongoing">Ongoing</a>
        <a href="/search?q=new+releases">Updates</a>
        <a href="#">News</a>
        <a href="#">Forum</a>
      </nav>
      <!-- Search Bar -->
      <div class="header-search-wrap" style="flex:1;max-width:360px;margin:0 8px;position:relative;order:10;">
        <div class="header-search-bar" style="display:flex;align-items:center;background:var(--bg-surface);border:1px solid var(--border-medium);border-radius:50px;overflow:hidden;">
          <div class="search-toggle-tabs" style="display:flex;padding:2px 2px;gap:2px;">
            <span class="search-toggle-tab active" data-search="non-anime" style="padding:4px 8px;font-size:0.62rem;font-weight:600;border-radius:50px;cursor:pointer;color:var(--text-muted);white-space:nowrap;">Non-Anime</span>
            <span class="search-toggle-tab" data-search="anime" style="padding:4px 8px;font-size:0.62rem;font-weight:600;border-radius:50px;cursor:pointer;color:var(--text-muted);white-space:nowrap;">Anime</span>
          </div>
          <input type="text" id="searchInput" placeholder="Search shows..." autocomplete="off" style="flex:1;padding:9px 6px;background:transparent;border:none;color:#fff;font-size:0.8rem;min-width:60px;">
        </div>
        <div class="search-suggestions" id="searchSuggestions" style="display:none;position:absolute;top:110%;left:0;right:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;max-height:400px;overflow-y:auto;z-index:350;"></div>
      </div>
      <!-- Social Icons (desktop) -->
      <div class="header-socials" style="display:flex;gap:6px;flex-shrink:0;order:20;">
        <a href="https://discord.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317..."/></svg></a>
        <a href="https://tumblr.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14.563..."/></svg></a>
        <a href="https://bsky.app" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12..."/></svg></a>
        <a href="https://x.com" target="_blank" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244..."/></svg></a>
      </div>
      <!-- Login / Profile -->
      <div style="position:relative;flex-shrink:0;order:30;">
        <button class="btn-login" id="btnLogin" style="padding:8px 16px;background:var(--btn-primary);color:#fff;border-radius:50px;font-weight:600;font-size:0.75rem;border:none;cursor:pointer;white-space:nowrap;">Sign In</button>
        <img class="user-avatar" id="userAvatar" src="" alt="Profile" style="display:none;width:34px;height:34px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid var(--btn-primary);" onclick="toggleProfileDropdown()">
        <div class="profile-dropdown" id="profileDropdown" style="display:none;position:absolute;top:100%;right:0;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;min-width:180px;padding:8px;z-index:350;">
          <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border-subtle);">
            <img id="dropdownAvatar" src="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            <span id="dropdownUserName" style="font-weight:600;font-size:0.85rem;color:#fff;"></span>
          </div>
          <a href="/profile" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);"><span style="margin-right:6px;">👤</span> My Profile</a>
          <a href="/continue-watching" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);"><span style="margin-right:6px;">▶</span> Continue Watching</a>
          <a href="/watchlist" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);"><span style="margin-right:6px;">❤️</span> WatchList</a>
          <a href="/stats" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);"><span style="margin-right:6px;">📊</span> Stats</a>
          <a href="/settings" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--text-secondary);"><span style="margin-right:6px;">⚙️</span> Settings</a>
          <a href="#" id="btnLogout" style="display:block;padding:6px 12px;font-size:0.75rem;color:var(--link-accent);border-top:1px solid var(--border-subtle);margin-top:5px;">🚪 Sign out</a>
        </div>
      </div>
    </header>
  `;

  // ═══════ MOBILE MENU (inserted before header) ═══════
  const mobileMenuHTML = `
    <div class="mobile-menu-overlay" id="mobileOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:399;"></div>
    <div class="mobile-menu" id="mobileMenu" style="display:none;position:fixed;top:0;left:0;width:280px;height:100vh;background:var(--bg-header);z-index:400;padding:20px;transform:translateX(-100%);transition:transform 0.3s ease;overflow-y:auto;border-right:1px solid var(--border-medium);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <span style="font-family:var(--font-title);font-size:1.1rem;color:#fff;">◈ AniOcean</span>
        <span id="mobileClose" style="font-size:1.4rem;cursor:pointer;color:#fff;">&times;</span>
      </div>
      <a href="#" style="display:block;padding:12px;margin-bottom:8px;background:rgba(255,255,255,0.06);border:1px solid var(--border-medium);border-radius:8px;color:#fff;text-align:center;">Forum/Community</a>
      <a href="/" style="display:block;padding:10px 14px;color:#fff;border-radius:6px;">Home</a>
      <div class="mobile-dropdown-trigger" style="padding:10px 14px;color:#fff;cursor:pointer;border-radius:6px;">Genre ▾</div>
      <div class="mobile-dropdown-content" id="mobileGenreDropdown" style="display:none;padding-left:12px;columns:2;">
        <a href="/genre/action" style="display:block;padding:5px 8px;font-size:0.75rem;color:var(--text-secondary);">Action</a>
        <a href="/genre/adventure" style="display:block;padding:5px 8px;font-size:0.75rem;color:var(--text-secondary);">Adventure</a>
        <!-- (truncated for brevity; real code includes all genres) -->
      </div>
      <div class="mobile-dropdown-trigger" style="padding:10px 14px;color:#fff;cursor:pointer;border-radius:6px;">Country ▾</div>
      <div class="mobile-dropdown-content" id="mobileCountryDropdown" style="display:none;padding-left:12px;columns:2;">
        <a href="/country/argentina" style="display:block;padding:5px 8px;font-size:0.75rem;color:var(--text-secondary);">Argentina</a>
        <a href="/country/australia" style="display:block;padding:5px 8px;font-size:0.75rem;color:var(--text-secondary);">Australia</a>
        <!-- (truncated) -->
      </div>
      <a href="/status/ongoing" style="display:block;padding:10px 14px;color:#fff;">Ongoing</a>
      <a href="/search?q=new+releases" style="display:block;padding:10px 14px;color:#fff;">Updates</a>
      <a href="#" style="display:block;padding:10px 14px;color:#fff;">News</a>
    </div>
    <!-- Mobile search bar (hidden by default) -->
    <div id="mobileSearchContainer" style="display:none;padding:8px 16px;background:var(--bg-header);border-bottom:1px solid var(--border-subtle);text-align:center;">
      <div class="header-search-bar" style="display:flex;align-items:center;background:var(--bg-surface);border:1px solid var(--border-medium);border-radius:50px;overflow:hidden;max-width:400px;margin:0 auto;">
        <div class="search-toggle-tabs" style="display:flex;padding:2px 2px;gap:2px;">
          <span class="search-toggle-tab active" data-search="non-anime" style="padding:4px 8px;font-size:0.62rem;font-weight:600;border-radius:50px;cursor:pointer;color:var(--text-muted);">Non-Anime</span>
          <span class="search-toggle-tab" data-search="anime" style="padding:4px 8px;font-size:0.62rem;font-weight:600;border-radius:50px;cursor:pointer;color:var(--text-muted);">Anime</span>
        </div>
        <input type="text" id="mobileSearchInput" placeholder="Search..." autocomplete="off" style="flex:1;padding:9px 6px;background:transparent;border:none;color:#fff;font-size:0.8rem;">
      </div>
      <div class="search-suggestions" id="mobileSearchSuggestions" style="display:none;position:absolute;top:calc(100% + 4px);left:16px;right:16px;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:12px;max-height:300px;overflow-y:auto;z-index:360;"></div>
    </div>
  `;

  // ═══════ LOGIN MODAL HTML (hidden) ═══════
  const loginModalHTML = `
    <div class="modal-overlay" id="loginModalOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:600;align-items:center;justify-content:center;">
      <div class="modal-content" style="display:flex;flex-wrap:wrap;max-width:700px;width:94%;background:var(--bg-body);border:1px solid var(--border-medium);border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lg);position:relative;">
        <span class="modal-close" id="loginModalClose" style="position:absolute;top:10px;right:14px;font-size:1.3rem;cursor:pointer;color:#fff;z-index:5;">&times;</span>
        <div class="modal-image" style="flex:0 0 45%;background-image:url('https://i.postimg.cc/pr6CQhM8/e1223c0a1599b039da4ac536a39f0223.jpg');background-size:cover;background-position:center;min-height:250px;"></div>
        <div class="modal-form-wrap" id="modalFormWrap" style="flex:1;padding:24px 18px;position:relative;">
          <!-- Default: Login form -->
          <form id="loginForm" style="display:block;">
            <h2 style="font-family:var(--font-title);font-size:1.2rem;margin-bottom:14px;">Welcome back!</h2>
            <input type="text" id="loginUsername" placeholder="Username" required style="width:100%;padding:10px 12px;margin-bottom:10px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.8rem;">
            <input type="password" id="loginPassword" placeholder="Password" required style="width:100%;padding:10px 12px;margin-bottom:4px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.8rem;">
            <a href="#" id="forgotPasswordLink" style="display:block;text-align:right;font-size:0.68rem;color:var(--text-muted);margin-bottom:10px;">Forgot Password?</a>
            <div class="cf-turnstile" data-sitekey="0x4AAAAAADHwF4HZ8mJhe0yRQeNHRG-xyWk" style="margin-bottom:10px;"></div>
            <button type="submit" class="btn-submit" style="width:100%;padding:10px;background:var(--btn-primary);color:#fff;border:none;border-radius:var(--radius-pill);font-weight:700;font-size:0.85rem;cursor:pointer;">Sign In</button>
            <p style="text-align:center;font-size:0.72rem;color:var(--text-muted);margin-top:8px;">Don't have an account? <a href="#" id="switchToRegister" style="color:var(--btn-primary);font-weight:600;">Sign up</a></p>
          </form>
          <!-- Signup form (hidden) -->
          <form id="registerForm" style="display:none;">
            <h2 style="font-family:var(--font-title);font-size:1.2rem;margin-bottom:6px;">Create account</h2>
            <p style="font-size:0.72rem;color:var(--text-muted);margin-bottom:12px;">Join our community</p>
            <div style="display:flex;justify-content:center;margin-bottom:10px;position:relative;">
              <div id="avatarSelectCircle" style="width:64px;height:64px;border-radius:50%;border:2px solid var(--btn-primary);background:var(--bg-surface);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;" onclick="openAvatarSelector()">
                <img id="avatarPreview" src="" style="width:100%;height:100%;object-fit:cover;display:none;">
                <span id="avatarPlaceholder" style="font-size:1.5rem;color:var(--text-muted);">+</span>
              </div>
            </div>
            <input type="text" id="regUsername" placeholder="Username (12 chars max)" maxlength="12" required pattern="[A-Za-z0-9]+" style="width:100%;padding:10px 12px;margin-bottom:10px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.8rem;">
            <input type="email" id="regEmail" placeholder="Email address" required style="width:100%;padding:10px 12px;margin-bottom:10px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.8rem;">
            <input type="password" id="regPassword" placeholder="Password (max 20, mixed)" maxlength="20" required style="width:100%;padding:10px 12px;margin-bottom:10px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.8rem;">
            <input type="password" id="regConfirmPassword" placeholder="Confirm password" required style="width:100%;padding:10px 12px;margin-bottom:10px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.8rem;">
            <label style="display:flex;align-items:center;gap:8px;font-size:0.7rem;color:var(--text-muted);margin-bottom:10px;">
              <input type="checkbox" id="acceptTerms" required> I accept the <a href="/terms" target="_blank" style="color:var(--btn-primary);">Terms & Conditions</a> and <a href="/privacy" target="_blank" style="color:var(--btn-primary);">Privacy Policy</a>
            </label>
            <button type="submit" class="btn-submit" style="width:100%;padding:10px;background:var(--btn-primary);color:#fff;border:none;border-radius:var(--radius-pill);font-weight:700;font-size:0.85rem;">Sign Up</button>
            <button type="button" onclick="signInWithGoogle()" class="btn-google" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:8px;margin-top:8px;background:#4285f4;color:#fff;border:none;border-radius:var(--radius-pill);font-size:0.8rem;cursor:pointer;">
              <svg width="18" height="18" viewBox="-0.5 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.82727 24C9.82727 22.4757 10.0804 21.0144 10.5323 19.6437L2.62345 13.6043C1.08207 16.7339 0.213636 20.2603 0.213636 24C0.213636 27.7365 1.081 31.2608 2.62025 34.3883L10.5248 28.3371C10.0772 26.9728 9.82727 25.5168 9.82727 24Z" fill="#FBBC05"/><path d="M23.7136 10.1333C27.025 10.1333 30.0159 11.3067 32.3659 13.2267L39.2023 6.4C35.0364 2.77333 29.6955 0.533333 23.7136 0.533333C14.4269 0.533333 6.44541 5.84427 2.62345 13.6043L10.5323 19.6437C12.3546 14.112 17.5492 10.1333 23.7136 10.1333Z" fill="#EB4335"/><path d="M23.7136 37.8667C17.5492 37.8667 12.3546 33.888 10.5323 28.3563L2.62345 34.3947C6.44541 42.1557 14.4269 47.4667 23.7136 47.4667C29.4455 47.4667 34.9178 45.4315 39.025 41.6181L31.5178 35.8144C29.3996 37.1488 26.7323 37.8667 23.7136 37.8667Z" fill="#34A853"/><path d="M46.1455 24C46.1455 22.6133 45.9318 21.12 45.6114 19.7333H23.7136V28.8H36.3182C35.688 31.8912 33.9725 34.2677 31.5178 35.8144L39.025 41.6181C43.3393 37.6139 46.1455 31.6491 46.1455 24Z" fill="#4285F4"/></svg>
              Sign up with Google
            </button>
            <p style="text-align:center;font-size:0.72rem;color:var(--text-muted);margin-top:8px;">Already have an account? <a href="#" id="switchToLogin" style="color:var(--btn-primary);font-weight:600;">Sign in</a></p>
          </form>
          <!-- Forgot password form -->
          <form id="forgotPasswordForm" style="display:none;">
            <h2 style="font-family:var(--font-title);font-size:1.2rem;margin-bottom:14px;">Reset password</h2>
            <p style="font-size:0.72rem;color:var(--text-muted);margin-bottom:12px;">Enter your email and we'll send you a reset link.</p>
            <input type="email" id="resetEmail" placeholder="Email address" required style="width:100%;padding:10px 12px;margin-bottom:15px;border-radius:var(--radius-sm);border:1px solid var(--border-medium);background:var(--bg-surface);color:#fff;font-size:0.8rem;">
            <button type="submit" class="btn-submit" style="width:100%;padding:10px;background:var(--btn-primary);color:#fff;border:none;border-radius:var(--radius-pill);font-weight:700;font-size:0.85rem;">Send Reset Link</button>
            <p style="text-align:center;font-size:0.72rem;color:var(--text-muted);margin-top:10px;"><a href="#" id="backToLogin" style="color:var(--btn-primary);">Back to login</a></p>
          </form>
          <div class="form-message" id="formMessage" style="font-size:0.72rem;color:var(--accent-gold);text-align:center;margin-top:8px;"></div>
        </div>
      </div>
    </div>
    <!-- Avatar Selection Popup -->
    <div class="modal-overlay" id="avatarPopupOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:700;align-items:center;justify-content:center;">
      <div style="background:var(--bg-popup);border:1px solid var(--border-medium);border-radius:var(--radius-lg);padding:16px;max-width:400px;width:90%;max-height:80vh;overflow-y:auto;">
        <h3 style="margin-bottom:10px;font-size:0.9rem;">Choose avatar</h3>
        <button onclick="document.getElementById('avatarUpload').click()" style="padding:6px 12px;font-size:0.7rem;margin-bottom:10px;background:var(--btn-primary);color:#fff;border-radius:var(--radius-pill);border:none;cursor:pointer;">Upload your own</button>
        <input type="file" id="avatarUpload" accept="image/*" style="display:none;" onchange="uploadCustomAvatar(this)">
        <div id="avatarGrid" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div>
        <button onclick="closeAvatarSelector()" style="margin-top:10px;width:100%;padding:8px;background:var(--btn-secondary);color:#fff;border:none;border-radius:var(--radius-pill);cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;

  // ═══════ FOOTER HTML ═══════
  const footerHTML = `
    <footer class="site-footer" style="background:var(--bg-header);padding:28px 16px;margin-top:50px;border-top:1px solid var(--border-subtle);display:flex;flex-wrap:wrap;gap:20px;justify-content:space-between;align-items:flex-start;">
      <div class="footer-left" style="flex:1;min-width:250px;">
        <div class="footer-logo" style="font-family:var(--font-title);font-size:1.4rem;color:#fff;margin-bottom:6px;">◈ AniOcean</div>
        <p class="footer-desc" style="font-size:0.9rem;color:var(--text-muted);margin-bottom:8px;">Stream free anime, movies, and TV shows on AniOcean. Enjoy fast, high-quality streaming with multi-language subtitles and real-time updates. Watch now!</p>
        <p style="font-size:0.9rem;color:#fff;margin-bottom:8px;">Follow us!</p>
        <div class="footer-socials" style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
          <a href="https://t.me" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M..."/></svg></a>
          <a href="https://bsky.app" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="..."/></svg></a>
          <a href="https://discord.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="..."/></svg></a>
          <a href="https://x.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="..."/></svg></a>
          <a href="https://quora.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><text x="5" y="18" font-size="18" font-weight="700">Q</text></svg></a>
          <a href="https://tumblr.com" target="_blank" style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;color:#fff;"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="..."/></svg></a>
        </div>
        <div class="footer-links" style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.7rem;">
          <a href="/" style="color:#fff;">Home</a><a href="#" style="color:#fff;">Blog</a><a href="#" style="color:#fff;">Forum</a><a href="#" style="color:#fff;">Report</a>
          <a href="#" style="color:#fff;">Send Request</a><a href="#" style="color:#fff;">Terms & Conditions</a><a href="#" style="color:#fff;">Support</a>
        </div>
        <p class="footer-disclaimer" style="font-size:0.69rem;color:var(--text-muted);margin-top:6px;">This site does not store any files on its server. All contents are provided by non‑affiliated third parties.</p>
        <p class="footer-disclaimer" style="font-size:0.67rem;color:var(--text-muted);">Copyright © ${new Date().getFullYear()} AniOcean. All Rights Reserved</p>
      </div>
      <div class="footer-right">
        <img src="https://i.postimg.cc/hPqN8Q8v/Chisato-bow-Lycoris-Recoil-01-removebg-preview.png" alt="Mascot" style="height:180px;object-fit:contain;">
      </div>
    </footer>
  `;

  // ═══════ INSERT INTO DOM ═══════
  document.addEventListener('DOMContentLoaded', () => {
    // The header goes first
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    // Mobile menu after header
    document.body.insertAdjacentHTML('afterbegin', mobileMenuHTML);
    // Login modal (hidden)
    document.body.insertAdjacentHTML('beforeend', loginModalHTML);
    // Footer
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // Initialize everything
    initDesktopSearch();
    initMobileSearch();
    initMobileMenu();
    initLoginModal();
    updateUserUI();
    initDropdowns();
  });

  // ═══════ SEARCH FUNCTIONALITY ═══════
  function fetchSuggestions(query, suggestionContainer) {
    suggestionContainer.innerHTML = '<div style="padding:14px;color:var(--text-muted);text-align:center;">Searching…</div>';
    suggestionContainer.style.display = 'block';
    if (currentSearchMode === 'anime') {
      fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=6`)
        .then(res => res.json())
        .then(data => {
          renderSuggestions(data.data || [], suggestionContainer, query);
        })
        .catch(() => suggestionContainer.innerHTML = '<div style="padding:14px;color:var(--text-muted);">Error</div>');
    } else {
      const movieUrl = `https://aniocen.bionmovies47.workers.dev/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`;
      const tvUrl = `https://aniocen.bionmovies47.workers.dev/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1`;
      Promise.all([fetch(movieUrl).then(r => r.json()), fetch(tvUrl).then(r => r.json())])
        .then(([movies, tv]) => {
          const combined = [...(movies.results || []).slice(0, 3), ...(tv.results || []).slice(0, 3)].slice(0, 6);
          renderSuggestions(combined, suggestionContainer, query, 'tmdb');
        })
        .catch(() => suggestionContainer.innerHTML = '<div style="padding:14px;color:var(--text-muted);">Error</div>');
    }
  }

  function renderSuggestions(items, container, query, source = 'jikan') {
    if (!items.length) {
      container.innerHTML = '<div style="padding:14px;color:var(--text-muted);text-align:center;">No results</div>';
      return;
    }
    let html = '';
    items.forEach(item => {
      let title, poster, year, type, duration, score, originalTitle;
      if (source === 'jikan') {
        title = item.title_english || item.title;
        originalTitle = item.title_japanese || item.title;
        poster = item.images?.jpg?.image_url || '';
        const date = item.aired?.from ? new Date(item.aired.from) : null;
        year = date ? date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear() : '';
        type = item.type || '';
        duration = item.duration || '';
        score = item.score || '';
      } else {
        title = item.title || item.name;
        originalTitle = item.original_title || item.original_name || '';
        poster = item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : '';
        const date = item.release_date || item.first_air_date;
        if (date) {
          const d = new Date(date);
          year = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear();
        } else year = '';
        type = item.media_type === 'movie' ? 'Movie' : 'TV';
        duration = item.media_type === 'movie' ? '2h 10m' : '45m/ep';
        score = item.vote_average || '';
      }
      html += `
        <a href="/details/${item.mal_id || item.id}" style="display:flex;gap:10px;padding:10px 12px;color:#fff;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background='var(--bg-surface)'" onmouseout="this.style.background=''">
          <img src="${poster}" style="width:36px;height:54px;border-radius:4px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'">
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.625rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
            <div style="font-size:0.5625rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${originalTitle}</div>
            <div style="font-size:0.5rem;color:var(--text-muted);margin-top:2px;">${year} · ${type} · ${duration} · ⭐${score}</div>
          </div>
        </a>
      `;
    });
    html += `<a href="/search?q=${encodeURIComponent(query)}" style="display:block;text-align:center;padding:8px;font-weight:600;font-size:0.7rem;color:var(--popup-btn);border-top:1px solid var(--border-subtle);">View All ›</a>`;
    container.innerHTML = html;
  }

  function initDesktopSearch() {
    const input = document.getElementById('searchInput');
    const sug = document.getElementById('searchSuggestions');
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 3) { sug.style.display = 'none'; return; }
      timer = setTimeout(() => fetchSuggestions(q, sug), 300);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search-wrap')) sug.style.display = 'none';
    });
    document.querySelectorAll('.search-toggle-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        this.parentElement.querySelectorAll('.search-toggle-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentSearchMode = this.dataset.search;
      });
    });
  }

  function initMobileSearch() {
    const searchIcon = document.querySelector('.mobile-search-btn');
    const container = document.getElementById('mobileSearchContainer');
    const input = document.getElementById('mobileSearchInput');
    const sug = document.getElementById('mobileSearchSuggestions');
    let timer;
    if (searchIcon) {
      searchIcon.addEventListener('click', () => {
        container.style.display = container.style.display === 'block' ? 'none' : 'block';
        input.focus();
      });
    }
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 3) { sug.style.display = 'none'; return; }
      timer = setTimeout(() => fetchSuggestions(q, sug), 300);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#mobileSearchContainer')) {
        sug.style.display = 'none';
      }
    });
  }

  // ═══════ MOBILE MENU ═══════
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const closeBtn = document.getElementById('mobileClose');
    if (hamburger) {
      hamburger.style.display = 'flex';
      hamburger.addEventListener('click', () => {
        menu.style.display = 'block';
        setTimeout(() => { menu.style.transform = 'translateX(0)'; overlay.style.display = 'block'; }, 10);
      });
    }
    const closeMenu = () => {
      menu.style.transform = 'translateX(-100%)';
      overlay.style.display = 'none';
      setTimeout(() => { menu.style.display = 'none'; }, 300);
    };
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    // Toggle mobile dropdowns
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trig => {
      trig.addEventListener('click', () => {
        const content = trig.nextElementSibling;
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
      });
    });
  }

  // ═══════ LOGIN MODAL ═══════
  function initLoginModal() {
    const modal = document.getElementById('loginModalOverlay');
    const btnLogin = document.getElementById('btnLogin');
    const closeBtn = document.getElementById('loginModalClose');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotPasswordForm');
    const message = document.getElementById('formMessage');
    const switchToReg = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const forgotLink = document.getElementById('forgotPasswordLink');
    const backToLogin = document.getElementById('backToLogin');

    btnLogin.addEventListener('click', () => {
      modal.style.display = 'flex';
      resetForms();
    });
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    function resetForms() {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      forgotForm.style.display = 'none';
      message.textContent = '';
    }
    switchToReg.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      forgotForm.style.display = 'none';
      registerForm.style.display = 'block';
    });
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      resetForms();
    });
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      forgotForm.style.display = 'block';
    });
    backToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      resetForms();
    });

    // Login submit
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;
      const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
      if (error) message.textContent = error.message;
      else {
        modal.style.display = 'none';
        updateUserUI();
      }
    });

    // Register submit
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirmPassword').value;
      if (password !== confirm) { message.textContent = 'Passwords do not match'; return; }
      const avatarUrl = document.getElementById('avatarPreview').src || null;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            avatar_url: avatarUrl,
          }
        }
      });
      if (error) message.textContent = error.message;
      else {
        message.textContent = 'Check your email to confirm!';
        setTimeout(() => {
          modal.style.display = 'none';
          updateUserUI();
        }, 2000);
      }
    });

    // Forgot password
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value.trim();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) message.textContent = error.message;
      else {
        message.textContent = 'Reset link sent! Check your inbox.';
      }
    });

    // Avatar selection (inside signup)
    window.openAvatarSelector = function() {
      document.getElementById('avatarPopupOverlay').style.display = 'flex';
      fetchAvatars();
    };
    window.closeAvatarSelector = function() {
      document.getElementById('avatarPopupOverlay').style.display = 'none';
    };
    async function fetchAvatars() {
      const grid = document.getElementById('avatarGrid');
      grid.innerHTML = 'Loading…';
      const { data, error } = await supabase.storage.from('Profile Images').list('', { limit: 50 });
      if (error) { grid.innerHTML = 'Could not load images'; return; }
      const urls = data.map(file => `https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/${file.name}`);
      grid.innerHTML = urls.map(url => `<img src="${url}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='var(--btn-primary)'" onmouseout="this.style.borderColor='transparent'" onclick="selectAvatar('${url}')">`).join('');
    }
    window.selectAvatar = function(url) {
      document.getElementById('avatarPreview').src = url;
      document.getElementById('avatarPreview').style.display = 'block';
      document.getElementById('avatarPlaceholder').style.display = 'none';
      closeAvatarSelector();
    };
    window.uploadCustomAvatar = function(input) {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 128;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 128, 128);
          const resized = canvas.toDataURL('image/jpeg', 0.8);
          document.getElementById('avatarPreview').src = resized;
          document.getElementById('avatarPreview').style.display = 'block';
          document.getElementById('avatarPlaceholder').style.display = 'none';
          closeAvatarSelector();
        };
      };
      reader.readAsDataURL(file);
    };
  }

  // ═══════ USER UI UPDATE ═══════
  async function updateUserUI() {
    const { data: { user } } = await supabase.auth.getUser();
    const btnLogin = document.getElementById('btnLogin');
    const avatar = document.getElementById('userAvatar');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownName = document.getElementById('dropdownUserName');
    if (user) {
      btnLogin.style.display = 'none';
      avatar.style.display = 'block';
      const avatarUrl = user.user_metadata?.avatar_url || 'https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/flower.jpg';
      avatar.src = avatarUrl;
      if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
      if (dropdownName) dropdownName.textContent = user.user_metadata?.username || user.email;
    } else {
      btnLogin.style.display = '';
      avatar.style.display = 'none';
    }
  }

  // ═══════ PROFILE DROPDOWN ═══════
  window.toggleProfileDropdown = function () {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  };
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-avatar') && !e.target.closest('#profileDropdown')) {
      const dropdown = document.getElementById('profileDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }
  });

  // ═══════ LOGOUT ═══════
  document.getElementById('btnLogout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    updateUserUI();
    document.getElementById('profileDropdown').style.display = 'none';
  });

  // ═══════ DROPDOWNS (DESKTOP) ═══════
  function initDropdowns() {
    document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
      const dropdown = trigger.querySelector('.nav-dropdown');
      if (!dropdown) return;
      trigger.addEventListener('mouseenter', () => { dropdown.style.display = 'grid'; });
      trigger.addEventListener('mouseleave', () => { dropdown.style.display = 'none'; });
    });
  }

  // Expose for global usage
  window.supabase = supabase;
  window.signInWithGoogle = async () => {
    await supabase.auth.signIn({ provider: 'google' });
  };
})();
