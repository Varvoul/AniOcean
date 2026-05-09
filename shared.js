(function () {
  /* ═══════════════════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════════════════ */
  const SUPABASE_URL = 'https://msazwxqbyxctdnwqrreb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYXp3eHFieXhjdGRud3FycmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDkzMzYsImV4cCI6MjA5MzEyNTMzNn0.jfaA3HMRabWWPJkPGK34HM-suUhde_L9JEU0YfGkpLY';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const TMDB_API_KEY = '4ef0d1c4a39f7c7c8be9f50a32baf3ac'; // public demo key – replace with yours
  const PROFILE_BUCKET_URL = `${SUPABASE_URL}/storage/v1/object/public/Profile%20Images/`;
  const DEFAULT_AVATAR = 'https://msazwxqbyxctdnwqrreb.supabase.co/storage/v1/object/public/Profile%20Images/flower.jpg';
  const CF_SITEKEY = '0x4AAAAAADHwF4HZ8mJhe0yRQeNHRG-xyWk';

  let searchDebounceTimer = null;
  let currentSearchMode = 'non-anime';
  let currentUser = null;

  /* ═══════════════════════════════════════════════════
     SVG ICONS
  ═══════════════════════════════════════════════════ */
  const SVG = {
    discord: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963a.075.075 0 0 0-.041-.104 13.2 13.2 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/></svg>`,
    tumblr: `<svg viewBox="0 0 512 512" fill="currentColor" width="18" height="18"><path d="M412.904,405.777c0.123-0.088,0.225-0.213,0.324-0.313v0.313v89.785c-17.043,9.107-31.264,15.932-105.418,15.932c-10.729,0-20.66-0.074-31.713,0c-48.542,0.324-119.016-13.697-119.016-92.305v-185.1v-22.767h-58.31v-84.222H109.5c17.278,0,33.491-6.362,47.582-17.44c8.745-6.862,16.623-15.606,23.447-25.774c14.858-22.157,24.502-51.187,26.254-83.386h69.527v126.601h121.422v62.453v21.769H276.311v84.658v107.514c0,10.779,36.314,26.859,62.775,26.859S391.496,419.414,412.904,405.777z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
    user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.4" d="M12 22.01C17.5228 22.01 22 17.5329 22 12.01C22 6.48716 17.5228 2.01001 12 2.01001C6.47715 2.01001 2 6.48716 2 12.01C2 17.5329 6.47715 22.01 12 22.01Z" fill="currentColor"/><path d="M12 6.93994C9.93 6.93994 8.25 8.61994 8.25 10.6899C8.25 12.7199 9.84 14.3699 11.95 14.4299C11.98 14.4299 12.02 14.4299 12.04 14.4299C12.06 14.4299 12.09 14.4299 12.11 14.4299C12.12 14.4299 12.13 14.4299 12.13 14.4299C14.15 14.3599 15.74 12.7199 15.75 10.6899C15.75 8.61994 14.07 6.93994 12 6.93994Z" fill="currentColor"/><path d="M18.7807 19.36C17.0007 21 14.6207 22.01 12.0007 22.01C9.3807 22.01 7.0007 21 5.2207 19.36C5.4607 18.45 6.1107 17.62 7.0607 16.98C9.7907 15.16 14.2307 15.16 16.9407 16.98C17.9007 17.62 18.5407 18.45 18.7807 19.36Z" fill="currentColor"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    google: `<svg width="18" height="18" viewBox="-0.5 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M9.827,24C9.827,22.476 10.08,21.014 10.532,19.644L2.624,13.604C1.082,16.734 0.214,20.26 0.214,24C0.214,27.736 1.081,31.261 2.62,34.388L10.525,28.337C10.077,26.973 9.827,25.517 9.827,24" fill="#FBBC05"/><path d="M23.714,10.133C27.025,10.133 30.016,11.307 32.366,13.227L39.202,6.4C35.036,2.773 29.695,0.533 23.714,0.533C14.427,0.533 6.445,5.844 2.624,13.604L10.532,19.644C12.355,14.112 17.549,10.133 23.714,10.133" fill="#EB4335"/><path d="M23.714,37.867C17.549,37.867 12.355,33.888 10.532,28.356L2.624,34.395C6.445,42.156 14.427,47.467 23.714,47.467C29.417,47.467 34.918,45.431 39.025,41.618L31.518,35.814C29.4,37.149 26.732,37.867 23.714,37.867" fill="#34A853"/><path d="M46.145,24C46.145,22.613 45.932,21.12 45.611,19.733L23.714,19.733L23.714,28.8L36.318,28.8C35.688,31.891 33.972,34.268 31.518,35.814L39.025,41.618C43.339,37.614 46.145,31.649 46.145,24" fill="#4285F4"/></svg>`,
    logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    film: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    bar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="m9 18 6-6-6-6"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };

  /* ═══════════════════════════════════════════════════
     CSS INJECTION
  ═══════════════════════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = `
    /* ── GLOBAL RESET ── */
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    a{text-decoration:none;color:inherit;}
    button{cursor:pointer;font-family:inherit;}

    /* ── HEADER ── */
    .site-header{
      background:var(--bg-header,#0d1117);
      padding:0 20px;
      display:flex;
      align-items:center;
      gap:10px;
      border-bottom:1px solid var(--border-subtle,rgba(255,255,255,0.08));
      position:sticky;
      top:0;
      z-index:200;
      height:64px;
      flex-wrap:nowrap;
    }

    /* ── LOGO ── */
    .header-logo{flex-shrink:0;display:flex;align-items:center;}
    .header-logo img{
      width:clamp(100px,14vw,200px);
      height:auto;
      object-fit:contain;
      max-height:54px;
    }

    /* ── DESKTOP NAV ── */
    .main-nav{display:flex;align-items:center;gap:2px;flex-shrink:0;}
    .nav-link-item{
      padding:7px 10px;font-size:0.78rem;font-weight:500;
      color:var(--text-secondary,#ccc);border-radius:6px;
      transition:background .18s,color .18s;white-space:nowrap;
    }
    .nav-link-item:hover{background:rgba(255,255,255,0.08);color:#fff;}
    .nav-dropdown-trigger{
      position:relative;cursor:pointer;padding:7px 10px;
      font-size:0.78rem;color:var(--text-secondary,#ccc);
      border-radius:6px;transition:background .18s,color .18s;
      white-space:nowrap;user-select:none;
    }
    .nav-dropdown-trigger:hover{background:rgba(255,255,255,0.08);color:#fff;}
    .nav-dropdown{
      display:none;position:absolute;top:calc(100% + 6px);left:0;
      background:var(--bg-body,#13191f);
      border:1px solid var(--border-medium,rgba(255,255,255,0.12));
      border-radius:14px;padding:14px;
      z-index:300;box-shadow:0 16px 48px rgba(0,0,0,.6);
    }
    .nav-dropdown.grid-4{
      min-width:560px;
      display:grid!important;
      grid-template-columns:repeat(4,1fr);
      gap:2px;
    }
    .nav-dropdown.grid-1{min-width:160px;}
    .nav-dropdown a{
      display:block;padding:6px 10px;font-size:0.74rem;
      color:var(--text-secondary,#aaa);border-radius:7px;
      transition:background .15s,color .15s;
    }
    .nav-dropdown a:hover{background:rgba(255,255,255,0.08);color:#fff;}

    /* ── SEARCH BAR ── */
    .header-search-wrap{flex:1;max-width:330px;position:relative;min-width:0;}
    .header-search-bar{
      display:flex;align-items:center;
      background:var(--bg-surface,rgba(255,255,255,0.05));
      border-radius:50px;overflow:hidden;
      transition:box-shadow .2s;
    }
    .header-search-bar:focus-within{box-shadow:0 0 0 2px var(--btn-primary,#3b82f6);}
    .search-toggle-tabs{display:flex;padding:4px;gap:2px;flex-shrink:0;}
    .search-toggle-tab{
      padding:4px 9px;font-size:0.6rem;font-weight:700;
      border-radius:50px;cursor:pointer;
      color:var(--text-muted,#888);white-space:nowrap;
      letter-spacing:.03em;transition:background .18s,color .18s;
    }
    .search-toggle-tab.active{
      background:var(--btn-primary,#3b82f6);color:#fff;
    }
    #searchInput{
      flex:1;padding:9px 6px 9px 2px;
      background:transparent;border:none;outline:none;
      color:#fff;font-size:0.78rem;min-width:0;
    }
    #searchInput::placeholder{color:var(--text-muted,#666);}

    /* ── SEARCH SUGGESTIONS ── */
    .search-suggestions{
      display:none;position:absolute;
      top:calc(100% + 8px);left:0;right:0;
      background:var(--bg-body,#13191f);
      border:1px solid var(--border-medium,rgba(255,255,255,0.1));
      border-radius:14px;
      max-height:430px;overflow-y:auto;
      overflow-x:hidden;
      z-index:350;
      box-shadow:0 20px 60px rgba(0,0,0,.7);
    }
    .search-suggestions::-webkit-scrollbar{display:none;}
    .search-suggestions{scrollbar-width:none;}
    .suggestion-item{
      display:flex;align-items:center;gap:10px;
      padding:8px 12px;cursor:pointer;
      transition:background .15s;
      border-bottom:1px solid rgba(255,255,255,0.04);
    }
    .suggestion-item:last-of-type{border-bottom:none;}
    .suggestion-item:hover{background:rgba(255,255,255,0.06);}
    .suggestion-poster{
      width:38px;height:54px;border-radius:5px;
      object-fit:cover;flex-shrink:0;background:var(--bg-surface,#1e2633);
    }
    .suggestion-info{flex:1;min-width:0;}
    .suggestion-title{font-size:10px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .suggestion-original{font-size:9px;color:var(--text-muted,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;}
    .suggestion-meta{font-size:8.5px;color:var(--text-muted,#666);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .suggestion-score{display:inline-flex;align-items:center;gap:2px;color:#f59e0b;}
    .view-all-btn{
      display:flex;align-items:center;justify-content:center;gap:5px;
      padding:9px 0;margin:4px 12px;
      border:1.5px solid var(--btn-primary,#3b82f6);
      border-radius:50px;
      color:var(--btn-primary,#3b82f6);
      font-size:0.72rem;font-weight:600;
      cursor:pointer;background:transparent;width:calc(100% - 24px);
      transition:background .18s,color .18s;
    }
    .view-all-btn:hover{background:var(--btn-primary,#3b82f6);color:#fff;}

    /* ── SOCIAL ICONS ── */
    .header-socials{display:flex;gap:4px;flex-shrink:0;}
    .social-icon-btn{
      width:32px;height:32px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:var(--text-muted,#aaa);background:transparent;
      border:none;transition:background .18s,color .18s;
    }
    .social-icon-btn:hover{background:rgba(255,255,255,0.1);color:#fff;}

    /* ── LOGIN / AVATAR ── */
    .btn-login{
      padding:7px 18px;
      background:transparent;
      color:var(--text-secondary,#ccc);
      border-radius:50px;font-weight:600;
      font-size:0.75rem;border:none;
      white-space:nowrap;transition:color .18s;
      flex-shrink:0;
    }
    .btn-login:hover{color:#fff;}
    .user-avatar-wrap{position:relative;flex-shrink:0;}
    .user-avatar{
      width:34px;height:34px;border-radius:50%;
      object-fit:cover;cursor:pointer;
      border:2px solid var(--btn-primary,#3b82f6);
      display:none;
    }

    /* ── PROFILE DROPDOWN ── */
    .profile-dropdown{
      display:none;position:absolute;top:calc(100% + 10px);right:0;
      background:var(--bg-body,#13191f);
      border:1px solid var(--border-medium,rgba(255,255,255,0.1));
      border-radius:14px;min-width:200px;padding:8px;
      z-index:350;box-shadow:0 16px 40px rgba(0,0,0,.6);
    }
    .profile-dropdown.open{display:block;}
    .profile-dd-header{
      display:flex;align-items:center;gap:10px;
      padding:10px 10px 12px;border-bottom:1px solid rgba(255,255,255,0.07);
      margin-bottom:6px;
    }
    .profile-dd-header img{width:38px;height:38px;border-radius:50%;object-fit:cover;}
    .profile-dd-uname{font-size:0.82rem;font-weight:700;color:#fff;}
    .dd-sign-out{
      background:none;border:none;color:var(--text-muted,#888);
      display:flex;align-items:center;gap:4px;font-size:0.7rem;
      cursor:pointer;padding:4px 0;margin-top:3px;
      transition:color .15s;
    }
    .dd-sign-out:hover{color:#ef4444;}
    .profile-dd-item{
      display:flex;align-items:center;gap:8px;
      padding:8px 10px;border-radius:8px;font-size:0.76rem;
      color:var(--text-secondary,#ccc);transition:background .15s,color .15s;
    }
    .profile-dd-item:hover{background:rgba(255,255,255,0.07);color:#fff;}

    /* ── MOBILE HAMBURGER ── */
    .hamburger-btn{
      display:none;flex-direction:column;justify-content:center;
      align-items:center;gap:5px;
      width:38px;height:38px;border:none;background:none;
      cursor:pointer;flex-shrink:0;padding:0;
    }
    .hamburger-btn span{
      display:block;width:22px;height:2px;
      background:#fff;border-radius:2px;
      transition:transform .3s,opacity .3s;
    }
    .hamburger-btn.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
    .hamburger-btn.open span:nth-child(2){opacity:0;}
    .hamburger-btn.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

    /* ── MOBILE NAV OVERLAY ── */
    .mobile-nav-overlay{
      display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:400;
    }
    .mobile-nav-overlay.open{display:block;}
    .mobile-nav-panel{
      position:fixed;top:0;left:0;bottom:0;width:min(300px, 80vw);
      background:var(--bg-header,#0d1117);
      border-right:1px solid var(--border-subtle,rgba(255,255,255,0.08));
      z-index:401;padding:16px;overflow-y:auto;
      transform:translateX(-100%);transition:transform .3s cubic-bezier(.4,0,.2,1);
    }
    .mobile-nav-panel::-webkit-scrollbar{display:none;}
    .mobile-nav-panel.open{transform:translateX(0);}
    .mobile-nav-close{
      display:flex;justify-content:flex-end;margin-bottom:16px;
    }
    .mobile-nav-close button{
      width:32px;height:32px;border-radius:50%;border:none;
      background:rgba(255,255,255,0.06);color:#fff;
      display:flex;align-items:center;justify-content:center;
    }
    .mobile-forum-item{
      padding:10px 14px;margin-bottom:8px;border-radius:12px;
      border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);
      font-size:0.82rem;color:#fff;display:block;
      transition:background .18s;
    }
    .mobile-forum-item:hover{background:rgba(255,255,255,0.08);}
    .mobile-nav-item{
      display:block;padding:9px 10px;font-size:0.82rem;
      color:var(--text-secondary,#ccc);border-radius:8px;
      transition:background .15s,color .15s;
    }
    .mobile-nav-item:hover{background:rgba(255,255,255,0.07);color:#fff;}
    .mobile-sub-trigger{
      display:flex;align-items:center;justify-content:space-between;
      padding:9px 10px;font-size:0.82rem;
      color:var(--text-secondary,#ccc);border-radius:8px;
      cursor:pointer;transition:background .15s,color .15s;
      user-select:none;
    }
    .mobile-sub-trigger:hover{background:rgba(255,255,255,0.07);color:#fff;}
    .mobile-sub-trigger .arr{transition:transform .25s;font-size:.7rem;}
    .mobile-sub-trigger.open .arr{transform:rotate(90deg);}
    .mobile-sub-menu{
      display:none;padding:4px 0 4px 12px;
      display:grid;grid-template-columns:1fr 1fr;gap:2px;
    }
    .mobile-sub-menu.visible{display:grid;}
    .mobile-sub-menu a{
      display:block;padding:6px 8px;font-size:0.74rem;
      color:var(--text-muted,#888);border-radius:6px;
      transition:background .15s,color .15s;
    }
    .mobile-sub-menu a:hover{background:rgba(255,255,255,0.07);color:#fff;}
    .mobile-sub-menu.single-col{grid-template-columns:1fr;}

    /* ── MOBILE SEARCH DROPDOWN ── */
    .mobile-search-panel{
      display:none;position:absolute;
      top:calc(100% + 8px);left:50%;transform:translateX(-50%);
      width:min(340px,90vw);
      background:var(--bg-body,#13191f);
      border:1px solid var(--border-medium,rgba(255,255,255,0.1));
      border-radius:14px;padding:10px;z-index:450;
      box-shadow:0 20px 60px rgba(0,0,0,.7);
    }
    .mobile-search-panel.open{display:block;}
    .mobile-search-bar{
      display:flex;align-items:center;
      background:var(--bg-surface,rgba(255,255,255,0.06));
      border-radius:50px;overflow:hidden;margin-bottom:8px;
    }
    .mobile-search-bar .search-toggle-tabs{padding:3px;}
    #mobileSearchInput{
      flex:1;padding:8px 10px 8px 2px;
      background:transparent;border:none;outline:none;
      color:#fff;font-size:0.78rem;
    }
    .mobile-search-suggestions{
      max-height:350px;overflow-y:auto;
      overflow-x:hidden;
    }
    .mobile-search-suggestions::-webkit-scrollbar{display:none;}
    .mobile-search-suggestions{scrollbar-width:none;}

    /* ── AUTH MODAL ── */
    .auth-overlay{
      display:none;position:fixed;inset:0;
      background:rgba(0,0,0,.75);z-index:600;
      align-items:center;justify-content:center;
    }
    .auth-overlay.open{display:flex;}
    .auth-modal{
      background:var(--bg-body,#13191f);
      border:1px solid var(--border-medium,rgba(255,255,255,0.1));
      border-radius:18px;
      width:min(860px,95vw);
      max-height:92vh;
      overflow:hidden;
      display:flex;position:relative;
      box-shadow:0 40px 100px rgba(0,0,0,.8);
    }
    .auth-img-col{
      flex:0 0 430px;max-width:430px;
      position:relative;overflow:hidden;
    }
    .auth-img-col img{
      width:100%;height:100%;object-fit:cover;display:block;
    }
    .auth-form-col{
      flex:1;overflow-y:auto;padding:36px 32px;
      display:flex;flex-direction:column;justify-content:center;
      min-width:0;
    }
    .auth-form-col::-webkit-scrollbar{display:none;}
    .auth-close-btn{
      position:absolute;top:14px;right:14px;
      width:32px;height:32px;border-radius:50%;
      border:none;background:rgba(255,255,255,0.08);
      color:#fff;display:flex;align-items:center;
      justify-content:center;z-index:10;
      transition:background .18s;
    }
    .auth-close-btn:hover{background:rgba(255,255,255,0.15);}

    /* ── FORM SLIDES ── */
    .form-slides-wrapper{overflow:hidden;position:relative;}
    .form-slides{
      display:flex;transition:transform .42s cubic-bezier(.4,0,.2,1);
    }
    .form-slide{flex:0 0 100%;min-width:0;}
    .auth-heading{
      font-size:1.3rem;font-weight:800;color:#fff;margin-bottom:4px;
    }
    .auth-subheading{
      font-size:0.78rem;color:var(--text-muted,#888);margin-bottom:22px;
    }
    .auth-subheading span{
      color:var(--btn-primary,#3b82f6);font-weight:600;
      cursor:default;
    }

    /* ── FORM FIELDS ── */
    .field-group{margin-bottom:14px;}
    .field-group label{
      display:block;font-size:0.7rem;font-weight:600;
      color:var(--text-muted,#888);margin-bottom:5px;
      letter-spacing:.04em;text-transform:uppercase;
    }
    .field-input-wrap{position:relative;}
    .field-input{
      width:100%;padding:10px 14px;
      background:var(--bg-surface,rgba(255,255,255,0.05));
      border:1px solid var(--border-medium,rgba(255,255,255,0.1));
      border-radius:10px;color:#fff;font-size:0.82rem;
      outline:none;transition:border-color .2s,box-shadow .2s;
      font-family:inherit;
    }
    .field-input:focus{
      border-color:var(--btn-primary,#3b82f6);
      box-shadow:0 0 0 3px rgba(59,130,246,.18);
    }
    .field-input.error{border-color:#ef4444!important;}
    .eye-toggle{
      position:absolute;right:10px;top:50%;transform:translateY(-50%);
      background:none;border:none;color:var(--text-muted,#888);
      display:flex;align-items:center;cursor:pointer;
    }
    .char-hint{
      font-size:0.65rem;color:var(--text-muted,#777);
      text-align:right;margin-top:3px;
    }
    .field-error{font-size:0.68rem;color:#ef4444;margin-top:4px;}

    /* ── AVATAR PICKER IN SIGNUP ── */
    .avatar-pick-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:16px;}
    .avatar-frame{
      width:72px;height:72px;border-radius:50%;
      border:2px dashed var(--btn-primary,#3b82f6);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;overflow:hidden;position:relative;
      background:var(--bg-surface,rgba(255,255,255,0.05));
      transition:border-color .2s;flex-shrink:0;
    }
    .avatar-frame:hover{border-style:solid;}
    .avatar-frame img{width:100%;height:100%;object-fit:cover;}
    .avatar-pick-label{font-size:0.68rem;color:var(--text-muted,#888);margin-top:6px;}

    /* ── AVATAR PICKER POPUP ── */
    .avatar-popup-overlay{
      display:none;position:fixed;inset:0;
      background:rgba(0,0,0,.7);z-index:700;
      align-items:center;justify-content:center;
    }
    .avatar-popup-overlay.open{display:flex;}
    .avatar-popup{
      background:var(--bg-body,#13191f);
      border:1px solid var(--border-medium,rgba(255,255,255,0.12));
      border-radius:16px;padding:18px;
      width:min(340px,88vw);max-height:420px;
      overflow-y:auto;position:relative;
    }
    .avatar-popup::-webkit-scrollbar{display:none;}
    .avatar-popup{scrollbar-width:none;}
    .avatar-popup-header{
      display:flex;align-items:center;justify-content:space-between;
      margin-bottom:14px;
    }
    .avatar-popup-title{font-size:0.82rem;font-weight:700;color:#fff;}
    .avatar-upload-btn{
      display:flex;align-items:center;gap:5px;
      padding:5px 10px;border-radius:8px;font-size:0.7rem;font-weight:600;
      border:1px solid var(--btn-primary,#3b82f6);
      color:var(--btn-primary,#3b82f6);background:transparent;
      cursor:pointer;transition:background .18s,color .18s;
    }
    .avatar-upload-btn:hover{background:var(--btn-primary,#3b82f6);color:#fff;}
    .avatar-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
    .avatar-option{
      width:64px;height:64px;border-radius:50%;overflow:hidden;
      cursor:pointer;border:2px solid transparent;
      transition:border-color .18s,transform .18s;
      flex-shrink:0;
    }
    .avatar-option:hover{border-color:var(--btn-primary,#3b82f6);transform:scale(1.08);}
    .avatar-option.selected{border-color:#10b981;}
    .avatar-option img{width:100%;height:100%;object-fit:cover;}

    /* ── FORGOT PASSWORD / RESET FORM ── */
    .forgot-link{
      display:block;text-align:right;font-size:0.7rem;
      color:var(--btn-primary,#3b82f6);cursor:pointer;margin-top:4px;margin-bottom:14px;
      background:none;border:none;font-family:inherit;
      transition:opacity .18s;
    }
    .forgot-link:hover{opacity:.75;}

    /* ── CF TURNSTILE placeholder ── */
    .cf-turnstile-wrap{margin-bottom:14px;}

    /* ── TERMS CHECKBOX ── */
    .terms-row{
      display:flex;align-items:flex-start;gap:8px;
      margin-bottom:16px;font-size:0.72rem;color:var(--text-muted,#888);
    }
    .terms-row input[type=checkbox]{
      width:15px;height:15px;flex-shrink:0;margin-top:1px;
      accent-color:var(--btn-primary,#3b82f6);cursor:pointer;
    }
    .terms-row a{color:var(--btn-primary,#3b82f6);text-decoration:underline;}

    /* ── BUTTONS ── */
    .btn-primary{
      width:100%;padding:11px;border-radius:50px;
      background:var(--btn-primary,#3b82f6);color:#fff;
      font-weight:700;font-size:0.82rem;border:none;
      transition:opacity .2s,transform .1s;letter-spacing:.03em;
    }
    .btn-primary:hover{opacity:.88;}
    .btn-primary:active{transform:scale(.98);}
    .btn-primary:disabled{opacity:.5;cursor:not-allowed;}
    .btn-google{
      width:100%;padding:10px;border-radius:50px;
      background:var(--bg-surface,rgba(255,255,255,0.06));
      border:1px solid var(--border-medium,rgba(255,255,255,0.1));
      color:#fff;font-weight:600;font-size:0.78rem;
      display:flex;align-items:center;justify-content:center;gap:9px;
      margin-bottom:14px;transition:background .18s;
    }
    .btn-google:hover{background:rgba(255,255,255,0.1);}
    .divider{
      display:flex;align-items:center;gap:10px;
      margin:14px 0;color:var(--text-muted,#666);font-size:0.72rem;
    }
    .divider::before,.divider::after{
      content:'';flex:1;height:1px;
      background:rgba(255,255,255,0.09);
    }
    .auth-switch{
      text-align:center;font-size:0.73rem;
      color:var(--text-muted,#888);margin-top:18px;
    }
    .auth-switch-btn{
      background:none;border:none;color:var(--btn-primary,#3b82f6);
      font-weight:600;cursor:pointer;font-size:0.73rem;font-family:inherit;
      padding:0;
    }
    .auth-switch-btn:hover{text-decoration:underline;}
    .form-success{
      text-align:center;padding:20px 10px;color:var(--text-secondary,#ccc);
      font-size:0.82rem;line-height:1.6;
    }
    .form-success .icon{font-size:2rem;display:block;margin-bottom:10px;}

    /* ── RESPONSIVE ── */
    @media(max-width:900px){
      .main-nav,.header-search-wrap,.header-socials,.btn-login{display:none!important;}
      .hamburger-btn{display:flex!important;}
      .mobile-header-right{display:flex!important;}
    }
    @media(min-width:901px){
      .hamburger-btn,.mobile-header-right,.mobile-search-icon,.mobile-profile-icon{display:none!important;}
    }
    .mobile-header-right{
      display:none;align-items:center;gap:6px;margin-left:auto;
    }
    .mobile-icon-btn{
      width:36px;height:36px;border-radius:50%;border:none;
      background:none;color:var(--text-secondary,#ccc);
      display:flex;align-items:center;justify-content:center;
      position:relative;cursor:pointer;flex-shrink:0;
    }
    .mobile-icon-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}

    @media(max-width:700px){
      .auth-img-col{display:none!important;}
      .auth-modal{max-width:420px;}
      .auth-form-col{padding:28px 20px;}
    }
    @media(max-width:480px){
      .site-header{padding:0 12px;}
    }

    /* ── PASSWORD STRENGTH ── */
    .pwd-strength-bar{
      height:3px;border-radius:3px;margin-top:5px;
      background:rgba(255,255,255,0.08);overflow:hidden;
    }
    .pwd-strength-fill{
      height:100%;border-radius:3px;transition:width .3s,background .3s;
      width:0%;
    }
    .pwd-strength-text{font-size:0.65rem;margin-top:3px;}
  `;
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════════
     HEADER HTML
  ═══════════════════════════════════════════════════ */
  const genreLinks = [
    ['Action','action'],['Adventure','adventure'],['Animation','animation'],['Apocalyptic','apocalyptic'],
    ['Avant Garde','avant-garde'],['Biography','biography'],['Boys Love','boys-love'],['Comedy','comedy'],
    ['Cult','cult'],['Demons','demons'],['Documentary','documentary'],['Drama','drama'],
    ['Ecchi','ecchi'],['Family','family'],['Fantasy','fantasy'],['Film-Noir','film-noir'],
    ['Girls Love','girls-love'],['Gourmet','gourmet'],['Harem','harem'],['Horror','horror'],
    ['Isekai','isekai'],['Iyashikei','iyashikei'],['Josei','josei'],['Kids','kids'],
    ['Kodomomuke','kodomomuke'],['Magic','magic'],['Mahou Shoujo','mahou-shoujo'],['Martial Arts','martial-arts'],
    ['Mecha','mecha'],['Military','military'],['Music','music'],['Music & Musical','music-musical'],
    ['Mystery','mystery'],['Parody','parody'],['Psychological','psychological'],['Reverse Harem','reverse-harem'],
    ['Rom-Com','rom-com'],['Romance','romance'],['School','school'],['Sci-Fi','sci-fi'],
    ['Seinen','seinen'],['Shoujo','shoujo'],['Shounen','shounen'],['Slice of Life','slice-of-life'],
    ['Space','space'],['Sports','sports'],['Super Power','super-power'],['Supernatural','supernatural'],
    ['Suspense','suspense'],['Thriller','thriller'],['Vampire','vampire']
  ].map(([n,s])=>`<a href="/genre/${s}" class="nav-link-item">${n}</a>`).join('');

  const countryLinks = [
    ['Argentina','argentina'],['Australia','australia'],['Austria','austria'],['Belgium','belgium'],
    ['Brazil','brazil'],['Canada','canada'],['China','china'],['Colombia','colombia'],
    ['Czech Republic','czech-republic'],['Denmark','denmark'],['Finland','finland'],['France','france'],
    ['Germany','germany'],['Hong Kong','hong-kong'],['Hungary','hungary'],['India','india'],
    ['Ireland','ireland'],['Israel','israel'],['Italy','italy'],['Japan','japan'],
    ['Luxembourg','luxembourg'],['Mexico','mexico'],['Netherlands','netherlands'],['New Zealand','new-zealand'],
    ['Nigeria','nigeria'],['Norway','norway'],['Philippines','philippines'],['Poland','poland'],
    ['Romania','romania'],['Russia','russia'],['South Africa','south-africa'],['South Korea','south-korea'],
    ['Spain','spain'],['Sweden','sweden'],['Switzerland','switzerland'],['Taiwan','taiwan'],
    ['Thailand','thailand'],['Turkey','turkey'],['United Kingdom','united-kingdom'],['United States','united-states']
  ].map(([n,s])=>`<a href="/country/${s}" class="nav-link-item">${n}</a>`).join('');

  const headerHTML = `
<header class="site-header" id="siteHeader">
  <!-- Hamburger (mobile) -->
  <button class="hamburger-btn" id="hamburgerBtn" aria-label="Open menu">
    <span></span><span></span><span></span>
  </button>

  <!-- Logo -->
  <a href="/" class="header-logo">
    <img src="https://i.postimg.cc/X7d0fPtJ/1778142012237-removebg-preview.png" alt="AniOcean" id="siteLogo">
  </a>

  <!-- Desktop Nav -->
  <nav class="main-nav" id="mainNav">
    <a href="/" class="nav-link-item">Home</a>

    <div class="nav-dropdown-trigger nav-link-item">Genre ▾
      <div class="nav-dropdown grid-4">${genreLinks}</div>
    </div>

    <div class="nav-dropdown-trigger nav-link-item">Country ▾
      <div class="nav-dropdown grid-4">${countryLinks}</div>
    </div>

    <div class="nav-dropdown-trigger nav-link-item">Type ▾
      <div class="nav-dropdown grid-1">
        <a href="/type/anime" class="nav-link-item">Anime</a>
        <a href="/type/drama" class="nav-link-item">Drama</a>
        <a href="/type/movie" class="nav-link-item">Movie</a>
        <a href="/type/tv-show" class="nav-link-item">TV Show</a>
      </div>
    </div>

    <a href="/status/ongoing" class="nav-link-item">Ongoing</a>
    <a href="/search?q=updates" class="nav-link-item">Updates</a>
    <a href="#" class="nav-link-item">News</a>
    <a href="#" class="nav-link-item">Forum</a>
  </nav>

  <!-- Desktop Search -->
  <div class="header-search-wrap" id="desktopSearchWrap">
    <div class="header-search-bar">
      <div class="search-toggle-tabs">
        <span class="search-toggle-tab active" data-mode="non-anime">Non-Anime</span>
        <span class="search-toggle-tab" data-mode="anime">Anime</span>
      </div>
      <input type="text" id="searchInput" placeholder="Search shows…" autocomplete="off">
    </div>
    <div class="search-suggestions" id="searchSuggestions"></div>
  </div>

  <!-- Desktop Socials -->
  <div class="header-socials">
    <a href="https://discord.com" target="_blank" class="social-icon-btn" title="Discord">${SVG.discord}</a>
    <a href="https://tumblr.com" target="_blank" class="social-icon-btn" title="Tumblr">${SVG.tumblr}</a>
  </div>

  <!-- Login / Avatar (desktop) -->
  <button class="btn-login" id="btnLogin">Sign In</button>
  <div class="user-avatar-wrap" id="userAvatarWrap">
    <img class="user-avatar" id="userAvatar" src="" alt="Profile">
    <div class="profile-dropdown" id="profileDropdown">
      <div class="profile-dd-header">
        <img id="ddAvatar" src="${DEFAULT_AVATAR}" alt="avatar">
        <div>
          <div class="profile-dd-uname" id="ddUsername">—</div>
          <button class="dd-sign-out" id="btnLogout">${SVG.logout} Sign out</button>
        </div>
      </div>
      <a href="" class="profile-dd-item">${SVG.profile} Profile</a>
      <a href="" class="profile-dd-item">${SVG.film} Continue Watching</a>
      <a href="" class="profile-dd-item">${SVG.list} Watchlist</a>
      <a href="" class="profile-dd-item">${SVG.bar} Stats</a>
      <a href="" class="profile-dd-item">${SVG.settings} Settings</a>
    </div>
  </div>

  <!-- Mobile right controls -->
  <div class="mobile-header-right">
    <a href="https://discord.com" target="_blank" class="mobile-icon-btn">${SVG.discord}</a>
    <a href="https://tumblr.com" target="_blank" class="mobile-icon-btn">${SVG.tumblr}</a>
    <button class="mobile-icon-btn" id="mobileSearchBtn" aria-label="Search">${SVG.search}</button>
    <button class="mobile-icon-btn" id="mobileProfileBtn" aria-label="Profile">${SVG.user}</button>
    <!-- Mobile search panel anchored here -->
    <div class="mobile-search-panel" id="mobileSearchPanel">
      <div class="mobile-search-bar">
        <div class="search-toggle-tabs">
          <span class="search-toggle-tab active" data-mode="non-anime" data-mobile>Non-Anime</span>
          <span class="search-toggle-tab" data-mode="anime" data-mobile>Anime</span>
        </div>
        <input type="text" id="mobileSearchInput" placeholder="Search…" autocomplete="off">
      </div>
      <div class="mobile-search-suggestions" id="mobileSearchSuggestions"></div>
    </div>
    <!-- Mobile avatar -->
    <div class="user-avatar-wrap" id="mobileAvatarWrap" style="display:none;position:relative;">
      <img class="user-avatar" id="mobileUserAvatar" src="" alt="Profile" style="display:block;">
      <div class="profile-dropdown" id="mobileProfileDropdown" style="right:0;">
        <div class="profile-dd-header">
          <img id="mobDdAvatar" src="${DEFAULT_AVATAR}" alt="avatar">
          <div>
            <div class="profile-dd-uname" id="mobDdUsername">—</div>
            <button class="dd-sign-out" id="btnLogoutMob">${SVG.logout} Sign out</button>
          </div>
        </div>
        <a href="" class="profile-dd-item">${SVG.profile} Profile</a>
        <a href="" class="profile-dd-item">${SVG.film} Continue Watching</a>
        <a href="" class="profile-dd-item">${SVG.list} Watchlist</a>
        <a href="" class="profile-dd-item">${SVG.bar} Stats</a>
        <a href="" class="profile-dd-item">${SVG.settings} Settings</a>
      </div>
    </div>
  </div>
</header>

<!-- Mobile nav overlay -->
<div class="mobile-nav-overlay" id="mobileNavOverlay">
  <div class="mobile-nav-panel" id="mobileNavPanel">
    <div class="mobile-nav-close">
      <button id="mobileNavCloseBtn">${SVG.close}</button>
    </div>
    <a href="#" class="mobile-forum-item">💬 Forum / Community</a>
    <a href="/" class="mobile-nav-item">Home</a>

    <div class="mobile-sub-trigger" id="mobileGenreTrigger">Genre <span class="arr">▶</span></div>
    <div class="mobile-sub-menu" id="mobileGenreMenu">
      ${genreLinks.replace(/class="nav-link-item"/g,'style="display:block;"')}
    </div>

    <div class="mobile-sub-trigger" id="mobileCountryTrigger">Country <span class="arr">▶</span></div>
    <div class="mobile-sub-menu" id="mobileCountryMenu">
      ${countryLinks.replace(/class="nav-link-item"/g,'style="display:block;"')}
    </div>

    <div class="mobile-sub-trigger" id="mobileTypeTrigger">Type <span class="arr">▶</span></div>
    <div class="mobile-sub-menu single-col" id="mobileTypeMenu">
      <a href="/type/anime">Anime</a>
      <a href="/type/drama">Drama</a>
      <a href="/type/movie">Movie</a>
      <a href="/type/tv-show">TV Show</a>
    </div>

    <a href="/status/ongoing" class="mobile-nav-item">Ongoing</a>
    <a href="/search?q=updates" class="mobile-nav-item">Updates</a>
    <a href="#" class="mobile-nav-item">News</a>
  </div>
</div>
`;

  /* ═══════════════════════════════════════════════════
     FOOTER HTML
  ═══════════════════════════════════════════════════ */
  const footerHTML = `
<footer class="site-footer" style="background:var(--bg-header,#0d1117);padding:28px 20px;margin-top:50px;border-top:1px solid var(--border-subtle,rgba(255,255,255,0.07));display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:flex-start;">
  <div style="flex:1;min-width:260px;">
    <div style="font-family:var(--font-title);font-size:1.4rem;color:#fff;margin-bottom:8px;">◈ AniOcean</div>
    <p style="font-size:0.82rem;color:var(--text-muted,#888);margin-bottom:12px;line-height:1.6;">Stream free anime, movies, and TV shows on AniOcean. Enjoy fast, high-quality streaming with multi-language subtitles and real-time updates.</p>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
      <span style="font-size:0.78rem;color:#fff;font-weight:600;">Follow us!</span>
      <a href="https://t.me" target="_blank" class="social-icon-btn"><svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M19.2,4.4L2.9,10.7c-1.1,0.4-1.1,1.1-0.2,1.3l4.1,1.3l1.6,4.8c0.2,0.5,0.1,0.7,0.6,0.7c0.4,0,0.6-0.2,0.8-0.4c0.1-0.1,1-1,2-2l4.2,3.1c0.8,0.4,1.3,0.2,1.5-0.7l2.8-13.1C20.6,4.6,19.9,4,19.2,4.4z M17.1,7.4l-7.8,7.1L9,17.8L7.4,13l9.2-5.8C17,6.9,17.4,7.1,17.1,7.4z"/></svg></a>
      <a href="https://bsky.app" target="_blank" class="social-icon-btn"><svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20"><path d="M3 1H0V5C0 6.65685 1.34315 8 3 8L2.03553 8.96447C1.37249 9.62751 1 10.5268 1 11.4645C1 13.4171 2.58291 15 4.53553 15C5.47322 15 6.37249 14.6275 7.03553 13.9645L8 13L8.96447 13.9645C9.62751 14.6275 10.5268 15 11.4645 15C13.4171 15 15 13.4171 15 11.4645C15 10.5268 14.6275 9.62751 13.9645 8.96447L13 8C14.6569 8 16 6.65685 16 5V1H13L8 6L3 1Z"/></svg></a>
      <a href="https://discord.com" target="_blank" class="social-icon-btn">${SVG.discord}</a>
      <a href="https://x.com" target="_blank" class="social-icon-btn"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
      <a href="https://tumblr.com" target="_blank" class="social-icon-btn">${SVG.tumblr}</a>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:0.72rem;margin-bottom:8px;">
      <a href="/" style="color:var(--text-secondary,#ccc);">Home</a>
      <a href="#" style="color:var(--text-secondary,#ccc);">Blog</a>
      <a href="#" style="color:var(--text-secondary,#ccc);">Forum</a>
      <a href="#" style="color:var(--text-secondary,#ccc);">Report</a>
      <a href="#" style="color:var(--text-secondary,#ccc);">Send Request</a>
      <a href="/terms" target="_blank" style="color:var(--text-secondary,#ccc);">Terms &amp; Conditions</a>
      <a href="/privacy" target="_blank" style="color:var(--text-secondary,#ccc);">Privacy Policy</a>
      <a href="#" style="color:var(--text-secondary,#ccc);">Support</a>
    </div>
    <p style="font-size:0.67rem;color:var(--text-muted,#666);">This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
    <p style="font-size:0.67rem;color:var(--text-muted,#666);">Copyright © ${new Date().getFullYear()} AniOcean. All Rights Reserved</p>
  </div>
  <div style="flex-shrink:0;">
    <img src="https://i.postimg.cc/hPqN8Q8v/Chisato-bow-Lycoris-Recoil-01-removebg-preview.png" alt="Mascot" style="height:180px;object-fit:contain;">
  </div>
</footer>`;

  /* ═══════════════════════════════════════════════════
     AUTH MODAL HTML
  ═══════════════════════════════════════════════════ */
  const authModalHTML = `
<div class="auth-overlay" id="authOverlay">
  <div class="auth-modal" id="authModal">
    <!-- Left image -->
    <div class="auth-img-col">
      <img src="https://i.postimg.cc/pr6CQhM8/e1223c0a1599b039da4ac536a39f0223.jpg" alt="AniOcean" id="authSideImg">
    </div>
    <!-- Right form -->
    <div class="auth-form-col">
      <button class="auth-close-btn" id="authCloseBtn">${SVG.close}</button>
      <div class="form-slides-wrapper">
        <div class="form-slides" id="formSlides">

          <!-- SLIDE 0: LOGIN -->
          <div class="form-slide" id="slideLogin">
            <div class="auth-heading">Welcome back 👋</div>
            <div class="auth-subheading">Sign in to continue your anime journey.</div>
            <div class="field-group">
              <label>Username</label>
              <input class="field-input" type="text" id="loginUsername" placeholder="Enter username" autocomplete="username">
            </div>
            <div class="field-group">
              <label>Password</label>
              <div class="field-input-wrap">
                <input class="field-input" type="password" id="loginPassword" placeholder="Enter password" autocomplete="current-password" style="padding-right:38px;">
                <button class="eye-toggle" type="button" data-target="loginPassword">${SVG.eye}</button>
              </div>
            </div>
            <button class="forgot-link" id="forgotLink">Forgot password?</button>
            <div class="cf-turnstile-wrap">
              <div class="cf-turnstile" data-sitekey="${CF_SITEKEY}" data-callback="onTurnstileSuccess" data-theme="dark"></div>
            </div>
            <div class="field-error" id="loginError" style="margin-bottom:10px;text-align:center;"></div>
            <button class="btn-primary" id="btnSignIn">Sign In</button>
            <div class="divider">or</div>
            <button class="btn-google" id="btnGoogleLogin">${SVG.google} Continue with Google</button>
            <div class="auth-switch">Don't have an account? <button class="auth-switch-btn" id="goToSignUp">Sign up</button></div>
          </div>

          <!-- SLIDE 1: SIGN UP -->
          <div class="form-slide" id="slideSignUp">
            <div class="auth-heading">Create account ✨</div>
            <div class="auth-subheading">Join <span>AniOcean</span> — it's free forever.</div>
            <!-- Avatar picker -->
            <div class="avatar-pick-wrap">
              <div class="avatar-frame" id="avatarFrame">
                <img src="${DEFAULT_AVATAR}" id="selectedAvatarImg" alt="avatar">
              </div>
              <div class="avatar-pick-label">Pick your avatar</div>
            </div>
            <div class="field-group">
              <label>Username <span style="font-size:.6rem;color:#888;">(max 12, letters & numbers)</span></label>
              <input class="field-input" type="text" id="regUsername" placeholder="e.g. OtakuNinja" maxlength="12" autocomplete="off">
              <div class="field-error" id="usernameError"></div>
            </div>
            <div class="field-group">
              <label>Email Address</label>
              <input class="field-input" type="email" id="regEmail" placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="field-group">
              <label>Password <span style="font-size:.6rem;color:#888;">(max 20)</span></label>
              <div class="field-input-wrap">
                <input class="field-input" type="password" id="regPassword" placeholder="Min 8 chars, letters+numbers+symbols" maxlength="20" style="padding-right:38px;" autocomplete="new-password">
                <button class="eye-toggle" type="button" data-target="regPassword">${SVG.eye}</button>
              </div>
              <div class="pwd-strength-bar"><div class="pwd-strength-fill" id="pwdStrengthFill"></div></div>
              <div class="pwd-strength-text" id="pwdStrengthText"></div>
            </div>
            <div class="field-group">
              <label>Confirm Password</label>
              <div class="field-input-wrap">
                <input class="field-input" type="password" id="regConfirm" placeholder="Repeat password" maxlength="20" style="padding-right:38px;" autocomplete="new-password">
                <button class="eye-toggle" type="button" data-target="regConfirm">${SVG.eye}</button>
              </div>
              <div class="field-error" id="confirmError"></div>
            </div>
            <div class="divider">or</div>
            <button class="btn-google" id="btnGoogleSignUp">${SVG.google} Sign up with Google</button>
            <div class="terms-row">
              <input type="checkbox" id="termsCheck">
              <label for="termsCheck">I have read and agree to the <a href="/terms" target="_blank">Terms &amp; Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.</label>
            </div>
            <div class="field-error" id="signUpError" style="margin-bottom:10px;text-align:center;"></div>
            <button class="btn-primary" id="btnSignUp">Create Account</button>
            <div class="auth-switch">Already have an account? <button class="auth-switch-btn" id="goToLogin">Sign in</button></div>
          </div>

          <!-- SLIDE 2: FORGOT PASSWORD -->
          <div class="form-slide" id="slideForgot">
            <div class="auth-heading">Reset password 🔑</div>
            <div class="auth-subheading">Enter your email and we'll send a reset link.</div>
            <div class="field-group">
              <label>Email Address</label>
              <input class="field-input" type="email" id="resetEmail" placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="field-error" id="resetError" style="margin-bottom:10px;text-align:center;"></div>
            <div id="resetSuccess" class="form-success" style="display:none;">
              <span class="icon">📧</span>
              Check your inbox! We sent a password reset link to your email.
            </div>
            <button class="btn-primary" id="btnResetPwd">Reset Password</button>
            <div class="auth-switch"><button class="auth-switch-btn" id="backToLogin">← Back to Sign In</button></div>
          </div>

        </div><!-- /form-slides -->
      </div><!-- /form-slides-wrapper -->
    </div><!-- /auth-form-col -->
  </div><!-- /auth-modal -->
</div><!-- /auth-overlay -->

<!-- Avatar picker popup -->
<div class="avatar-popup-overlay" id="avatarPopupOverlay">
  <div class="avatar-popup" id="avatarPopup">
    <div class="avatar-popup-header">
      <span class="avatar-popup-title">Choose Avatar</span>
      <label class="avatar-upload-btn" for="avatarFileInput">${SVG.upload} Upload</label>
    </div>
    <input type="file" id="avatarFileInput" accept="image/*" style="display:none;">
    <div class="avatar-grid" id="avatarGrid">
      <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted,#888);font-size:0.76rem;">Loading avatars…</div>
    </div>
  </div>
</div>
`;

  /* ═══════════════════════════════════════════════════
     INSERT INTO PAGE
  ═══════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    document.body.insertAdjacentHTML('beforeend', authModalHTML);

    // Load Cloudflare Turnstile
    const cfScript = document.createElement('script');
    cfScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    cfScript.async = true; cfScript.defer = true;
    document.head.appendChild(cfScript);

    initHeader();
    initSearch();
    initAuthModal();
    initAvatarPicker();
    updateUserUI();

    // Auth state change
    supabase.auth.onAuthStateChange((_event, session) => {
      currentUser = session?.user || null;
      updateUserUI();
    });
  });

  /* ═══════════════════════════════════════════════════
     HEADER INTERACTIONS
  ═══════════════════════════════════════════════════ */
  function initHeader() {
    // Desktop nav dropdowns (hover)
    document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
      const dd = trigger.querySelector('.nav-dropdown');
      if (!dd) return;
      trigger.addEventListener('mouseenter', () => dd.style.display = dd.classList.contains('grid-4') ? 'grid' : 'block');
      trigger.addEventListener('mouseleave', () => dd.style.display = 'none');
    });

    // Login button
    document.getElementById('btnLogin')?.addEventListener('click', () => openModal(0));

    // Desktop avatar toggle
    document.getElementById('userAvatar')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('profileDropdown').classList.toggle('open');
    });
    document.getElementById('mobileUserAvatar')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('mobileProfileDropdown').classList.toggle('open');
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#userAvatarWrap')) {
        document.getElementById('profileDropdown')?.classList.remove('open');
      }
      if (!e.target.closest('#mobileAvatarWrap')) {
        document.getElementById('mobileProfileDropdown')?.classList.remove('open');
      }
    });

    // Logout buttons
    ['btnLogout','btnLogoutMob'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        updateUserUI();
      });
    });

    // Hamburger
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileOverlay = document.getElementById('mobileNavOverlay');
    const mobilePanel = document.getElementById('mobileNavPanel');
    const mobileCloseBtn = document.getElementById('mobileNavCloseBtn');

    function openMobileNav() {
      hamburgerBtn.classList.add('open');
      mobileOverlay.classList.add('open');
      mobilePanel.classList.add('open');
    }
    function closeMobileNav() {
      hamburgerBtn.classList.remove('open');
      mobileOverlay.classList.remove('open');
      mobilePanel.classList.remove('open');
    }

    hamburgerBtn?.addEventListener('click', openMobileNav);
    mobileCloseBtn?.addEventListener('click', closeMobileNav);
    mobileOverlay?.addEventListener('click', (e) => {
      if (!e.target.closest('#mobileNavPanel')) closeMobileNav();
    });

    // Mobile sub-menus
    [['mobileGenreTrigger','mobileGenreMenu'],
     ['mobileCountryTrigger','mobileCountryMenu'],
     ['mobileTypeTrigger','mobileTypeMenu']].forEach(([triggerId, menuId]) => {
      const trigger = document.getElementById(triggerId);
      const menu = document.getElementById(menuId);
      trigger?.addEventListener('click', () => {
        const open = menu.classList.contains('visible');
        menu.classList.toggle('visible', !open);
        trigger.classList.toggle('open', !open);
      });
    });

    // Mobile search
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const mobileSearchPanel = document.getElementById('mobileSearchPanel');
    mobileSearchBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileSearchPanel.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#mobileSearchPanel') && !e.target.closest('#mobileSearchBtn')) {
        mobileSearchPanel?.classList.remove('open');
      }
    });

    // Mobile profile button
    document.getElementById('mobileProfileBtn')?.addEventListener('click', () => {
      if (currentUser) {
        document.getElementById('mobileAvatarWrap').style.display = 'block';
        document.getElementById('mobileProfileDropdown').classList.toggle('open');
      } else {
        openModal(0);
      }
    });
  }

  /* ═══════════════════════════════════════════════════
     SEARCH ENGINE
  ═══════════════════════════════════════════════════ */
  function initSearch() {
    // Desktop tabs
    document.querySelectorAll('.search-toggle-tab:not([data-mobile])').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.search-toggle-tab:not([data-mobile])').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentSearchMode = this.dataset.mode;
      });
    });
    // Mobile tabs
    document.querySelectorAll('.search-toggle-tab[data-mobile]').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.search-toggle-tab[data-mobile]').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentSearchMode = this.dataset.mode;
      });
    });

    // Desktop input
    const searchInput = document.getElementById('searchInput');
    const searchSugg = document.getElementById('searchSuggestions');
    searchInput?.addEventListener('input', function () {
      handleSearchInput(this.value, searchSugg, false);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#desktopSearchWrap')) searchSugg.style.display = 'none';
    });

    // Mobile input
    const mobileInput = document.getElementById('mobileSearchInput');
    const mobileSugg = document.getElementById('mobileSearchSuggestions');
    mobileInput?.addEventListener('input', function () {
      handleSearchInput(this.value, mobileSugg, true);
    });
  }

  function handleSearchInput(query, container, isMobile) {
    clearTimeout(searchDebounceTimer);
    if (query.trim().length < 3) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    container.innerHTML = `<div style="padding:14px 12px;font-size:0.76rem;color:var(--text-muted,#888);">Searching…</div>`;
    searchDebounceTimer = setTimeout(() => fetchSuggestions(query.trim(), container, isMobile), 280);
  }

  async function fetchSuggestions(q, container, isMobile) {
    try {
      let results = [];
      if (currentSearchMode === 'anime') {
        results = await fetchJikan(q);
      } else {
        results = await fetchTMDB(q);
      }
      renderSuggestions(results.slice(0, 6), q, container, isMobile);
    } catch {
      container.innerHTML = `<div style="padding:14px 12px;font-size:0.76rem;color:var(--text-muted,#888);">Failed to fetch results.</div>`;
    }
  }

  async function fetchJikan(q) {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=6&order_by=score&sort=desc`);
    const data = await res.json();
    return (data.data || []).map(item => {
      const aired = item.aired?.from ? new Date(item.aired.from) : null;
      const monthYear = aired ? aired.toLocaleDateString('en-US', {month:'long',year:'numeric'}) : '—';
      let duration = item.duration || '—';
      if (duration === 'Unknown') duration = '—';
      return {
        poster: item.images?.jpg?.image_url || '',
        title: item.title_english || item.title || '—',
        original: item.title_japanese || item.title || '',
        year: monthYear,
        type: item.type || '—',
        duration: duration,
        score: item.score ? `${item.score}` : null,
        scoreLabel: 'MAL'
      };
    });
  }

  async function fetchTMDB(q) {
    const KEY = TMDB_API_KEY;
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${KEY}&query=${encodeURIComponent(q)}&page=1&include_adult=false`);
    const data = await res.json();
    return (data.results || [])
      .filter(r => r.media_type === 'tv' || r.media_type === 'movie')
      .slice(0, 6)
      .map(item => {
        const date = item.release_date || item.first_air_date;
        const monthYear = date ? new Date(date).toLocaleDateString('en-US', {month:'long',year:'numeric'}) : '—';
        const typeLabel = item.media_type === 'movie' ? 'Movie' : 'TV Show';
        return {
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '',
          title: item.title || item.name || '—',
          original: item.original_title || item.original_name || '',
          year: monthYear,
          type: typeLabel,
          duration: '—',
          score: item.vote_average ? item.vote_average.toFixed(1) : null,
          scoreLabel: 'TMDB'
        };
      });
  }

  function renderSuggestions(results, q, container, isMobile) {
    if (!results.length) {
      container.innerHTML = `<div style="padding:14px 12px;font-size:0.76rem;color:var(--text-muted,#888);">No results for "${q}"</div>`;
      return;
    }
    let html = results.map(r => {
      const poster = r.poster
        ? `<img class="suggestion-poster" src="${r.poster}" alt="" loading="lazy" onerror="this.style.background='var(--bg-surface)';">`
        : `<div class="suggestion-poster" style="background:var(--bg-surface,#1e2633);"></div>`;
      const scoreHtml = r.score
        ? `<span class="suggestion-score">${SVG.star}${r.scoreLabel} ${r.score}</span>`
        : '';
      const meta = [r.year, r.type, r.duration, scoreHtml ? scoreHtml : ''].filter(Boolean).join(' · ');
      const origHtml = r.original && r.original !== r.title
        ? `<div class="suggestion-original">${escHtml(r.original)}</div>` : '';
      return `<div class="suggestion-item">
        ${poster}
        <div class="suggestion-info">
          <div class="suggestion-title">${escHtml(r.title)}</div>
          ${origHtml}
          <div class="suggestion-meta">${meta}</div>
        </div>
      </div>`;
    }).join('');
    html += `<button class="view-all-btn">${SVG.arrow} View all results</button>`;
    container.innerHTML = html;
    container.style.display = 'block';

    // View all
    container.querySelector('.view-all-btn')?.addEventListener('click', () => {
      window.location.href = `/search?q=${encodeURIComponent(q)}&type=${currentSearchMode}`;
    });
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ═══════════════════════════════════════════════════
     AUTH MODAL
  ═══════════════════════════════════════════════════ */
  let currentSlide = 0;
  let cfToken = '';
  window.onTurnstileSuccess = (token) => { cfToken = token; };

  function openModal(slide = 0) {
    document.getElementById('authOverlay').classList.add('open');
    slideTo(slide);
    // Reset form errors
    ['loginError','signUpError','resetError','confirmError','usernameError'].forEach(id => {
      const el = document.getElementById(id); if (el) el.textContent = '';
    });
    document.getElementById('resetSuccess').style.display = 'none';
  }
  window.openLoginModal = () => openModal(0);

  function closeModal() { document.getElementById('authOverlay').classList.remove('open'); }

  function slideTo(n) {
    currentSlide = n;
    document.getElementById('formSlides').style.transform = `translateX(-${n * 100}%)`;
  }

  function initAuthModal() {
    // Close button
    document.getElementById('authCloseBtn')?.addEventListener('click', closeModal);
    document.getElementById('authOverlay')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('authOverlay')) closeModal();
    });

    // Slide navigation
    document.getElementById('goToSignUp')?.addEventListener('click', () => slideTo(1));
    document.getElementById('goToLogin')?.addEventListener('click', () => slideTo(0));
    document.getElementById('forgotLink')?.addEventListener('click', () => slideTo(2));
    document.getElementById('backToLogin')?.addEventListener('click', () => slideTo(0));

    // Eye toggles
    document.querySelectorAll('.eye-toggle').forEach(btn => {
      btn.addEventListener('click', function () {
        const inp = document.getElementById(this.dataset.target);
        if (!inp) return;
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        this.innerHTML = show ? SVG.eyeOff : SVG.eye;
      });
    });

    // Username validation (alphanumeric only)
    document.getElementById('regUsername')?.addEventListener('input', function () {
      this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
      const err = document.getElementById('usernameError');
      if (err) err.textContent = this.value.length < 3 ? 'Username must be at least 3 characters.' : '';
    });

    // Password strength
    document.getElementById('regPassword')?.addEventListener('input', function () {
      updatePasswordStrength(this.value);
    });

    // Confirm password
    document.getElementById('regConfirm')?.addEventListener('input', function () {
      const pwd = document.getElementById('regPassword')?.value || '';
      const err = document.getElementById('confirmError');
      if (err) err.textContent = this.value && this.value !== pwd ? 'Passwords do not match.' : '';
    });

    // Sign In
    document.getElementById('btnSignIn')?.addEventListener('click', async () => {
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errEl = document.getElementById('loginError');
      errEl.textContent = '';
      if (!username || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
      // Find email by username from profiles table
      const btn = document.getElementById('btnSignIn');
      btn.disabled = true; btn.textContent = 'Signing in…';
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', username)
          .single();
        let email = username; // fallback: allow email login
        if (profile?.email) email = profile.email;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { errEl.textContent = error.message; }
        else { closeModal(); }
      } catch (e) {
        errEl.textContent = 'An error occurred. Please try again.';
      } finally {
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    });

    // Google Sign In/Up
    ['btnGoogleLogin','btnGoogleSignUp'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin }
        });
      });
    });

    // Sign Up
    document.getElementById('btnSignUp')?.addEventListener('click', async () => {
      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;
      const terms = document.getElementById('termsCheck').checked;
      const errEl = document.getElementById('signUpError');
      errEl.textContent = '';

      if (!username || !email || !password || !confirm) { errEl.textContent = 'Please fill in all fields.'; return; }
      if (!/^[a-zA-Z0-9]+$/.test(username)) { errEl.textContent = 'Username can only contain letters and numbers.'; return; }
      if (username.length < 3) { errEl.textContent = 'Username must be at least 3 characters.'; return; }
      if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }
      if (!isStrongPassword(password)) { errEl.textContent = 'Password must include uppercase, lowercase, number, and symbol.'; return; }
      if (!terms) { errEl.textContent = 'Please accept the Terms & Conditions and Privacy Policy.'; return; }

      const btn = document.getElementById('btnSignUp');
      btn.disabled = true; btn.textContent = 'Creating account…';
      try {
        // Check username availability
        const { data: existing } = await supabase.from('profiles').select('id').eq('username', username);
        if (existing && existing.length > 0) { errEl.textContent = 'Username already taken.'; btn.disabled = false; btn.textContent = 'Create Account'; return; }

        const avatarUrl = document.getElementById('selectedAvatarImg').src || DEFAULT_AVATAR;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              avatar_url: avatarUrl,
              display_name: username
            }
          }
        });
        if (error) { errEl.textContent = error.message; return; }

        // Upsert profile row
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            email,
            avatar_url: avatarUrl
          });
        }
        closeModal();
        alert('Account created! Please check your email to verify your account.');
      } catch (e) {
        errEl.textContent = 'An error occurred. Please try again.';
      } finally {
        btn.disabled = false; btn.textContent = 'Create Account';
      }
    });

    // Password reset
    document.getElementById('btnResetPwd')?.addEventListener('click', async () => {
      const email = document.getElementById('resetEmail').value.trim();
      const errEl = document.getElementById('resetError');
      const successEl = document.getElementById('resetSuccess');
      errEl.textContent = ''; successEl.style.display = 'none';
      if (!email) { errEl.textContent = 'Please enter your email.'; return; }
      const btn = document.getElementById('btnResetPwd');
      btn.disabled = true; btn.textContent = 'Sending…';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });
      btn.disabled = false; btn.textContent = 'Reset Password';
      if (error) { errEl.textContent = error.message; }
      else { successEl.style.display = 'block'; }
    });
  }

  function isStrongPassword(pwd) {
    return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8;
  }

  function updatePasswordStrength(pwd) {
    const fill = document.getElementById('pwdStrengthFill');
    const text = document.getElementById('pwdStrengthText');
    if (!fill || !text) return;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { pct:0, color:'', label:'' },
      { pct:20, color:'#ef4444', label:'Very Weak' },
      { pct:40, color:'#f97316', label:'Weak' },
      { pct:60, color:'#eab308', label:'Fair' },
      { pct:80, color:'#22c55e', label:'Strong' },
      { pct:100, color:'#10b981', label:'Very Strong' }
    ];
    const lvl = levels[score] || levels[0];
    fill.style.width = lvl.pct + '%';
    fill.style.background = lvl.color;
    text.textContent = lvl.label;
    text.style.color = lvl.color;
  }

  /* ═══════════════════════════════════════════════════
     AVATAR PICKER
  ═══════════════════════════════════════════════════ */
  let selectedAvatarUrl = DEFAULT_AVATAR;

  function initAvatarPicker() {
    const frame = document.getElementById('avatarFrame');
    const overlay = document.getElementById('avatarPopupOverlay');
    const popup = document.getElementById('avatarPopup');

    frame?.addEventListener('click', async () => {
      overlay.classList.add('open');
      await loadBucketAvatars();
    });

    overlay?.addEventListener('click', (e) => {
      if (!e.target.closest('#avatarPopup')) overlay.classList.remove('open');
    });

    // File upload
    document.getElementById('avatarFileInput')?.addEventListener('change', async function () {
      const file = this.files[0];
      if (!file) return;
      const resized = await resizeImage(file, 256, 256);
      const blob = await (await fetch(resized)).blob();
      const ext = file.name.split('.').pop();
      const path = `user_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('Profile Images').upload(path, blob, { upsert: true, contentType: file.type });
      if (!error && data) {
        const url = `${PROFILE_BUCKET_URL}${path}`;
        setSelectedAvatar(url);
        overlay.classList.remove('open');
      } else {
        // Fallback: use local preview
        setSelectedAvatar(resized);
        overlay.classList.remove('open');
      }
    });
  }

  async function loadBucketAvatars() {
    const grid = document.getElementById('avatarGrid');
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted,#888);font-size:0.76rem;">Loading…</div>`;
    const { data, error } = await supabase.storage.from('Profile Images').list('', { limit: 50 });
    if (error || !data || data.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted,#888);font-size:0.76rem;">No avatars found. Upload your own!</div>`;
      return;
    }
    const imgs = data.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name));
    grid.innerHTML = imgs.map(f => {
      const url = `${PROFILE_BUCKET_URL}${f.name}`;
      return `<div class="avatar-option${url===selectedAvatarUrl?' selected':''}" data-url="${url}">
        <img src="${url}" alt="${f.name}" loading="lazy">
      </div>`;
    }).join('');
    grid.querySelectorAll('.avatar-option').forEach(opt => {
      opt.addEventListener('click', function () {
        grid.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        setSelectedAvatar(this.dataset.url);
        document.getElementById('avatarPopupOverlay').classList.remove('open');
      });
    });
  }

  function setSelectedAvatar(url) {
    selectedAvatarUrl = url;
    document.getElementById('selectedAvatarImg').src = url;
  }

  function resizeImage(file, maxW, maxH) {
    return new Promise(resolve => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const scale = Math.min(maxW/w, maxH/h);
          w = Math.round(w*scale); h = Math.round(h*scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL(file.type || 'image/jpeg', 0.85));
      };
      reader.readAsDataURL(file);
    });
  }

  /* ═══════════════════════════════════════════════════
     UPDATE USER UI
  ═══════════════════════════════════════════════════ */
  async function updateUserUI() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;

    const btnLogin = document.getElementById('btnLogin');
    const userAvatar = document.getElementById('userAvatar');
    const mobileProfileBtn = document.getElementById('mobileProfileBtn');
    const mobileAvatarWrap = document.getElementById('mobileAvatarWrap');
    const mobileUserAvatar = document.getElementById('mobileUserAvatar');

    if (user) {
      // Get profile
      const { data: profile } = await supabase.from('profiles').select('username,avatar_url').eq('id', user.id).single();
      const username = profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'User';
      const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || DEFAULT_AVATAR;

      if (btnLogin) btnLogin.style.display = 'none';
      if (userAvatar) { userAvatar.style.display = 'block'; userAvatar.src = avatarUrl; }

      // Update dropdown info
      ['ddAvatar','mobDdAvatar'].forEach(id => { const el = document.getElementById(id); if (el) el.src = avatarUrl; });
      ['ddUsername','mobDdUsername'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = username; });

      // Mobile
      if (mobileProfileBtn) mobileProfileBtn.style.display = 'none';
      if (mobileAvatarWrap) { mobileAvatarWrap.style.display = 'flex'; }
      if (mobileUserAvatar) { mobileUserAvatar.src = avatarUrl; }
    } else {
      if (btnLogin) btnLogin.style.display = '';
      if (userAvatar) userAvatar.style.display = 'none';
      if (mobileProfileBtn) mobileProfileBtn.style.display = 'flex';
      if (mobileAvatarWrap) mobileAvatarWrap.style.display = 'none';
    }
  }

  /* ═══════════════════════════════════════════════════
     GLOBALS
  ═══════════════════════════════════════════════════ */
  window.supabaseClient = supabase;
  window.openLoginModal = () => openModal(0);
  window.signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };
})();
