/* ═══════════════════════════════════════════════════════════
   EVIMES — main.js
   • Nav scroll behaviour
   • Mobile hamburger
   • Smooth scroll
   • Hero logo parallax (rAF)
   • Intersection Observer reveal (.reveal, .reveal-left, .reveal-right)
   • Stagger delays for sibling groups
   • Contact form — floating labels + validation
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── 1. Nav: add .scrolled class on scroll (CAMBIO 5) ────── */
const nav = document.querySelector('.nav');

function updateNav() {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ── 2. Mobile hamburger ──────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', open);
});

document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── 3. Smooth scroll for anchor links ───────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── 4. Hero logo — scroll parallax + fade ───────────────── */
const heroLogo = document.querySelector('.hero-bg-logo');

window.addEventListener('scroll', () => {
  if (!heroLogo) return;
  const y = window.scrollY;
  const currentOpacity = Math.max(0, 0.22 - y * 0.0004);
  heroLogo.style.opacity = currentOpacity;
  heroLogo.style.transform =
    `translate(-50%, calc(-50% + ${y * 0.12}px)) scale(1)`;
}, { passive: true });

/* ── 5. Cinematic Scroll Observer — bidirectional, replays on scroll up ── */
(function initCinematicObserver() {

  const SELECTORS = [
    '.anim-up', '.anim-scale', '.anim-left', '.anim-right',
    '.anim-title', '.anim-stat', '.anim-btn', '.anim-divider', '.anim-tag'
  ].join(', ');

  // Element-level observer — adds/removes .in-view for replay
  const elemObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll(SELECTORS).forEach(el => {
    // Skip hero children — they use keyframe animations
    if (!el.closest('.hero')) elemObserver.observe(el);
  });

  // Gallery items — staggered scroll-in, replay on scroll up
  document.querySelectorAll('.gallery-item').forEach(el => elemObserver.observe(el));

  // Section-level observer — recalculates cinematic stagger on each entry
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const children = entry.target.querySelectorAll(SELECTORS);
      if (entry.isIntersecting) {
        children.forEach((child, i) => {
          child.style.transitionDelay = (i * 0.06) + 's';
        });
      } else {
        // Clear inline delays so anim-delay-* classes take over on next entry
        children.forEach(child => {
          child.style.transitionDelay = '';
        });
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('section, footer').forEach(s => sectionObserver.observe(s));

})();

/* ── 6. Stat numbers — animate counter on reveal ─────────── */
function animateCounter(el) {
  const raw    = el.dataset.target || el.textContent;
  const suffix = raw.replace(/[0-9]/g, '');       // e.g. "+" or "%"
  const target = parseInt(raw.replace(/\D/g, '')); // numeric part
  if (isNaN(target) || target === 0) return;

  const duration = 1200;
  const step     = 16;
  const increment = target / (duration / step);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
  }, step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ── 7. Contact form — validation + floating labels ─────── */
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      const group = field.closest('.fl-group');
      const errorEl = group?.querySelector('.fl-error');

      if (!field.value.trim()) {
        group?.classList.add('has-error');
        if (errorEl) errorEl.textContent = 'Este campo es obligatorio.';
        valid = false;
      } else {
        group?.classList.remove('has-error');
      }
    });

    // Email format
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value.trim()) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim());
      const group = emailField.closest('.fl-group');
      const errorEl = group?.querySelector('.fl-error');
      if (!ok) {
        group?.classList.add('has-error');
        if (errorEl) errorEl.textContent = 'Introduce un email válido.';
        valid = false;
      }
    }

    if (!valid) return;

    const btn = form.querySelector('.btn-submit');
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    setTimeout(() => {
      form.style.opacity = '0';
      form.style.transition = 'opacity .4s ease';
      setTimeout(() => {
        form.style.display = 'none';
        formSuccess.classList.add('is-visible');
      }, 400);
    }, 1000);
  });

  // Clear error on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.closest('.fl-group')?.classList.remove('has-error');
    });
  });
}

/* ── 8. CelestialSphere v2 — WebGL nebula + stars (Three.js r128) ── */
(function initCelestialSphere() {
  const canvas = document.getElementById('celestial-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* Mouse: raw pixel position + smoothed lerp position */
  const mouse     = new THREE.Vector2(0, 0);
  const mouseLerp = new THREE.Vector2(0, 0);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = window.innerHeight - e.clientY; // invert Y for WebGL
  }, { passive: true });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    varying vec2 vUv;

    uniform vec2  u_resolution;
    uniform float u_time;
    uniform vec2  u_mouse;
    uniform float u_zoom;
    uniform float u_hue;
    uniform float u_particle_size;

    float random(vec2 st) {
      return fract(sin(dot(st, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      /* Quintic interpolation — smoother than cubic */
      vec2 u = f*f*f*(f*(f*6.0 - 15.0) + 10.0);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float value     = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      mat2  rotation  = mat2(
         cos(0.5),  sin(0.5),
        -sin(0.5),  cos(0.5)
      );

      for (int i = 0; i < 6; i++) {
        value     += amplitude * noise(p * frequency);
        p          = rotation * p;
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    vec3 hsl2rgb(vec3 hsl) {
      float h = hsl.x, s = hsl.y, l = hsl.z;
      float c = (1.0 - abs(2.0*l - 1.0)) * s;
      float x = c * (1.0 - abs(mod(h*6.0, 2.0) - 1.0));
      float m = l - c*0.5;
      vec3 rgb;
      if      (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
      else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
      else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
      else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
      else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
      else                   rgb = vec3(c, 0.0, x);
      return rgb + m;
    }

    void main() {
      /* Center UV at origin, normalize by height */
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

      /* Mouse warp — gravitational falloff */
      vec2 mouse_norm  = (u_mouse / u_resolution) - 0.5;
      float mouse_dist = length(uv - mouse_norm * u_zoom);
      float warp_falloff  = smoothstep(0.8, 0.0, mouse_dist);
      vec2  warp_offset   = mouse_norm * 0.35 * warp_falloff;
      uv += warp_offset;

      /* FBM nebula centered at origin with radial symmetry */
      float radial = length(uv) * 0.4;
      float f = fbm(uv + vec2(u_time * 0.08, u_time * 0.04) - radial);
      float t = fbm(uv + f * 1.2 + vec2(u_time * 0.04, u_time * 0.02));

      /* Soft vignette */
      float vignette = 1.0 - smoothstep(0.4, 1.2, length(uv * 0.8));
      float nebula   = pow(t, 1.8) * vignette;

      /* Navy base HUE=210, Cyan accent HUE=240 */
      vec3 color_deep = hsl2rgb(vec3(u_hue / 360.0,          0.75, 0.35 * nebula));
      vec3 color_glow = hsl2rgb(vec3((u_hue + 30.0) / 360.0, 0.85, 0.6  * nebula));
      vec3 color = mix(color_deep, color_glow, nebula * 0.6);
      color *= 2.2;

      /* Stars — fine and bright */
      float star_val = random(vUv * 800.0);
      if (star_val > 0.9985) {
        float b = pow((star_val - 0.9985) / 0.0015, 2.0);
        color += vec3(b * u_particle_size * 0.8);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const geometry = new THREE.PlaneBufferGeometry(2, 2);
  const uniforms = {
    u_resolution:    { value: new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight) },
    u_time:          { value: 0.0 },
    u_mouse:         { value: new THREE.Vector2(0.0, 0.0) },
    u_zoom:          { value: 1.0 },
    u_hue:           { value: 210.0 },
    u_particle_size: { value: 1.5 }
  };

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  scene.add(new THREE.Mesh(geometry, material));

  function onResize() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    renderer.setSize(w, h);
    uniforms.u_resolution.value.set(w, h);
  }
  window.addEventListener('resize', onResize, { passive: true });

  function tick(t) {
    uniforms.u_time.value = t * 0.001;
    mouseLerp.x += (mouse.x - mouseLerp.x) * 0.05;
    mouseLerp.y += (mouse.y - mouseLerp.y) * 0.05;
    uniforms.u_mouse.value.set(mouseLerp.x, mouseLerp.y);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ── 9. Particles — canvas system for section backgrounds ── */
function createParticles(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const config = {
    quantity  : options.quantity  || 80,
    color     : options.color     || '#1c2143',
    size      : options.size      || 1.2,
    speed     : options.speed     || 0.3,
    staticity : options.staticity || 50,
    ease      : options.ease      || 60,
  };

  let W = 0, H = 0;
  let mouse = { x: -9999, y: -9999 };
  let particles = [];

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
    particles = [];
    for (let i = 0; i < config.quantity; i++) particles.push(makeParticle());
  }

  function makeParticle() {
    return {
      x        : Math.random() * W,
      y        : Math.random() * H,
      tx       : 0,
      ty       : 0,
      size     : Math.random() * 1.5 + config.size,
      alpha    : 0,
      targetA  : Math.random() * 0.35 + 0.05,
      dx       : (Math.random() - 0.5) * config.speed,
      dy       : (Math.random() - 0.5) * config.speed,
      magnetism: 0.1 + Math.random() * 3,
    };
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r},${g},${b}`;
  }
  const rgb = hexToRgb(config.color);

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      if (p.alpha < p.targetA) p.alpha += 0.008;
      p.x += p.dx;
      p.y += p.dy;

      const forceX = (mouse.x - W / 2) / (config.staticity / p.magnetism);
      const forceY = (mouse.y - H / 2) / (config.staticity / p.magnetism);
      p.tx += (forceX - p.tx) / config.ease;
      p.ty += (forceY - p.ty) / config.ease;

      if (p.x < -p.size) p.x = W + p.size;
      if (p.x > W + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = H + p.size;
      if (p.y > H + p.size) p.y = -p.size;

      const edge       = Math.min(p.x, W - p.x, p.y, H - p.y);
      const edgeAlpha  = Math.min(1, edge / 20);
      const finalAlpha = p.alpha * edgeAlpha;

      ctx.save();
      ctx.translate(p.tx, p.ty);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${finalAlpha})`;
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  animate();
}

/* ── 10. Beams with collision — vanilla Canvas port of the React component ── */
function createBeams(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* 28 beams spread across the full width */
  const DEFS = [
    { xR: 0.007, dur: 7000,  rep: 2000,  del: 0,    h: 56 },
    { xR: 0.045, dur: 4500,  rep: 1500,  del: 800,  h: 32 },
    { xR: 0.069, dur: 7000,  rep: 3000,  del: 0,    h: 24 },
    { xR: 0.12,  dur: 5000,  rep: 2500,  del: 1500, h: 48 },
    { xR: 0.16,  dur: 3500,  rep: 4000,  del: 600,  h: 64 },
    { xR: 0.21,  dur: 9000,  rep: 1000,  del: 3000, h: 40 },
    { xR: 0.26,  dur: 4000,  rep: 3500,  del: 200,  h: 80 },
    { xR: 0.278, dur: 5000,  rep: 5000,  del: 4000, h: 56 },
    { xR: 0.32,  dur: 6500,  rep: 2000,  del: 1000, h: 32 },
    { xR: 0.36,  dur: 3000,  rep: 1500,  del: 2500, h: 48 },
    { xR: 0.40,  dur: 8000,  rep: 3000,  del: 500,  h: 24 },
    { xR: 0.417, dur: 3000,  rep: 2000,  del: 4000, h: 56 },
    { xR: 0.46,  dur: 5500,  rep: 2500,  del: 1200, h: 72 },
    { xR: 0.50,  dur: 4000,  rep: 1000,  del: 3500, h: 40 },
    { xR: 0.54,  dur: 7500,  rep: 2000,  del: 700,  h: 56 },
    { xR: 0.556, dur: 11000, rep: 1500,  del: 0,    h: 80 },
    { xR: 0.59,  dur: 3500,  rep: 3000,  del: 2200, h: 32 },
    { xR: 0.63,  dur: 6000,  rep: 2000,  del: 400,  h: 48 },
    { xR: 0.67,  dur: 4500,  rep: 1500,  del: 1800, h: 64 },
    { xR: 0.694, dur: 4000,  rep: 1000,  del: 0,    h: 48 },
    { xR: 0.73,  dur: 5000,  rep: 2500,  del: 3000, h: 24 },
    { xR: 0.77,  dur: 8000,  rep: 2000,  del: 600,  h: 56 },
    { xR: 0.80,  dur: 3500,  rep: 3500,  del: 1400, h: 40 },
    { xR: 0.833, dur: 6000,  rep: 1500,  del: 2000, h: 24 },
    { xR: 0.86,  dur: 4000,  rep: 2000,  del: 900,  h: 72 },
    { xR: 0.90,  dur: 7000,  rep: 1000,  del: 3200, h: 48 },
    { xR: 0.94,  dur: 3000,  rep: 4000,  del: 100,  h: 32 },
    { xR: 0.97,  dur: 5500,  rep: 2500,  del: 2800, h: 56 },
  ];

  let W = 1, H = 1;

  function resize() {
    W = canvas.offsetWidth  || 1;
    H = canvas.offsetHeight || 1;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* Beam runtime state */
  const beams = DEFS.map(d => ({
    d,
    phase    : 'waiting',
    startT   : 0,
    waitUntil: performance.now() + d.del,
    hit      : false,
  }));

  /* Active explosions */
  const exps = [];

  function boom(x, y) {
    exps.push({
      x, y,
      t0 : performance.now(),
      pts: Array.from({ length: 20 }, () => ({
        vx: Math.random() * 80 - 40,
        vy: -(Math.random() * 50 + 10),
        r : Math.random() * 1.5 + 0.5,
      })),
    });
  }

  function frame(now) {
    ctx.clearRect(0, 0, W, H);

    /* ── Draw beams ── */
    beams.forEach(b => {
      if (b.phase === 'waiting') {
        if (now >= b.waitUntil) { b.phase = 'falling'; b.startT = now; b.hit = false; }
        return;
      }

      const p  = Math.min((now - b.startT) / b.d.dur, 1);
      const bx = b.d.xR * W;
      const y  = -b.d.h + p * (H + b.d.h);

      /* Beam gradient: transparent top → cyan mid → navy bottom */
      const gr = ctx.createLinearGradient(0, y, 0, y + b.d.h);
      gr.addColorStop(0,    'rgba(74,173,170,0)');
      gr.addColorStop(0.45, 'rgba(74,173,170,0.9)');
      gr.addColorStop(1,    'rgba(28,33,67,0.9)');
      ctx.fillStyle = gr;
      ctx.fillRect(bx - 1.5, y, 3, b.d.h);

      /* Collision with floor */
      if (!b.hit && y + b.d.h >= H - 4) {
        b.hit = true;
        boom(bx, H - 4);
      }

      if (p >= 1) { b.phase = 'waiting'; b.waitUntil = now + b.d.rep; }
    });

    /* ── Draw explosions ── */
    const EXP_DUR = 1500;
    for (let i = exps.length - 1; i >= 0; i--) {
      const e   = exps[i];
      const age = now - e.t0;
      if (age > EXP_DUR) { exps.splice(i, 1); continue; }

      const t = age / EXP_DUR;
      const a = 1 - t;

      /* Horizontal flash line at collision point */
      if (t < 0.25) {
        const fa = ((0.25 - t) / 0.25) * 0.65;
        const fw = 48 * (1 - t * 3);
        const fg = ctx.createLinearGradient(e.x - fw, 0, e.x + fw, 0);
        fg.addColorStop(0,   'rgba(74,173,170,0)');
        fg.addColorStop(0.5, `rgba(74,173,170,${fa})`);
        fg.addColorStop(1,   'rgba(74,173,170,0)');
        ctx.fillStyle = fg;
        ctx.fillRect(e.x - fw, e.y - 1, fw * 2, 2);
      }

      /* Explosion particles */
      ctx.save();
      e.pts.forEach(p => {
        const g  = 60 * t * t;           // gravity
        const px = e.x + p.vx * t;
        const py = e.y + p.vy * t + g;
        ctx.globalAlpha = Math.max(0, a * 0.8);
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = t < 0.5 ? '#4aadaa' : '#1c2143';
        ctx.fill();
      });
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(frame);
}

// createBeams('particles-problema'); // removed — El Problema now uses carousel

/* ── 11. Problema cards — dock magnification (spring physics) ── */
(function initProblemaDock() {
  const cards = Array.from(document.querySelectorAll('#el-problema .problema-card'));
  if (!cards.length) return;

  /* Spring constants — matches AnimatedDock: stiffness 150, damping 12 */
  const STIFFNESS = 200;
  const DAMPING   = 18;
  const MAX_SCALE = 1.13;
  const THRESHOLD = 300; // px from card centre — effect radius

  /* Per-card spring state */
  const springs = cards.map(() => ({ scale: 1, vel: 0 }));

  let mouseX = -9999, mouseY = -9999, lastT = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  /* Reset all cards when mouse leaves the window */
  document.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  function tick(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    cards.forEach((card, i) => {
      const r    = card.getBoundingClientRect();
      const cx   = r.left + r.width  / 2;
      const cy   = r.top  + r.height / 2;
      const dist = Math.hypot(mouseX - cx, mouseY - cy);

      /* Proximity → target scale (same transform as AnimatedDock widthSync) */
      const proximity = Math.max(0, 1 - dist / THRESHOLD);
      const target    = 1 + (MAX_SCALE - 1) * proximity;

      /* Spring: F = -k·x - b·v */
      const force          = -(STIFFNESS * (springs[i].scale - target)) - (DAMPING * springs[i].vel);
      springs[i].vel      += force * dt;
      springs[i].scale    += springs[i].vel * dt;

      const s = springs[i].scale;
      card.style.transform = `scale(${s.toFixed(4)})`;
      card.style.zIndex    = s > 1.02 ? '4' : '1';

      /* Shadow grows with scale — feels heavy when large */
      const ex = s - 1;
      card.style.boxShadow =
        `0 ${(2  + ex * 80).toFixed(1)}px ${(8  + ex * 60).toFixed(1)}px rgba(28,33,67,${(0.04 + ex * 0.4).toFixed(3)}),` +
        `0 ${(8  + ex * 160).toFixed(1)}px ${(32 + ex * 120).toFixed(1)}px rgba(28,33,67,${(0.07 + ex * 0.8).toFixed(3)})`;
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(t => { lastT = t; requestAnimationFrame(tick); });
})();

/* ── 12. Gallery Carousel — El Problema (infinite rAF) ─────── */
(function initGalleryCarousel() {
  const track = document.getElementById('galleryTrack');
  if (!track) return;

  const GAP   = 20;   // matches CSS gap
  const SPEED = 0.45; // px per frame (~27px/s at 60fps — readable)

  // Clone items twice so the loop never shows empty space
  // Clones get .in-view immediately — they're not observed by IntersectionObserver
  const origItems = Array.from(track.querySelectorAll('.gallery-item'));
  [1, 2].forEach(() => {
    origItems.forEach(item => {
      const clone = item.cloneNode(true);
      clone.classList.add('in-view');
      track.appendChild(clone);
    });
  });

  let pos         = 0;
  let isDragging  = false;
  let dragStartX  = 0;
  let dragStartPos = 0;

  function loopWidth() {
    const all = track.querySelectorAll('.gallery-item');
    if (!all.length) return 1;
    return (all[0].offsetWidth + GAP) * origItems.length;
  }

  function wrap(p) {
    const lw = loopWidth();
    return ((p % lw) + lw) % lw;
  }

  function tick() {
    if (!isDragging) pos = wrap(pos + SPEED);
    track.style.transform = 'translateX(-' + pos + 'px)';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Mouse drag
  track.addEventListener('mousedown', e => {
    isDragging   = true;
    dragStartX   = e.clientX;
    dragStartPos = pos;
    track.style.cursor = 'grabbing';
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    pos = wrap(dragStartPos + (dragStartX - e.clientX));
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = '';
  });

  // Touch drag
  track.addEventListener('touchstart', e => {
    isDragging   = true;
    dragStartX   = e.touches[0].clientX;
    dragStartPos = pos;
  }, { passive: true });
  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    pos = wrap(dragStartPos + (dragStartX - e.touches[0].clientX));
  }, { passive: true });
  track.addEventListener('touchend', () => { isDragging = false; });
})();

/* ── 13. El Problema — Rotating Wireframe Globe ────────────── */
(function() {
  const canvas = document.getElementById('evimes-globe');
  if (!canvas || typeof d3 === 'undefined') return;

  const context = canvas.getContext('2d');

  function getSize() {
    const parent = canvas.parentElement;
    const size = Math.min(parent.offsetWidth, 420);
    return size;
  }

  let size = getSize();
  const dpr = window.devicePixelRatio || 1;

  function setSize() {
    size = getSize();
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);
  }
  setSize();

  const radius = () => size * 0.42;

  const projection = d3.geoOrthographic()
    .scale(radius())
    .translate([size / 2, size / 2])
    .clipAngle(90);

  const path = d3.geoPath()
    .projection(projection)
    .context(context);

  const rotation = [0, -20];
  let landFeatures = null;
  let allDots = [];

  function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if (yi > y !== yj > y &&
          x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  function pointInFeature(point, feature) {
    const geo = feature.geometry;
    if (geo.type === 'Polygon') {
      if (!pointInPolygon(point, geo.coordinates[0])) return false;
      for (let i = 1; i < geo.coordinates.length; i++) {
        if (pointInPolygon(point, geo.coordinates[i])) return false;
      }
      return true;
    } else if (geo.type === 'MultiPolygon') {
      for (const poly of geo.coordinates) {
        if (pointInPolygon(point, poly[0])) {
          let inHole = false;
          for (let i = 1; i < poly.length; i++) {
            if (pointInPolygon(point, poly[i])) { inHole = true; break; }
          }
          if (!inHole) return true;
        }
      }
      return false;
    }
    return false;
  }

  function generateDots(feature, spacing) {
    const dots = [];
    const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature);
    const step = spacing * 0.08;
    for (let lng = minLng; lng <= maxLng; lng += step) {
      for (let lat = minLat; lat <= maxLat; lat += step) {
        if (pointInFeature([lng, lat], feature)) {
          dots.push([lng, lat]);
        }
      }
    }
    return dots;
  }

  function render() {
    context.clearRect(0, 0, size, size);

    const r = projection.scale();

    // Subtle globe outline
    context.beginPath();
    context.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
    context.strokeStyle = 'rgba(28, 33, 67, 0.08)';
    context.lineWidth = 1;
    context.stroke();

    if (!landFeatures) return;

    // Graticule lines
    const graticule = d3.geoGraticule()();
    context.beginPath();
    path(graticule);
    context.strokeStyle = 'rgba(28, 33, 67, 0.08)';
    context.lineWidth = 0.5;
    context.stroke();

    // Land outlines
    context.beginPath();
    landFeatures.features.forEach(f => path(f));
    context.strokeStyle = 'rgba(28, 33, 67, 0.25)';
    context.lineWidth = 0.8;
    context.stroke();

    // Cyan dots on land
    allDots.forEach(([lng, lat]) => {
      const proj = projection([lng, lat]);
      if (!proj) return;
      const [px, py] = proj;
      if (px < 0 || px > size || py < 0 || py > size) return;
      context.beginPath();
      context.arc(px, py, 1.0, 0, 2 * Math.PI);
      context.fillStyle = '#4aadaa';
      context.fill();
    });
  }

  let animId;
  function animate() {
    rotation[0] += 0.3;
    projection
      .rotate(rotation)
      .scale(radius())
      .translate([size / 2, size / 2]);
    render();
    animId = requestAnimationFrame(animate);
  }

  // Drag interaction
  let isDragging = false;
  let lastX, lastY;

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    cancelAnimationFrame(animId);
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotation[0] += dx * 0.4;
    rotation[1] -= dy * 0.4;
    rotation[1] = Math.max(-90, Math.min(90, rotation[1]));
    lastX = e.clientX;
    lastY = e.clientY;
    projection.rotate(rotation);
    render();
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    setTimeout(() => animate(), 800);
  });

  // Touch support
  canvas.addEventListener('touchstart', e => {
    cancelAnimationFrame(animId);
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    rotation[0] += dx * 0.4;
    rotation[1] -= dy * 0.4;
    rotation[1] = Math.max(-90, Math.min(90, rotation[1]));
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    projection.rotate(rotation);
    render();
  }, { passive: false });
  canvas.addEventListener('touchend', () => {
    setTimeout(() => animate(), 800);
  });

  // Resize
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    setSize();
    animate();
  }, { passive: true });

  // Load GeoJSON world data
  fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json')
    .then(r => r.json())
    .then(data => {
      landFeatures = data;
      data.features.forEach(feature => {
        generateDots(feature, 16).forEach(dot => allDots.push(dot));
      });
      animate();
    })
    .catch(() => {
      animate(); // fallback — shows globe outline only
    });
})();

/* ── 14. Servicios — Accordion + Score bars ─────────────── */
(function() {

  // Scroll reveal for #servicios .srv-reveal elements
  const revealObs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 }
  );
  document.querySelectorAll('#servicios .srv-reveal')
    .forEach(el => revealObs.observe(el));

  // Accordion rows — one open at a time
  let openPanel = null;
  document.querySelectorAll('.s-row-top').forEach(top => {
    top.addEventListener('click', () => {
      const row   = top.closest('.s-row');
      const panel = row.querySelector('.s-row-panel');
      const isOpen = panel.classList.contains('open');

      if (openPanel && openPanel !== panel) {
        openPanel.classList.remove('open');
      }
      panel.classList.toggle('open', !isOpen);
      openPanel = isOpen ? null : panel;
    });
  });

  // Score bars animate when featured section enters view
  const featObs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          document.querySelectorAll('.s-featured .score-bar-fill')
            .forEach(bar => {
              setTimeout(() => {
                bar.style.width = bar.dataset.width + '%';
              }, 300);
            });
          featObs.disconnect();
        }
      });
    }, { threshold: 0.3 }
  );

  const featured = document.querySelector('.s-featured');
  if (featured) featObs.observe(featured);

})();

// ================================
// LINE REVEAL TRANSITION
// ================================
(function() {
  const problema  = document.getElementById('el-problema');
  const servicios = document.getElementById('servicios');
  if (!problema || !servicios) return;

  let lineTriggered = false;

  function checkScroll() {
    const rect = problema.getBoundingClientRect();
    const wh   = window.innerHeight;

    const lineThreshold = rect.bottom < wh * 0.85;

    if (lineThreshold && !lineTriggered) {
      lineTriggered = true;
      problema.classList.add('line-expanded');
    }

    // Reset when scrolling back up
    if (!lineThreshold && lineTriggered) {
      lineTriggered = false;
      problema.classList.remove('line-expanded');
    }
  }

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
})();
