/* Mohammed Rauf - portfolio behaviour. No framework, no build step, no network
   calls: it runs from any static host, including a plain folder. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  window.__siteReady = true;   // tells the head script's failsafe we arrived

  /* Power BI screens. Listed here rather than discovered, so a missing file
     can never render as a broken image - an empty list simply hides the
     viewer and the card reads as text. */
  var PBI_SHOTS = window.PBI_SHOTS || [];

  /* ---------------------------------------------------------------- theme */
  $('#themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mr-theme', next); } catch (e) { /* storage blocked */ }
  });

  /* ----------------------------------------------------------------- menu */
  var menu = $('#menu'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('#menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      menu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  /* -------------------------------------- scroll: progress and live colour */
  /* Each section names a hue; the page interpolates between them by scroll
     position, so the accent drifts continuously rather than snapping. */
  var bar = $('.progress i');
  var stops = [{ el: $('.hero'), hue: 290 }].concat(
    $$('section[data-hue]').map(function (el) { return { el: el, hue: +el.dataset.hue }; }));

  function hueAt() {
    var mid = window.scrollY + window.innerHeight * 0.45;
    var pts = stops.map(function (s) {
      var r = s.el.getBoundingClientRect();
      return { y: r.top + window.scrollY + r.height / 2, hue: s.hue };
    });
    if (mid <= pts[0].y) return pts[0].hue;
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      if (mid <= b.y) {
        var t = (mid - a.y) / (b.y - a.y);
        t = t * t * (3 - 2 * t);                 // ease the transition between sections
        return a.hue + (b.hue - a.hue) * t;
      }
    }
    return pts[pts.length - 1].hue;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.width = (p * 100).toFixed(2) + '%';
      root.style.setProperty('--hue', hueAt().toFixed(1));
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ------------------------------------------------------------ active nav */
  var links = {};
  $$('.nav a.link').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var navObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || !links[e.target.id]) return;
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('on', k === e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach(function (s) { navObs.observe(s); });

  /* --------------------------------------------------------------- reveal */
  // The head script hides reveal targets from first paint. With no
  // IntersectionObserver nothing would ever show them again, so un-hide.
  if (!('IntersectionObserver' in window) || reduce) {
    root.classList.remove('js');
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { revObs.observe(el); });

    // arriving by a link (#career) should not show an empty section while the
    // observer catches up - reveal the target's contents straight away
    var showTarget = function () {
      var t = location.hash && document.getElementById(location.hash.slice(1));
      if (t) $$('.reveal', t).forEach(function (el) { el.classList.add('in'); });
    };
    window.addEventListener('hashchange', showTarget);
    showTarget();
  }

  /* ------------------------------------------------------------- counters */
  var cntObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      cntObs.unobserve(e.target);
      var el = e.target, end = +el.dataset.count;
      if (reduce) { el.textContent = end; return; }
      var t0 = null, dur = 1300;
      (function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) { el.textContent = '0'; cntObs.observe(el); });

  /* ------------------------------------------------------------ spotlight */
  document.addEventListener('pointermove', function (ev) {
    var card = ev.target.closest && ev.target.closest('.spot');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
    card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
  });

  /* ------------------------------------------------------ screenshot views */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lastFocus = null;

  function openLightbox(src, alt, cap) {
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = alt || ''; lbCap.textContent = cap || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lb.hidden) closeLightbox();
  });

  function wireViewer(viewer) {
    var tabs = $$('[role="tab"]', viewer);
    var img = $('.shot img', viewer), cap = $('.caption', viewer);
    function select(tab) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
      if (img.getAttribute('src') !== tab.dataset.src) {
        img.style.opacity = '0';
        var next = new Image();
        next.onload = function () { img.src = tab.dataset.src; img.style.opacity = '1'; };
        next.src = tab.dataset.src;
      }
      img.alt = tab.textContent.trim() + ' screen';
      cap.textContent = tab.dataset.cap || '';
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        var n = tabs[(i + d + tabs.length) % tabs.length];
        n.focus(); select(n);
      });
    });
    $('.shot', viewer).addEventListener('click', function () {
      openLightbox(img.src, img.alt, cap.textContent);
    });
    if (tabs[0]) select(tabs[0]);
  }

  /* the Power BI viewer is built from the manifest */
  (function () {
    var card = $('#powerbi');
    var viewer = $('.viewer', card);
    if (!PBI_SHOTS.length) {
      viewer.remove();
      card.style.gridTemplateColumns = '1fr';
      return;
    }
    var tabsEl = $('#pbiTabs');
    PBI_SHOTS.forEach(function (s, i) {
      var b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.dataset.src = s.src; b.dataset.cap = s.cap;
      b.textContent = s.name;
      tabsEl.appendChild(b);
    });
    var im = $('.shot img', viewer);
    im.src = PBI_SHOTS[0].src;
    if (PBI_SHOTS[0].w) { im.width = PBI_SHOTS[0].w; im.height = PBI_SHOTS[0].h; }
  })();

  $$('[data-viewer]').forEach(wireViewer);

  /* ================================================================ GANTT */
  var C = window.CAREER;
  if (!C) return;

  var T0 = 1993.5, T1 = 2027.5;
  var now = new Date();
  var NOW = now.getFullYear() + now.getMonth() / 12 + (now.getDate() - 1) / 365;

  function ym(s) { var p = s.split('-'); return +p[0] + (+p[1] - 1) / 12; }
  function pct(t) { return ((t - T0) / (T1 - T0)) * 100; }
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmt(s) { if (!s) return 'Present'; var p = s.split('-'); return MON[+p[1] - 1] + ' ' + p[0]; }
  function duration(a, b) {
    var m = Math.max(1, Math.round(((b == null ? NOW : ym(b)) - ym(a)) * 12));
    var y = Math.floor(m / 12), r = m % 12, out = [];
    if (y) out.push(y + (y === 1 ? ' yr' : ' yrs'));
    if (r) out.push(r + (r === 1 ? ' mo' : ' mos'));
    return out.join(' ');
  }
  function secName(id) { return C.sectors.filter(function (s) { return s.id === id; })[0].name; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Gantt convention: earliest at the top, so the career reads as a cascade
     down and to the right - the shape of a programme's critical path. */
  var roles = C.roles.slice().sort(function (a, b) { return ym(a.start) - ym(b.start); });
  var inner = $('#ganttInner');
  var html = [];

  // axis
  html.push('<div class="axis"><div></div><div class="ticks">');
  for (var y = 1995; y <= 2027; y += 2) {
    html.push('<span style="left:' + pct(y).toFixed(3) + '%">' + y + '</span>');
  }
  html.push('</div></div>');

  // gridlines behind every lane
  html.push('<div class="gridlines" aria-hidden="true">');
  for (var g = 1995; g <= 2027; g += 1) {
    html.push('<i style="left:' + pct(g).toFixed(3) + '%"></i>');
  }
  html.push('</div>');

  /* Qualifications a few months apart would draw as overlapping diamonds that
     cannot be hovered separately, so near neighbours share one diamond whose
     tooltip names them all. */
  var groups = { edu: [], cert: [] };
  function grouped(items) {
    var out = [];
    items.slice().sort(function (a, b) { return ym(a.when) - ym(b.when); }).forEach(function (m) {
      var last = out[out.length - 1];
      if (last && ym(m.when) - ym(last[last.length - 1].when) < 0.45) last.push(m);
      else out.push([m]);
    });
    return out;
  }

  function msRow(label, sub, items, kind) {
    var gs = groups[kind] = grouped(items);
    html.push('<div class="grow"><div class="who"><b>' + label + '</b><small>' + sub + '</small></div><div class="lane">');
    gs.forEach(function (g, i) {
      var at = g.reduce(function (s, m) { return s + ym(m.when); }, 0) / g.length;
      var aria = g.map(function (m) { return m.label + ', ' + m.org + ', ' + fmt(m.when); }).join('; ');
      html.push('<button class="ms ms-' + kind + (g.length > 1 ? ' multi' : '') + '" type="button"' +
        ' style="left:' + pct(at).toFixed(3) + '%" data-kind="' + kind + '" data-i="' + i + '"' +
        ' aria-label="' + esc(aria) + '"></button>');
    });
    html.push('</div></div>');
  }

  msRow('Education', 'degrees & diplomas', C.education, 'edu');

  roles.forEach(function (r, i) {
    var a = ym(r.start), b = r.end == null ? NOW : ym(r.end);
    var left = pct(a), width = Math.max(0.5, pct(b) - left);
    html.push(
      '<div class="grow" data-sector="' + r.sector + '">' +
        '<div class="who"><b>' + esc(r.title) + '</b><small>' + esc(r.org) + '</small></div>' +
        '<div class="lane">' +
          '<button class="bar' + (r.end == null ? ' live' : '') + '" type="button"' +
            ' data-i="' + i + '" aria-pressed="false"' +
            ' style="left:' + left.toFixed(3) + '%;width:' + width.toFixed(3) + '%;' +
            '--c:var(--sec-' + r.sector + ');--delay:' + (i * 0.09).toFixed(2) + 's"' +
            ' aria-label="' + esc(r.title + ' at ' + r.org + ', ' + fmt(r.start) + ' to ' + fmt(r.end)) + '">' +
            // the employer is already named in the left column - the bar
            // carries the span of years, which is what a Gantt bar is for
            '<span class="barlabel">' + r.start.slice(0, 4) + ' – ' +
              (r.end == null ? 'now' : r.end.slice(0, 4)) + '</span>' +
          '</button>' +
        '</div>' +
      '</div>');
  });

  msRow('Certifications', 'professional', C.certifications, 'cert');

  html.push('<div class="today" style="left:calc(220px + (100% - 220px) * ' + (pct(NOW) / 100).toFixed(5) + ')">' +
    '<span>Today · ' + MON[now.getMonth()] + ' ' + now.getFullYear() + '</span></div>');

  inner.innerHTML = html.join('');

  // Hide a bar's label when the bar is too narrow to hold it. offsetWidth, not
  // getBoundingClientRect: the bars draw in with a scaleX transform, and the
  // transformed width mid-animation made labels misjudge whether they fit.
  function fitLabels() {
    $$('.bar', inner).forEach(function (b) {
      var lab = $('.barlabel', b);
      lab.style.display = '';
      lab.style.display = b.offsetWidth >= lab.scrollWidth + 16 ? '' : 'none';
    });
  }

  /* ---------------------------------------------------------------- tooltip */
  var tip = $('#tip');
  function showTip(el, title, sub) {
    tip.innerHTML = '<b>' + esc(title) + '</b><span>' + esc(sub) + '</span>';
    var r = el.getBoundingClientRect();
    var x = Math.min(window.innerWidth - 300, Math.max(12, r.left + r.width / 2 - 140));
    var y = r.top - 12;
    tip.style.left = x + 'px';
    tip.style.top = (y - tip.offsetHeight) + 'px';
    if (y - tip.offsetHeight < 8) tip.style.top = (r.bottom + 10) + 'px';
    tip.classList.add('on');
  }
  function hideTip() { tip.classList.remove('on'); }

  function describeMs(el) {
    var g = groups[el.dataset.kind][+el.dataset.i];
    if (g.length === 1) return [g[0].label, g[0].org + ' · ' + fmt(g[0].when)];
    return [g.map(function (m) { return m.label; }).join(' + '),
            g.map(function (m) { return m.org + ' · ' + fmt(m.when); }).join('  |  ')];
  }

  $$('.bar', inner).forEach(function (b) {
    var r = roles[+b.dataset.i];
    var sub = fmt(r.start) + ' – ' + fmt(r.end) + ' · ' + duration(r.start, r.end);
    b.addEventListener('mouseenter', function () { showTip(b, r.title + ' · ' + r.org, sub); });
    b.addEventListener('focus', function () { showTip(b, r.title + ' · ' + r.org, sub); });
    b.addEventListener('mouseleave', hideTip);
    b.addEventListener('blur', hideTip);
    b.addEventListener('click', function () { select(+b.dataset.i, true); });
  });
  $$('.ms', inner).forEach(function (m) {
    var d = describeMs(m);
    m.addEventListener('mouseenter', function () { showTip(m, d[0], d[1]); });
    m.addEventListener('focus', function () { showTip(m, d[0], d[1]); });
    m.addEventListener('mouseleave', hideTip);
    m.addEventListener('blur', hideTip);
  });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* ----------------------------------------------------------- detail panel */
  var detail = $('#detail');
  function select(i, scroll) {
    var r = roles[i];
    $$('.bar', inner).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === i)); });
    detail.style.setProperty('--c', 'var(--sec-' + r.sector + ')');
    detail.innerHTML =
      '<div class="meta">' +
        '<span class="sector"><i></i>' + esc(secName(r.sector)) + '</span>' +
        '<h3>' + esc(r.title) + '</h3>' +
        '<p class="co">' + esc(r.org) + '</p>' +
        '<div class="when">' + fmt(r.start) + ' – ' + fmt(r.end) + '</div>' +
        '<div class="dur">' + duration(r.start, r.end) + (r.end == null ? ' · current' : '') + '</div>' +
      '</div>' +
      '<div>' +
        '<p class="proj"><b>' + esc(r.project) + '</b></p>' +
        '<ul>' + r.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      '</div>';
    if (scroll && window.innerWidth > 760) {
      var rect = detail.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.7) detail.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    }
  }
  // open on the current role - the one a visitor most wants to read
  select(roles.length - 1, false);

  /* ----------------------------------------------------------------- legend */
  var legend = $('#legend');
  var on = {};
  C.sectors.forEach(function (s) { on[s.id] = true; });
  legend.innerHTML = C.sectors.map(function (s) {
    return '<button type="button" aria-pressed="true" data-s="' + s.id + '" style="--c:var(--sec-' + s.id + ')"><i></i>' + esc(s.name) + '</button>';
  }).join('') + '<button type="button" class="reset" data-reset>Show all</button>';

  function applyFilter() {
    // dim, never recolour: a sector keeps its colour whatever else is hidden
    $$('.bar', inner).forEach(function (b) {
      b.classList.toggle('dim', !on[roles[+b.dataset.i].sector]);
    });
    $$('button[data-s]', legend).forEach(function (b) { b.setAttribute('aria-pressed', String(on[+b.dataset.s])); });
  }
  legend.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-reset')) {
      Object.keys(on).forEach(function (k) { on[k] = true; });
    } else {
      var id = +b.dataset.s;
      var allOn = Object.keys(on).every(function (k) { return on[k]; });
      // first click isolates a sector; later clicks add or remove it
      if (allOn) { Object.keys(on).forEach(function (k) { on[k] = (+k === id); }); }
      else { on[id] = !on[id]; }
      if (!Object.keys(on).some(function (k) { return on[k]; })) {
        Object.keys(on).forEach(function (k) { on[k] = true; });
      }
    }
    applyFilter();
  });

  /* ------------------------------------------------ draw the bars into view */
  var gantt = $('#gantt');
  if (reduce) { gantt.classList.add('drawn'); }
  else {
    var gObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { gantt.classList.add('drawn'); gObs.disconnect(); }
    }, { threshold: 0.25 });
    gObs.observe(gantt);
  }
  requestAnimationFrame(fitLabels);
  window.addEventListener('resize', fitLabels);

  /* ------------------------------------------------ phone-width list view */
  $('#vlist').innerHTML = C.roles.map(function (r) {
    return '<article class="card vitem" style="--c:var(--sec-' + r.sector + ')">' +
      '<div class="when">' + fmt(r.start) + ' – ' + fmt(r.end) + ' · ' + duration(r.start, r.end) + '</div>' +
      '<h3>' + esc(r.title) + '</h3>' +
      '<p class="co">' + esc(r.org) + ' · ' + esc(secName(r.sector)) + '</p>' +
      '<ul>' + r.points.slice(0, 3).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
    '</article>';
  }).join('');

  $('#yr').textContent = now.getFullYear();
})();
