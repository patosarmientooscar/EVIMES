/* EVIMES — banner de cookies (RGPD / LSSI)
   Google Tag Manager solo se carga si el visitante pulsa "Aceptar".
   La función window.evimesLoadGTM se define en el <head> de cada página. */
(function () {
  var KEY = 'evimes-cookies';
  var MAX_AGE = 1000 * 60 * 60 * 24 * 365; // volver a preguntar tras 12 meses

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && (c.v === 'accepted' || c.v === 'rejected') && Date.now() - c.t < MAX_AGE) return c.v;
    } catch (e) {}
    return null;
  }
  function save(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {}
  }
  function clearGaCookies() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ga|^_gid|^_gat/.test(name)) {
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  var css =
    '#ck-banner{position:fixed;left:24px;bottom:24px;z-index:99999;width:min(400px,calc(100vw - 32px));' +
    'background:rgba(28,33,67,.96);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);' +
    'border:1px solid rgba(74,173,170,.28);border-radius:18px;padding:24px 24px 22px;color:#fff;' +
    'box-shadow:0 2px 6px rgba(28,33,67,.25),0 18px 48px rgba(4,4,20,.55);' +
    'opacity:0;transform:translateY(16px);transition:opacity .45s ease,transform .45s cubic-bezier(.2,.8,.2,1)}' +
    '#ck-banner.ck-in{opacity:1;transform:none}' +
    '#ck-banner[hidden]{display:none}' +
    '#ck-title{margin:0 0 8px;font-family:"Libre Baskerville",Georgia,serif;font-weight:400;font-size:1.12rem;line-height:1.35;letter-spacing:-.03em;color:#fff}' +
    '#ck-text{margin:0 0 18px;font-family:"Inter",system-ui,sans-serif;font-size:.875rem;line-height:1.7;color:rgba(255,255,255,.82)}' +
    '#ck-text a{color:#4aadaa;text-decoration:underline;text-underline-offset:3px}' +
    '#ck-text a:hover{color:#7fd4d1}' +
    '.ck-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.ck-btn{font-family:"Inter",system-ui,sans-serif;font-size:.9rem;font-weight:500;min-height:46px;border-radius:50px;cursor:pointer;' +
    'transition:background-color .2s ease,color .2s ease,border-color .2s ease,transform .1s ease}' +
    '.ck-btn:active{transform:scale(.97)}' +
    '.ck-btn:focus-visible{outline:2px solid #4aadaa;outline-offset:3px}' +
    '.ck-accept{background:#4aadaa;color:#1c2143;border:1px solid #4aadaa}' +
    '.ck-accept:hover{background:#5fc2bf;border-color:#5fc2bf}' +
    '.ck-reject{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.55)}' +
    '.ck-reject:hover{background:rgba(255,255,255,.08);border-color:#fff}' +
    '@media(max-width:560px){#ck-banner{left:16px;right:16px;bottom:16px;width:auto;padding:20px 20px 18px}}' +
    '@media(prefers-reduced-motion:reduce){#ck-banner{transition:none;transform:none}}';

  var banner;
  function build() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    banner = document.createElement('section');
    banner.id = 'ck-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'ck-title');
    banner.setAttribute('aria-describedby', 'ck-text');
    banner.hidden = true;
    banner.innerHTML =
      '<h2 id="ck-title">¿Nos dejas contar las visitas?</h2>' +
      '<p id="ck-text">Usamos Google Analytics para saber cuántas personas visitan la web y qué páginas leen. ' +
      'Solo se activa si aceptas, y puedes cambiar de opinión cuando quieras. ' +
      '<a href="cookies.html">Política de cookies</a></p>' +
      '<div class="ck-actions">' +
      '<button type="button" class="ck-btn ck-reject">Rechazar</button>' +
      '<button type="button" class="ck-btn ck-accept">Aceptar</button>' +
      '</div>';
    document.body.appendChild(banner);

    banner.querySelector('.ck-accept').addEventListener('click', function () {
      save('accepted');
      if (window.evimesLoadGTM) window.evimesLoadGTM();
      hide();
    });
    banner.querySelector('.ck-reject').addEventListener('click', function () {
      var wasAccepted = read() === 'accepted';
      save('rejected');
      if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
      clearGaCookies();
      hide();
      // Si Analytics ya estaba cargado, recargar para que deje de funcionar
      if (wasAccepted && window.__evimesGTM) location.reload();
    });
  }

  function show() {
    if (!banner) build();
    banner.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { banner.classList.add('ck-in'); }); });
  }
  function hide() {
    banner.classList.remove('ck-in');
    setTimeout(function () { banner.hidden = true; }, 450);
  }

  window.evimesCookieSettings = show;
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); show(); }
  });

  var choice = read();
  if (choice === 'rejected') clearGaCookies(); // por si quedaron de una visita anterior
  if (!choice) show();
})();
