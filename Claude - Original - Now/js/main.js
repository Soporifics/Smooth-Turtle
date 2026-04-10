/* ============================================
   SMOOTH TURTLE — Main JavaScript
   www.smoothturtle.com
   ============================================ */

(function () {
  'use strict';

  /* ---- Theme (Dark / Light) ---- */
  const themeToggle  = document.getElementById('theme-toggle');
  const themeIconEl  = document.getElementById('theme-icon');
  const root         = document.documentElement;

  function getTheme()  { return localStorage.getItem('st-theme') || 'dark'; }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('st-theme', theme);
    if (themeIconEl) {
      themeIconEl.textContent = theme === 'dark' ? '☀' : '🌙';
    }
  }

  applyTheme(getTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---- Mobile Navigation ---- */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Active Nav Link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Scroll Fade-In ---- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Homepage Video Carousel ---- */
  const vcSlides = document.querySelectorAll('.vc-slide');
  const vcDots   = document.querySelectorAll('.vc-dot');
  const vcWrap   = document.getElementById('video-carousel');

  if (vcSlides.length) {
    let current = 0;
    let timer;

    function showSlide(index) {
      vcSlides.forEach(function (s, i) { s.classList.toggle('active', i === index); });
      vcDots.forEach(function (d, i)   { d.classList.toggle('active', i === index); });
      current = index;
    }

    function nextSlide() {
      showSlide((current + 1) % vcSlides.length);
    }

    function startTimer() { timer = setInterval(nextSlide, 4500); }
    function stopTimer()  { clearInterval(timer); }

    showSlide(0);
    startTimer();

    vcDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stopTimer();
        showSlide(i);
        startTimer();
      });
    });

    if (vcWrap) {
      vcWrap.addEventListener('mouseenter', stopTimer);
      vcWrap.addEventListener('mouseleave', startTimer);
    }
  }

  /* ---- Video Modal — supports local video AND YouTube iframe ---- */
  const videoModal   = document.getElementById('video-modal');
  const modalClose   = document.getElementById('modal-close');
  const modalVideo   = document.getElementById('modal-video');
  const modalTitle   = document.getElementById('modal-title');
  const modalCaption = document.getElementById('modal-caption');

  if (videoModal) {
    var modalIframe = null;

    function getOrCreateIframe() {
      if (!modalIframe) {
        modalIframe = document.createElement('iframe');
        modalIframe.id = 'modal-iframe';
        modalIframe.setAttribute('allowfullscreen', '');
        modalIframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        modalIframe.style.cssText = 'width:100%;aspect-ratio:16/9;border:0;border-radius:12px;display:block;';
        if (modalVideo && modalVideo.parentNode) {
          modalVideo.parentNode.insertBefore(modalIframe, modalVideo);
        }
      }
      return modalIframe;
    }

    document.querySelectorAll('.video-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var src     = card.dataset.videoSrc     || '';
        var title   = card.dataset.videoTitle   || '';
        var caption = card.dataset.videoCaption || '';
        var isYoutubeWatch = src.indexOf('youtube.com/watch') !== -1 || src.indexOf('youtu.be/') !== -1;
        var isYoutubeEmbed = src.indexOf('youtube.com/embed') !== -1;

        // YouTube watch links open directly in a new tab (avoids embed errors)
        if (isYoutubeWatch) {
          window.open(src, '_blank', 'noopener,noreferrer');
          return;
        }

        if (isYoutubeEmbed) {
          if (modalVideo) modalVideo.style.display = 'none';
          var iframe = getOrCreateIframe();
          iframe.style.display = 'block';
          iframe.src = src + '&autoplay=1';
        } else {
          if (modalIframe) { modalIframe.src = ''; modalIframe.style.display = 'none'; }
          if (modalVideo) {
            modalVideo.style.display = 'block';
            modalVideo.src = src;
            modalVideo.load();
          }
        }

        if (modalTitle)   modalTitle.textContent   = title;
        if (modalCaption) modalCaption.textContent = caption;

        videoModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      videoModal.classList.remove('open');
      if (modalIframe) { modalIframe.src = ''; modalIframe.style.display = 'none'; }
      if (modalVideo)  { modalVideo.pause(); modalVideo.src = ''; }
      document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    videoModal.addEventListener('click', function (e) {
      if (e.target === videoModal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ---- Contact Form (basic client-side feedback) ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const orig = btn ? btn.textContent : '';
      if (btn) {
        btn.textContent = '✔ Message Sent!';
        btn.disabled = true;
        btn.style.background = 'var(--accent-green)';
      }
      setTimeout(function () {
        if (btn) {
          btn.textContent = orig;
          btn.disabled = false;
          btn.style.background = '';
        }
        contactForm.reset();
      }, 3500);
    });
  }

  /* ---- Nav Dropdown (click only — no hover gap issue) ---- */
  document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
    var trigger = dd.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var open = dd.classList.toggle('open');
      trigger.setAttribute('aria-expanded', open);
    });

    // Close when clicking outside the dropdown
    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) {
        dd.classList.remove('open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

})();

/* ============================================================
   ADDITIONAL EFFECTS — Ripple, Particles, AI Demo
   ============================================================ */
(function () {
  'use strict';

  /* ---- Ripple Click Effect ---- */
  document.addEventListener('click', function (e) {
    var ripple = document.createElement('div');
    ripple.className = 'ripple-circle';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top  = e.clientY + 'px';
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', function () { ripple.remove(); });
  });

  /* ---- Underwater Particle Background ---- */
  var heroParticleWrap = document.getElementById('hero-particles');
  if (heroParticleWrap) {
    var PARTICLE_COUNT = 36;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      (function () {
        var p = document.createElement('div');
        var size = Math.random() * 5 + 2;
        var left = Math.random() * 100;
        var delay = Math.random() * 18;
        var duration = Math.random() * 14 + 10;
        var drift = (Math.random() - 0.5) * 120;
        var opacity = Math.random() * 0.35 + 0.08;
        p.style.cssText = [
          'position:absolute',
          'border-radius:50%',
          'width:'  + size + 'px',
          'height:' + size + 'px',
          'left:'   + left + '%',
          'bottom: -10px',
          'background:rgba(46,196,182,' + opacity + ')',
          'animation:particle-float ' + duration + 's ' + delay + 's linear infinite',
          '--drift:' + drift + 'px'
        ].join(';');
        heroParticleWrap.appendChild(p);
      })();
    }

    var styleTag = document.createElement('style');
    styleTag.textContent = '@keyframes particle-float{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:1}90%{opacity:0.3}100%{transform:translateY(-100vh) translateX(var(--drift));opacity:0}}';
    document.head.appendChild(styleTag);
  }

  /* ---- AI Demo — Carpet Unroll Reveal ---- */
  var demoCard = document.getElementById('ai-demo-card');
  if (!demoCard) return;

  var qEl  = document.getElementById('ai-demo-question');
  var aEl  = document.getElementById('ai-demo-answer');
  var tabs = document.querySelectorAll('.ai-demo-tab');

  var demos = [
    {
      tab: '🎣 Fishing',
      q: 'What are the best fishing techniques and bait for our state and waterway types? Break it down...',
      a: 'Great topic — Florida is one of the best fishing states in the country!\n\nHere\'s the breakdown by waterway type:\n\n🎣 Tampa Bay & Gulf Coast: Live shrimp and pinfish for redfish and snook. Drift fishing works great in the shallower flats.\n\n🌊 Freshwater Lakes: Plastic worms or shiners for largemouth bass — Lake Okeechobee is legendary.\n\n🌿 Mangrove Flats: Sight-fish for snook at low tide using soft plastic shrimp lures near the root structure.\n\n💡 Pro tip: Ask AI for tidal charts, moon phase data, and real-time weather for your next trip — I can customize it for any spot!'
    },
    {
      tab: '🏪 Small Business',
      q: 'I run a small restaurant. How can AI help me get more customers this week?',
      a: 'Here are 5 things AI can do for your restaurant — starting right now:\n\n✍️ Write your next 10 Instagram posts in under 5 minutes — captions, hashtags, and all.\n\n⭐ Draft professional, friendly responses to every Google or Yelp review (good and bad).\n\n📧 Create a loyalty email to send returning customers a special offer.\n\n📅 Build a weekly seasonal specials schedule so your menu never gets stale.\n\n💡 AI can even analyze your peak hours and suggest staffing adjustments — no consultant needed!'
    },
    {
      tab: '✈️ Travel',
      q: 'Help me plan a 5-day Italy trip on a budget. I want real tips.',
      a: 'Here\'s your smooth Italian adventure — budget edition:\n\n✈️ Fly into Rome, train to Florence ($25-40), end in Venice — saves a return flight.\n\n🏨 Local guesthouses & B&Bs: $50-80/night, often with breakfast included.\n\n🍝 Rome (Day 1-2): Colosseum, Trastevere neighborhood, $2 street pizza slices.\n\n🛕 Florence (Day 3): Uffizi Gallery, Ponte Vecchio, world\'s best gelato (Gelateria dei Neri).\n\n🚤 Venice (Day 4-5): Arrive by train, explore on foot — skip the $120 gondola, take the $2 vaporetto.\n\n💡 I can translate menus, find hidden restaurants locals love, and check live prices for any of these stops!'
    },
    {
      tab: '🔧 DIY Home',
      q: 'My bathroom grout is cracking and discolored everywhere. What\'s the fix and how hard is it?',
      a: 'Totally fixable — here\'s your step-by-step AI repair plan:\n\n🔧 Tools needed: Grout saw ($8), matching grout, rubber float, bucket, grout sponge.\n\n⚡ Step 1: Score out the cracked grout with the grout saw — takes about 15 min per section.\n\n🧹 Step 2: Vacuum debris, lightly dampen tile joints with a spray bottle.\n\n✨ Step 3: Mix grout per package instructions, press into joints at a 45° angle with the rubber float.\n\n⏰ Step 4: Wipe excess after 20 minutes — let cure 48 hours before getting wet.\n\n💡 Take a photo of your tile and send it to AI — I can match the exact grout color and brand so it blends perfectly!'
    }
  ];

  var currentDemo = 0, autoTimer;

  function showDemo(idx) {
    currentDemo = idx;
    clearTimeout(autoTimer);

    tabs.forEach(function (t, i) { t.classList.toggle('active', i === idx); });

    var d = demos[idx];

    // Show question with a quick fade
    if (qEl) {
      qEl.style.opacity = '0';
      qEl.textContent = d.q;
      requestAnimationFrame(function () {
        qEl.style.transition = 'opacity 0.5s ease';
        qEl.style.opacity = '1';
      });
    }

    // Show answer with carpet-unroll reveal (all text at once, slides down in ~1s)
    if (aEl) {
      aEl.textContent = d.a;
      aEl.classList.remove('unrolling');
      void aEl.offsetWidth; // force reflow to restart animation
      aEl.classList.add('unrolling');
    }

    // Auto-advance: 1s unroll + 5s reading time = 6s total
    autoTimer = setTimeout(function () {
      showDemo((currentDemo + 1) % demos.length);
    }, 6000);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      showDemo(i);
    });
  });

  showDemo(0);

})();

/* ============================================================
   AI WORD — Auto-highlight standalone "AI" + hover tooltip
   ============================================================ */
(function () {
  'use strict';

  /* Tags to skip entirely when walking the DOM */
  var SKIP_TAGS = ['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','CODE','PRE',
                   'INPUT','SELECT','OPTION','BUTTON','NAV','META','HEAD'];

  function wrapAIInNode(textNode) {
    var text = textNode.nodeValue;
    if (!/\bAI\b/.test(text)) return;

    var parent = textNode.parentNode;
    /* Skip if already inside an .ai-word span */
    if (parent && parent.classList && parent.classList.contains('ai-word')) return;

    var parts = text.split(/\b(AI)\b/);
    if (parts.length < 3) return; /* no real match */

    var frag = document.createDocumentFragment();
    parts.forEach(function (part) {
      if (part === 'AI') {
        var span = document.createElement('span');
        span.className = 'ai-word';
        span.textContent = 'AI';
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });
    parent.replaceChild(frag, textNode);
  }

  function walkAndWrap(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var tag = node.parentNode ? node.parentNode.tagName.toUpperCase() : '';
        if (SKIP_TAGS.indexOf(tag) !== -1) return NodeFilter.FILTER_REJECT;
        /* Skip attribute-like contexts and already-wrapped */
        if (node.parentNode && node.parentNode.classList &&
            node.parentNode.classList.contains('ai-word')) {
          return NodeFilter.FILTER_REJECT;
        }
        /* Skip hero-stat boxes — too tight for inline styling */
        var el = node.parentNode;
        while (el) {
          if (el.classList && (el.classList.contains('hero-stat') ||
              el.classList.contains('hero-stats'))) {
            return NodeFilter.FILTER_REJECT;
          }
          el = el.parentNode;
        }
        return /\bAI\b/.test(node.nodeValue)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });

    var nodes = [];
    var n;
    while ((n = walker.nextNode())) { nodes.push(n); }
    nodes.forEach(wrapAIInNode);
  }

  /* Run once after page load */
  walkAndWrap(document.body);

  /* ---- Tooltip: replay on each mouseenter ---- */
  document.addEventListener('mouseenter', function (e) {
    var t = e.target;
    if (!t || !t.classList) return;

    if (t.classList.contains('ai-word')) {
      t.classList.remove('show-tip');
      void t.offsetWidth; /* force reflow so animation restarts */
      t.classList.add('show-tip');
      setTimeout(function () { t.classList.remove('show-tip'); }, 1400);
    }

    if (t.classList.contains('footer-ai-credit')) {
      t.classList.remove('show-tip');
      void t.offsetWidth;
      t.classList.add('show-tip');
      setTimeout(function () { t.classList.remove('show-tip'); }, 2300);
    }
  }, true /* capture phase so it works on every element */);

}());
