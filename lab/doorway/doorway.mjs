// Path A prototype: Bob in the gate on Suomenlinna. Each work opens behind the gate.
// The photograph is never altered. Everything that changes happens in the opening,
// which sits *behind* the photograph's cut-out, so Bob, the chains and the stone always
// stay as photographed – including when a generated clip plays there.

import { WORKS, SEA } from './works.mjs';

const $ = (s) => document.querySelector(s);
const M = './media/';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => innerWidth <= 760;


const stage = $('#stage'), view = $('#view'), photo = $('#photo');
const reel = $('#reel'), frames = $('#reel-frames');
let door, motion = {}, heat, L;
let current = -1;          // -1 is the sea
let mode = 'door';         // door | moving | reel | index
let overture = null;
const imgCache = new Map();

/* ---------------- loading ---------------- */
function preload(name) {
  if (name.startsWith('@')) return Promise.resolve();
  if (!imgCache.has(name)) {
    const im = new Image();
    im.src = M + name + '.webp';
    imgCache.set(name, im.decode().catch(() => {}).then(() => im));
  }
  return imgCache.get(name);
}

/* ---------------- geometry ---------------- */
function layout() {
  const vw = innerWidth, vh = innerHeight;
  const top = $('#bar-top').offsetHeight, bottom = $('#bar-bottom').offsetHeight;
  const band = { x: 0, y: top, w: vw, h: vh - top - bottom };
  const [W, H] = door.size;
  const o = { x0: door.opening[0] * W, y0: door.opening[1] * H, x1: door.opening[2] * W, y1: door.opening[3] * H };
  o.w = o.x1 - o.x0; o.h = o.y1 - o.y0;
  const f = phone() ? 0.8 : 0.34;
  const s0 = Math.max(band.w / W, band.h / H, Math.min(f * band.w / o.w, 0.9 * band.h / o.h));
  const cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2;
  let ox = band.x + band.w / 2 - cx * s0, oy = band.y + band.h / 2 - cy * s0;
  ox = Math.min(band.x, Math.max(band.x + band.w - W * s0, ox));
  oy = Math.min(band.y, Math.max(band.y + band.h - H * s0, oy));
  const ax = door.anchor[0] * W, ay = door.anchor[1] * H;
  const s1 = 1.02 * Math.max((vw / 2) / (ax - o.x0), (vw / 2) / (o.x1 - ax), (vh / 2) / (ay - o.y0), (vh / 2) / (o.y1 - ay));
  L = { vw, vh, W, H, o, s0, ox0: ox, oy0: oy, ax, ay, s1, band };
  view.style.width = o.w + 'px';
  view.style.height = o.h + 'px';
  photo.style.width = W + 'px';
  photo.style.height = H + 'px';
  photo.style.transformOrigin = view.style.transformOrigin = '0 0';
  for (const p of view.querySelectorAll('.pane')) fitPane(p);
}

// e = 0 at the landing, 1 when the opening fills the screen
function place(e) {
  const { s0, s1, ox0, oy0, ax, ay, vw, vh, o } = L;
  const s = s0 * Math.pow(s1 / s0, e);
  const a0x = ox0 + ax * s0, a0y = oy0 + ay * s0;
  const axs = a0x + (vw / 2 - a0x) * e, ays = a0y + (vh / 2 - a0y) * e;
  const ox = axs - ax * s, oy = ays - ay * s;
  photo.style.transform = `translate(${ox}px, ${oy}px) scale(${s})`;
  view.style.transform = `translate(${ox + o.x0 * s}px, ${oy + o.y0 * s}px) scale(${s})`;
  photo.style.opacity = String(1 - smooth(clamp((e - 0.45) / 0.4)));
  return { s, ox, oy };
}

const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => x * x * (3 - 2 * x);
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* ---------------- what is behind the gate ---------------- */
function ready(kind, id) { return motion?.[kind]?.[id]?.ready ? motion[kind][id] : null; }

function paneFor(i) {
  const pane = document.createElement('div');
  pane.className = 'pane';
  pane.dataset.i = i;
  if (i < 0) {
    pane.classList.add('sea');
    const clip = ready('L', 'gate');
    const el = clip ? video(clip.src, true) : Object.assign(new Image(), { src: M + 'view-sea.webp', alt: '' });
    pane.append(el);
  } else {
    const w = WORKS[i];
    const clip = ready('G', w.id);
    if (clip) { pane.classList.add('sea'); pane.append(video(clip.src, false)); }
    else if (w.door === '@heat') pane.append(heatStrip());
    else {
      const im = new Image(); im.alt = ''; im.src = M + w.door + '.webp'; im.style.objectPosition = w.pos;
      pane.append(im);
    }
  }
  fitPane(pane);
  return pane;
}

// The sea and the G clips are crops of the photograph's own "sea" rectangle, so they are
// laid out in photograph pixels; work stills simply cover the opening.
function fitPane(pane) {
  if (!pane.classList.contains('sea')) return;
  const [W, H] = door.size, sea = door.sea, o = L.o;
  Object.assign(pane.style, { inset: 'auto', left: sea[0] * W - o.x0 + 'px', top: sea[1] * H - o.y0 + 'px', width: (sea[2] - sea[0]) * W + 'px', height: (sea[3] - sea[1]) * H + 'px' });
}

function video(src, loop) {
  const v = document.createElement('video');
  Object.assign(v, { src, muted: true, playsInline: true, autoplay: true, loop });
  v.setAttribute('muted', '');
  return v;
}

function showInDoor(i, dir = 1) {
  if (i === current && view.children.length) return;
  current = i;
  const pane = paneFor(i);
  if (!reduce && view.children.length) pane.classList.add('wipe', ...(dir < 0 ? ['back'] : []));
  view.append(pane);
  const old = [...view.children].slice(0, -1);
  setTimeout(() => old.forEach((p) => p.remove()), reduce ? 0 : 460);
  const w = i < 0 ? SEA : WORKS[i];
  document.documentElement.style.setProperty('--work', i < 0 ? SEA.color : WORKS[i].color);
  $('#now-swatch').style.background = i < 0 ? SEA.color : lift(WORKS[i].color);
  $('#now-title').textContent = w.title;
  $('#now-kind').textContent = w.kind;
  document.querySelectorAll('.door-list button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
}

// swatches on the dark bar need a little more light than the reel grounds
function lift(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * 0.28));
  return `rgb(${c.join(',')})`;
}

/* ---------------- heat: Hong Kong Observatory daily maxima, 2013–2023 ---------------- */
const BINS = [[16, '#1f3550'], [20, '#3d5f7c'], [24, '#8399a5'], [27, '#d3c9b1'], [30, '#e6ad66'], [33, '#d4673a'], [99, '#a8151b']];
const heatColour = (t) => BINS.find(([max]) => t < max)[1];

function heatStrip() {
  const years = Object.keys(heat.years);
  const c = document.createElement('canvas');
  c.width = 366; c.height = years.length;
  c.style.imageRendering = 'pixelated';
  const g = c.getContext('2d');
  years.forEach((y, row) => heat.years[y].forEach((t, d) => { g.fillStyle = t == null ? '#000' : heatColour(t); g.fillRect(d, row, 1, 1); }));
  c.style.objectFit = 'fill';
  return c;
}

function heatFrame(kind, w, h) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  g.fillStyle = '#0e141c'; g.fillRect(0, 0, w, h);
  const years = Object.keys(heat.years);
  const pad = Math.max(16, w * 0.04), labelW = phone() ? 34 : 52;
  g.font = `600 ${phone() ? 11 : 13}px "Schibsted Grotesk", sans-serif`;
  g.textBaseline = 'middle';
  const top = pad + 34, rowH = (h - top - pad - 28) / years.length;
  g.fillStyle = 'rgba(244,241,232,.9)';
  if (kind === '@heat') {
    g.fillText('Every day’s maximum temperature at the Hong Kong Observatory, 2013–2023', pad, pad + 8);
    const cw = (w - pad * 2 - labelW) / 366;
    years.forEach((y, r) => {
      g.fillStyle = 'rgba(244,241,232,.6)'; g.fillText(y, pad, top + r * rowH + rowH / 2);
      heat.years[y].forEach((t, d) => { g.fillStyle = t == null ? '#000' : heatColour(t); g.fillRect(pad + labelW + d * cw, top + r * rowH, Math.ceil(cw), rowH - 1); });
    });
    // legend
    let x = pad + labelW;
    const ly = h - pad - 8;
    ['<16', '16', '20', '24', '27', '30', '33 °C+'].forEach((t, k) => {
      g.fillStyle = BINS[k][1]; g.fillRect(x, ly - 6, 14, 12);
      g.fillStyle = 'rgba(244,241,232,.7)'; g.fillText(t, x + 18, ly); x += phone() ? 44 : 64;
    });
  } else {
    g.fillText('Very hot days each year (maximum 33 °C or above), Hong Kong Observatory', pad, pad + 8);
    const counts = years.map((y) => heat.years[y].filter((t) => t >= 33).length);
    const max = 60, bw = w - pad * 2 - labelW - 40;
    years.forEach((y, r) => {
      const yy = top + r * rowH;
      g.fillStyle = 'rgba(244,241,232,.6)'; g.fillText(y, pad, yy + rowH / 2);
      g.fillStyle = '#a8151b'; g.fillRect(pad + labelW, yy + rowH * 0.18, bw * counts[r] / max, rowH * 0.64);
      g.fillStyle = 'rgba(244,241,232,.9)'; g.fillText(String(counts[r]), pad + labelW + bw * counts[r] / max + 8, yy + rowH / 2);
    });
    g.fillStyle = 'rgba(244,241,232,.55)';
    g.fillText('Public observations, not findings from the study.', pad, h - pad - 8);
  }
  return c;
}

/* ---------------- entering and leaving ---------------- */
function animate(ms, fn) {
  return new Promise((done) => {
    if (reduce) { fn(1); return done(); }
    const t0 = performance.now();
    const tick = (t) => { const x = clamp((t - t0) / ms); fn(x); x < 1 ? requestAnimationFrame(tick) : done(); };
    requestAnimationFrame(tick);
  });
}

async function enter(i, { fromHash = false } = {}) {
  if (mode !== 'door') return;
  stopOverture();
  if (current !== i) showInDoor(i);
  mode = 'moving';
  document.body.classList.add('inside');
  const w = WORKS[i];
  const clip = !fromHash && !reduce && ready('E', w.id);
  if (clip) {
    // Higgsfield E shot: a real dolly through the gate. It starts on the landing framing
    // between the bars and grows to the full screen as the bars leave.
    const v = await playThrough(clip[phone() ? 'tall' : 'wide']);
    if (v) {
      await preload(w.frames[phone() ? 'p' : 'd'][0]);
      place(1);
      await openReel(i, 0, { flipFrom: 'viewport' });
      setTimeout(() => v.remove(), 60);
      return;
    }
  }
  await Promise.all([preload(w.frames[phone() ? 'p' : 'd'][0]), fromHash ? null : animate(1150, (x) => place(inOut(x)))]);
  place(1);
  openReel(i, 0, { flipFrom: !fromHash });
}

function playThrough(src) {
  return new Promise((resolve) => {
    const v = video(src, false);
    v.autoplay = false;
    v.className = 'through';
    const { band } = L;
    Object.assign(v.style, { top: band.y + 'px', height: band.h + 'px' });
    document.body.append(v);
    const fail = setTimeout(() => { v.remove(); resolve(null); }, 1800);
    v.addEventListener('canplay', () => {
      clearTimeout(fail);
      v.play().catch(() => {});
      requestAnimationFrame(() => Object.assign(v.style, { top: '0px', height: '100%' }));
      v.addEventListener('ended', () => resolve(v), { once: true });
    }, { once: true });
    v.addEventListener('error', () => { clearTimeout(fail); v.remove(); resolve(null); }, { once: true });
  });
}

async function leave() {
  if (mode !== 'reel') return;
  mode = 'moving';
  stopTimer();
  if (current !== reelWork) { showInDoor(reelWork); }
  place(1);
  reel.style.transition = 'opacity 380ms';
  reel.style.opacity = '0';
  await new Promise((r) => setTimeout(r, reduce ? 0 : 380));
  reel.hidden = true; reel.style.opacity = '';
  history.replaceState(null, '', location.pathname + location.search);
  document.body.classList.remove('inside');
  await animate(950, (x) => place(1 - inOut(x)));
  place(0);
  mode = 'door';
  $('#door-list').querySelectorAll('button')[current]?.focus({ preventScroll: true });
}

/* ---------------- the reel ---------------- */
let reelWork = 0, reelFrame = 0, timer = null, paused = false, t0 = 0, elapsed = 0;
const FRAME_MS = 5200;

function frameBox() {
  const vw = innerWidth, vh = innerHeight;
  if (phone()) return { x: 16, y: 64, w: vw - 32, h: vh - 64 - 250 };
  const left = Math.min(420, vw * 0.3);
  return { x: left, y: 78, w: vw - left - 40, h: vh - 78 - 40 };
}

function contain(iw, ih, box) {
  const k = Math.min(box.w / iw, box.h / ih);
  const w = iw * k, h = ih * k;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

async function frameEl(name, box) {
  if (name.startsWith('@')) {
    const c = heatFrame(name, box.w, box.h);
    Object.assign(c.style, { left: box.x + 'px', top: box.y + 'px', width: box.w + 'px', height: box.h + 'px' });
    c.className = 'frame';
    return { el: c, rect: box };
  }
  const im = (await preload(name)).cloneNode();
  im.alt = '';
  im.className = 'frame';
  const r = contain(im.naturalWidth || 1600, im.naturalHeight || 1000, box);
  Object.assign(im.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  return { el: im, rect: r };
}

async function openReel(i, k, { flipFrom = false } = {}) {
  reelWork = i; reelFrame = k;
  reel.hidden = false;
  mode = 'reel';
  if (flipFrom) reel.classList.add('settling');
  await renderFrame({ flipFrom });
  if (flipFrom) setTimeout(() => reel.classList.remove('settling'), reduce ? 0 : 520);
  reel.focus?.();
}

async function renderFrame({ flipFrom = false, dir = 0 } = {}) {
  const w = WORKS[reelWork];
  const list = w.frames[phone() ? 'p' : 'd'];
  reelFrame = (reelFrame + list.length) % list.length;
  document.documentElement.style.setProperty('--work', w.color);
  $('#reel-num').textContent = `${String(reelWork + 1).padStart(2, '0')} / ${String(WORKS.length).padStart(2, '0')} · ${w.kind}`;
  $('#reel-title').textContent = w.title;
  $('#reel-line').textContent = w.line;
  $('#reel-credit').textContent = w.credit;
  $('#reel-open').href = w.href;
  $('#reel-count').textContent = `${reelFrame + 1} of ${list.length}`;
  $('#progress').innerHTML = list.map(() => '<span><i></i></span>').join('');
  [...$('#progress').children].forEach((s, k) => { if (k < reelFrame) s.firstChild.style.transform = 'none'; });
  history.replaceState(null, '', `#${w.id}${reelFrame ? '/' + (reelFrame + 1) : ''}`);

  const box = frameBox();
  const { el, rect } = await frameEl(list[reelFrame], box);
  const old = [...frames.children];
  frames.append(el);
  if (flipFrom && !reduce) {
    // start where the door view left off: the opening fills the screen, the still covers it
    const start = flipFrom === 'viewport' ? viewportCover(el) : coverRect(el, L.s1);
    const sx = start.w / rect.w;
    const g = $('#reel-ground');
    g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'ease-out' });
    el.animate([{ transformOrigin: '0 0', transform: `translate(${start.x - rect.x}px, ${start.y - rect.y}px) scale(${sx})`, boxShadow: 'none' }, { transformOrigin: '0 0', transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' });
  } else if (dir && !reduce) {
    el.animate([{ transform: `translateX(${dir * 6}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
  setTimeout(() => old.forEach((o) => o.remove()), flipFrom ? 0 : 200);
  preloadAround();
  startTimer();
}

// where an E shot's last frame sits: the work's still covering the whole screen
function viewportCover(el) {
  const iw = el.naturalWidth || el.width, ih = el.naturalHeight || el.height;
  const vw = innerWidth, vh = innerHeight;
  const k = Math.max(vw / iw, vh / ih);
  const [px, py] = (WORKS[reelWork].pos || '50% 50%').split(' ').map((v) => parseFloat(v) / 100);
  return { x: (vw - iw * k) * px, y: (vh - ih * k) * py, w: iw * k, h: ih * k };
}

// where the work's door still sits on screen once the opening fills it
function coverRect(el, s1) {
  const { o, vw, vh, ax, ay } = L;
  const ox = vw / 2 - ax * s1, oy = vh / 2 - ay * s1;
  const box = { x: ox + o.x0 * s1, y: oy + o.y0 * s1, w: o.w * s1, h: o.h * s1 };
  const iw = el.naturalWidth || el.width, ih = el.naturalHeight || el.height;
  const w = WORKS[reelWork];
  if (w.door === '@heat' || el.tagName === 'CANVAS') return box;
  const k = Math.max(box.w / iw, box.h / ih);
  const [px, py] = (w.pos || '50% 50%').split(' ').map((v) => parseFloat(v) / 100);
  return { x: box.x + (box.w - iw * k) * px, y: box.y + (box.h - ih * k) * py, w: iw * k, h: ih * k };
}

function preloadAround() {
  const set = phone() ? 'p' : 'd';
  WORKS[reelWork].frames[set].forEach(preload);
  WORKS[(reelWork + 1) % WORKS.length].frames[set].slice(0, 1).forEach(preload);
}

function startTimer() {
  stopTimer();
  elapsed = 0; paused = false; t0 = performance.now();
  const bar = $('#progress').children[reelFrame]?.firstChild;
  const tick = (t) => {
    if (mode !== 'reel') return;
    if (!paused) { elapsed += t - t0; }
    t0 = t;
    if (bar) bar.style.transform = `scaleX(${clamp(elapsed / FRAME_MS)})`;
    if (elapsed >= FRAME_MS && !reduce) return nextFrame();
    timer = requestAnimationFrame(tick);
  };
  timer = requestAnimationFrame(tick);
}
function stopTimer() { cancelAnimationFrame(timer); timer = null; }

function nextFrame() {
  const n = WORKS[reelWork].frames[phone() ? 'p' : 'd'].length;
  if (reelFrame + 1 >= n) return nextWork(1);
  reelFrame++; renderFrame({ dir: 1 });
}
function prevFrame() {
  if (reelFrame === 0) return nextWork(-1, true);
  reelFrame--; renderFrame({ dir: -1 });
}
function nextWork(d, toLast = false) {
  reelWork = (reelWork + d + WORKS.length) % WORKS.length;
  reelFrame = toLast ? WORKS[reelWork].frames[phone() ? 'p' : 'd'].length - 1 : 0;
  current = -2; // the door will catch up when we leave
  renderFrame({ dir: d });
}

/* ---------------- input ---------------- */
function buildLists() {
  const list = $('#door-list');
  list.innerHTML = WORKS.map((w, i) => `<li><button type="button" style="--c:${lift(w.color)}" data-i="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${w.title}</span></button></li>`).join('');
  list.addEventListener('pointerover', (e) => { const b = e.target.closest('button'); if (b && mode === 'door' && e.pointerType === 'mouse') { stopOverture(); showInDoor(+b.dataset.i, +b.dataset.i > current ? 1 : -1); } });
  // keyboard focus previews a work; a tap's focus must not, or the first tap would step straight through
  list.addEventListener('focusin', (e) => { const b = e.target.closest('button'); if (b && mode === 'door' && b.matches(':focus-visible')) { stopOverture(); showInDoor(+b.dataset.i); } });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.dataset.i;
    // on touch, the first tap shows the work in the gate and the second steps through
    if (e.pointerType !== 'mouse' && e.detail !== 0 && current !== i) { stopOverture(); showInDoor(i, i > current ? 1 : -1); return; }
    enter(i);
  });
  $('#index-list').innerHTML = WORKS.map((w, i) => `<li><button type="button" style="--c:${lift(w.color)}" data-i="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${w.title}<small>${w.kind}</small></span><span class="d">${w.line}</span></button></li>`).join('');
  $('#index-list').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    closeIndex(); showInDoor(+b.dataset.i); setTimeout(() => enter(+b.dataset.i), reduce ? 0 : 500);
  });
}

function bindGate() {
  let sx = 0, sy = 0, moved = false;
  stage.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; moved = false; });
  stage.addEventListener('pointermove', (e) => {
    if (mode !== 'door' || e.pointerType !== 'mouse') return;
    // desktop: moving across the opening runs through the works
    const r = view.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    stopOverture();
    const i = Math.min(WORKS.length - 1, Math.floor(((e.clientX - r.left) / r.width) * WORKS.length));
    showInDoor(i, i > current ? 1 : -1);
  });
  stage.addEventListener('pointerup', (e) => {
    if (mode !== 'door') return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { moved = true; stopOverture(); step(dx < 0 ? 1 : -1); return; }
    const r = view.getBoundingClientRect();
    const inGate = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (inGate) { stopOverture(); current >= 0 ? enter(current) : step(1); }
  });
}

function step(d) {
  const n = WORKS.length;
  const i = current < 0 ? (d > 0 ? 0 : n - 1) : (current + d + n) % n;
  showInDoor(i, d);
}

function bindReel() {
  let sx = 0, sy = 0, down = 0, hold = null;
  reel.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a,button')) return;
    sx = e.clientX; sy = e.clientY; down = performance.now();
    hold = setTimeout(() => { paused = true; }, 220);
  });
  reel.addEventListener('pointerup', (e) => {
    if (e.target.closest('a,button') || !down) return;
    clearTimeout(hold);
    const dx = e.clientX - sx, dy = e.clientY - sy, held = performance.now() - down > 220;
    down = 0;
    if (dy > 80 && dy > Math.abs(dx)) return leave();
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) return nextWork(dx < 0 ? 1 : -1);
    if (held) { paused = false; return; }
    e.clientX < innerWidth * 0.3 ? prevFrame() : nextFrame();
  });
  $('#reel-back').addEventListener('click', leave);
}

addEventListener('keydown', (e) => {
  if (mode === 'index') { if (e.key === 'Escape') closeIndex(); return; }
  if (mode === 'door') {
    if (e.key === 'ArrowRight') { stopOverture(); step(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { stopOverture(); step(-1); e.preventDefault(); }
    if (e.key === 'Enter' && current >= 0 && !e.target.closest('a,button')) enter(current);
  } else if (mode === 'reel') {
    if (e.key === 'Escape' || e.key === 'Backspace') leave();
    if (e.key === 'ArrowRight') nextFrame();
    if (e.key === 'ArrowLeft') prevFrame();
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { nextWork(1); e.preventDefault(); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { nextWork(-1); e.preventDefault(); }
    if (e.key === ' ') { paused = !paused; e.preventDefault(); }
  }
});

function openIndex() { stopOverture(); mode = 'index'; $('#index').hidden = false; $('#close-index').focus(); }
function closeIndex() { $('#index').hidden = true; mode = 'door'; }

/* ---------------- the overture: the gate opens onto every work, then the sea ---------------- */
function startOverture() {
  if (reduce) return;
  let k = 0;
  const seq = [...WORKS.keys(), -1];
  const run = () => {
    if (k >= seq.length) { overture = null; return; }
    showInDoor(seq[k], 1);
    overture = setTimeout(run, k++ === seq.length - 2 ? 900 : 560);
  };
  overture = setTimeout(run, 1600);
}
function stopOverture() { if (overture) { clearTimeout(overture); overture = null; } }

/* ---------------- start ---------------- */
async function start() {
  [door, heat] = await Promise.all([fetch(M + 'door.json').then((r) => r.json()), fetch(M + 'hko-maxtemp-2013-2023.json').then((r) => r.json())]);
  motion = await fetch(M + 'motion.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  await photo.decode().catch(() => {});
  layout();
  place(0);
  buildLists();
  bindGate();
  bindReel();
  $('#open-index').addEventListener('click', openIndex);
  $('#close-index').addEventListener('click', closeIndex);
  $('#play-reel').addEventListener('click', () => { stopOverture(); enter(0); });
  if (phone()) $('#hint').textContent = 'Swipe across the gate for another work. Tap the gate to step through.';
  WORKS.forEach((w) => preload(w.door));
  addEventListener('resize', () => {
    layout();
    if (mode === 'door') place(0);
    else if (mode === 'reel') { place(1); renderFrame(); }
  });
  const m = location.hash.match(/^#([a-z]+)(?:\/(\d+))?$/);
  const hit = m ? WORKS.findIndex((w) => w.id === m[1]) : -1;
  if (hit >= 0) {
    showInDoor(hit);
    document.body.classList.add('inside');
    place(1);
    openReel(hit, (+m[2] || 1) - 1);
  } else {
    showInDoor(-1);
    startOverture();
  }
}
start();
