/* Site admin: switch the design the website shows.

   The site is static (GitHub Pages), so there is no server here to hold a
   password - anything this page checked by itself, anyone could read in the
   source and skip. Instead GitHub does the checking. The published design
   lives in site-theme.js in the site's repository, and this page changes it
   by committing that file through the GitHub API with the owner's token. A
   token from any other account is turned away here, and GitHub would refuse
   its commit regardless: only accounts with write access to the repository
   can change the site. */
(function () {
  'use strict';

  // never run inside another site's frame
  if (window.top !== window.self) { document.body.textContent = ''; return; }

  var OWNER = 'rauf007-fusion';
  var REPO = 'rauf007-fusion.github.io';
  var FILE = 'site-theme.js';
  var API = 'https://api.github.com';
  var KEY = 'mr-admin-token';

  var THEMES = [
    { id: 'current', name: 'Current',
      desc: 'Dark ground and violet light, with colour that shifts as you scroll. Visitors can switch it to light.' },
    { id: 'blueprint', name: 'Blueprint',
      desc: 'An engineering drawing sheet — drafting paper, cobalt ink, a title block with the key facts.' },
    { id: 'control', name: 'Control room',
      desc: 'A programme-control display — graphite panels, amber readouts, the career critical path.' }
  ];
  function themeName(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i].name;
    return id;
  }

  var $ = function (s) { return document.querySelector(s); };
  var token = null, user = null, branch = 'main', fileSha = null, live = null, chosen = null, busy = false, changed = '';

  /* ------------------------------------------------------------ storage */
  function storedToken() {
    try { return sessionStorage.getItem(KEY) || localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function keepToken(t, remember) {
    try {
      sessionStorage.setItem(KEY, t);
      if (remember) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY);
    } catch (e) { /* storage blocked: signed in for this page view only */ }
  }
  function dropToken() {
    try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {}
  }

  /* ------------------------------------------------------------- GitHub */
  function gh(path, opts) {
    opts = opts || {};
    var headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch(API + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
      referrerPolicy: 'no-referrer'
    }).then(function (r) {
      return r.text().then(function (t) {
        var data = null;
        try { data = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) {
          var err = new Error((data && data.message) || ('HTTP ' + r.status));
          err.status = r.status;
          throw err;
        }
        return data;
      });
    }, function () {
      var err = new Error('network');
      err.status = 0;
      throw err;
    });
  }

  function fileText(id) {
    return '/* The site\'s published design: "current", "blueprint" or "control".\n' +
      '   Changed from admin.html, which commits this file through the GitHub API -\n' +
      '   so only an account with write access to this repository can change it. */\n' +
      'window.SITE_THEME = "' + id + '";\n';
  }
  function themeIn(text) {
    var m = /SITE_THEME\s*=\s*["']([a-z]+)["']/.exec(text || '');
    return m && THEMES.some(function (t) { return t.id === m[1]; }) ? m[1] : 'current';
  }

  function readLive() {
    return gh('/repos/' + OWNER + '/' + REPO + '/contents/' + FILE + '?ref=' + encodeURIComponent(branch))
      .then(function (f) {
        fileSha = f.sha;
        live = themeIn(atob(String(f.content).replace(/\s/g, '')));
      });
  }

  function lastChange() {
    return gh('/repos/' + OWNER + '/' + REPO + '/commits?path=' + FILE + '&per_page=1&sha=' + encodeURIComponent(branch))
      .then(function (list) { return list && list[0]; })
      .catch(function () { return null; });
  }

  /* ------------------------------------------------------------ sign in */
  function signInError(e) {
    if (e.owner) return 'That token belongs to @' + e.owner + '. This panel only opens for the site\'s owner.';
    if (e.status === 0) return 'Couldn\'t reach GitHub. Check the connection and try again.';
    if (e.status === 401) return 'GitHub didn\'t accept that token — it may be mistyped, expired or revoked.';
    if (e.status === 403 || e.status === 404) {
      return 'The token can\'t see the website\'s repository. Edit it on GitHub and give it access to ' + REPO + '.';
    }
    if (e.noWrite) return 'That account can read the website\'s repository but not change it.';
    return 'GitHub said: ' + e.message;
  }

  function signIn(t, remember) {
    token = t;
    $('#signinErr').hidden = true;
    $('#signinBtn').disabled = true;
    $('#signinBtn').textContent = 'Checking with GitHub…';

    return gh('/user')
      .then(function (me) {
        if (String(me.login).toLowerCase() !== OWNER.toLowerCase()) {
          var e = new Error('owner'); e.owner = me.login; throw e;
        }
        user = me;
        return gh('/repos/' + OWNER + '/' + REPO);
      })
      .then(function (repo) {
        if (repo.permissions && repo.permissions.push === false) {
          var e = new Error('read only'); e.noWrite = true; throw e;
        }
        branch = repo.default_branch || 'main';
        keepToken(t, remember);
        return readLive();
      })
      .then(showPanel)
      .catch(function (e) {
        token = null; user = null;
        dropToken();
        showSignIn(signInError(e));
      });
  }

  function signOut() {
    token = null; user = null; live = null; chosen = null; changed = '';
    dropToken();
    $('#token').value = '';
    showSignIn();
  }

  function showSignIn(msg) {
    $('#panel').hidden = true;
    $('#who').hidden = true;
    $('#signOut').hidden = true;
    $('#signin').hidden = false;
    $('#signinBtn').disabled = false;
    $('#signinBtn').textContent = 'Sign in';
    var err = $('#signinErr');
    err.textContent = msg || '';
    err.hidden = !msg;
    $('#opts').textContent = '';   // unload the previews
  }

  /* -------------------------------------------------------------- panel */
  function showPanel() {
    $('#signin').hidden = true;
    $('#panel').hidden = false;
    $('#who').textContent = '@' + user.login;
    $('#who').hidden = false;
    $('#signOut').hidden = false;
    chosen = live;
    buildCards();
    render();
    lastChange().then(function (c) {
      if (!c) return;
      changed = new Date(c.commit.committer.date)
        .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      render();
    });
  }

  function buildCards() {
    var box = $('#opts');
    box.querySelectorAll('.opt').forEach(function (n) { n.remove(); });
    THEMES.forEach(function (t) {
      var label = document.createElement('label');
      label.className = 'opt';
      label.dataset.id = t.id;

      var input = document.createElement('input');
      input.type = 'radio'; input.name = 'theme'; input.value = t.id;
      input.addEventListener('change', function () { chosen = t.id; render(); });

      var pv = document.createElement('div');
      pv.className = 'pv';
      var frame = document.createElement('iframe');
      frame.src = './?theme=' + t.id;
      frame.title = t.name + ' design preview';
      frame.loading = 'lazy';
      frame.tabIndex = -1;
      frame.setAttribute('aria-hidden', 'true');
      frame.setAttribute('sandbox', 'allow-scripts');
      pv.appendChild(frame);

      var meta = document.createElement('div');
      meta.className = 'meta';
      var row = document.createElement('div');
      row.className = 'row';
      var b = document.createElement('b');
      b.textContent = t.name;
      var badge = document.createElement('span');
      badge.className = 'badge';
      row.appendChild(b); row.appendChild(badge);
      var p = document.createElement('p');
      p.textContent = t.desc;
      var a = document.createElement('a');
      a.href = './?theme=' + t.id; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Preview full size ↗';
      meta.appendChild(row); meta.appendChild(p); meta.appendChild(a);

      label.appendChild(input); label.appendChild(pv); label.appendChild(meta);
      box.appendChild(label);
    });
    fitPreviews();
  }

  // scale each 1440-wide preview to its card
  function fitPreviews() {
    document.querySelectorAll('.pv').forEach(function (pv) {
      pv.style.setProperty('--s', (pv.clientWidth / 1440).toFixed(4));
    });
  }
  window.addEventListener('resize', fitPreviews);

  function render() {
    $('#liveLine').textContent = 'Live now: ' + themeName(live) +
      (changed ? ' · last changed ' + changed : '') + '.';
    document.querySelectorAll('.opt').forEach(function (o) {
      var id = o.dataset.id;
      o.querySelector('input').checked = id === chosen;
      o.classList.toggle('chosen', id === chosen);
      var badge = o.querySelector('.badge');
      badge.hidden = !(id === live || id === chosen);
      badge.className = 'badge' + (id === live ? '' : ' pick');
      badge.textContent = id === live ? 'Live' : 'Selected';
    });
    var pub = $('#publish');
    pub.disabled = busy || chosen === live;
    pub.textContent = chosen === live ? 'This design is live' : 'Publish ' + themeName(chosen);
  }

  function setStatus(msg, kind) {
    var s = $('#status');
    s.textContent = msg;
    s.className = 'status' + (kind ? ' ' + kind : '');
  }

  /* ------------------------------------------------------------ publish */
  function publish() {
    var id = chosen;
    if (busy || !id || id === live) return;
    busy = true; render();
    setStatus('Publishing ' + themeName(id) + '…');

    // commit under the account's private no-reply address, never a real email
    var who = { name: user.name || user.login, email: user.id + '+' + user.login + '@users.noreply.github.com' };
    function put() {
      return gh('/repos/' + OWNER + '/' + REPO + '/contents/' + FILE, {
        method: 'PUT',
        body: {
          message: 'Site theme: ' + themeName(id),
          content: btoa(fileText(id)),
          sha: fileSha,
          branch: branch,
          committer: who,
          author: who
        }
      });
    }

    put()
      .catch(function (e) {
        // the file changed since this page read it - read it again and retry once
        if (e.status === 409 || (e.status === 422 && /sha/i.test(e.message))) return readLive().then(put);
        throw e;
      })
      .then(function (res) {
        fileSha = res.content.sha;
        live = id;
        busy = false; render();
        var short = res.commit.sha.slice(0, 7);
        if (/\.github\.io$/.test(location.hostname)) {
          setStatus('Saved (commit ' + short + '). GitHub Pages is rebuilding the site…');
          waitForLive(id);
        } else {
          setStatus('Saved (commit ' + short + '). This copy of the page isn\'t the live site, so it won\'t wait for the rebuild.', 'ok');
        }
      })
      .catch(function (e) {
        busy = false; render();
        if (e.status === 401) { signOut(); showSignIn('The token has expired or been revoked. Sign in again.'); return; }
        if (e.status === 403 || e.status === 404) {
          setStatus('The token can read the site but not change it. On GitHub, set its Contents permission to "Read and write".', 'bad');
          return;
        }
        setStatus(e.status === 0 ? 'Couldn\'t reach GitHub — nothing was changed. Try again.' : 'Not published. GitHub said: ' + e.message, 'bad');
      });
  }

  // watch the public copy of site-theme.js until GitHub Pages serves the new design
  function waitForLive(id) {
    var tries = 0;
    (function check() {
      tries++;
      fetch('site-theme.js?check=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (t) {
          if (live !== id) return;                       // superseded by a newer publish
          if (themeIn(t) === id) {
            setStatus(themeName(id) + ' is live on the site now.', 'ok');
          } else if (tries < 40) {
            setTimeout(check, 6000);
          } else {
            setStatus('Saved, but GitHub Pages hasn\'t finished rebuilding yet. It usually catches up within a few minutes — check the repository\'s Actions tab if it doesn\'t.');
          }
        })
        .catch(function () { if (tries < 40) setTimeout(check, 6000); });
    })();
  }

  /* --------------------------------------------------------------- wire */
  $('#signinForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = $('#token').value.trim();
    if (!t) { showSignIn('Paste your GitHub token first.'); return; }
    signIn(t, $('#remember').checked);
  });
  $('#signOut').addEventListener('click', signOut);
  $('#publish').addEventListener('click', publish);

  var saved = storedToken();
  if (saved) signIn(saved, (function () { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } })());
})();
