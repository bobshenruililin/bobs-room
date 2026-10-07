import { WORLD, isWalkable, move, findPath, safeMemories } from './engine.mjs';
import { STORIES, PHOTOS, EMAIL, byId } from './stories.mjs';
import { mountObject, mountRug, contactContent } from './objects.mjs';
import { mountTV } from './discoveries.mjs';
import { mountTour } from './tour.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = $('#world'), ctx = canvas.getContext('2d');
const map = $('#room-map'), viewport = $('#world-viewport');
const storyDialog = $('#story-dialog'), utilityDialog = $('#utility-dialog'), photoDialog = $('#photo-dialog');
const validIds = STORIES.map(s => s.id);
const STORAGE = 'bobs-room:v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE) || '{}') || {}; } catch { /* A blocked or damaged journal never prevents exploring. */ }
let found = new Set(safeMemories(saved.memories, validIds));
let visitor = saved.visitor === 'rabbit' ? 'rabbit' : 'fox';
let still = reduced.matches;
let overview = false, entered = false, near = null, activeStory = null, photoIndex = 0;
let player = { x: 660, y: 803, direction: 0 };
let destination = null, route = [], onArrival = null, moving = false;
let atlas, shiba, shibaFrame, frames = [], raf, lastTime = 0, camera = { x: 0, y: 0 }, cameraReady = false;
let cleanObject = () => {}, cleanUtility = () => {}, indexView = false;
let tour;
let audioContext, audioGain, sound = false, audioTimer;
let toastTimer, bubbleTimer, footsteps = [], lastFootstep = 0, lastDOMUpdate = 0;
const keys = new Set();
const companion = { x: 1003, y: 633, direction: 2 };
const dog = { x: 641, y: 548 };
const fireflies = Array.from({ length: 32 }, (_, i) => ({
  x: 100 + (i * 131) % 1330, y: 220 + (i * 73) % 660,
  phase: i * 1.7, size: i % 3 === 0 ? 2 : 1.2,
}));

function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify({ memories: [...found], visitor })); } catch { /* Session still works without storage. */ }
}
function anyDialog() { return storyDialog.open || utilityDialog.open || photoDialog.open; }
function stopWalking() { keys.clear(); route = []; destination = null; onArrival = null; moving = false; $('#destination').classList.remove('active'); }
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4200);
}
function bubble(message, duration = 5000) {
  clearTimeout(bubbleTimer); $('#visitor-bubble').textContent = message; $('#visitor-bubble').hidden = false;
  bubbleTimer = setTimeout(() => { $('#visitor-bubble').hidden = true; }, duration);
}
function enterRoom(focus = true) {
  if (!entered) {
    entered = true; $('#room-welcome').classList.add('departed');
    setTimeout(() => { $('#room-welcome').hidden = true; }, still ? 0 : 450);
    bubble('Follow your curiosity. There’s no right route.');
  }
  if (focus) canvas.focus({ preventScroll: true });
}

function updateMemories() {
  $('#memory-count').textContent = found.size;
  $('#memory-button').setAttribute('aria-label', `Memory journal, ${found.size} of ${STORIES.length} little discoveries`);
  $$('.hotspot').forEach(b => {
    const story = byId(b.dataset.story);
    const visited = found.has(story.id);
    b.classList.toggle('visited', visited);
    const spark = b.querySelector('.spark span'); if (spark) spark.textContent = visited ? '✓' : '+';
    b.setAttribute('aria-label', `${story.title}: ${story.name}${visited ? ', already discovered' : ''}`);
  });
}

function selectVisitor(value, announce = true) {
  visitor = value === 'rabbit' ? 'rabbit' : 'fox';
  $$('[data-visitor]').forEach(b => {
    const selected = b.dataset.visitor === visitor;
    b.classList.toggle('selected', selected); b.setAttribute('aria-pressed', selected);
  });
  persist();
  if (announce) { enterRoom(); bubble(visitor === 'fox' ? 'A fox, a room, a little curiosity.' : 'A rabbit, a room, a little curiosity.'); }
}

$('#hotspots').innerHTML = STORIES.map(s => `<button class="hotspot ${s.id === 'duoji' ? 'dog-hotspot' : ''}" data-story="${s.id}" style="left:${s.marker.x / WORLD.width * 100}%;top:${s.marker.y / WORLD.height * 100}%" aria-label="${esc(s.title)}: ${esc(s.name)}">${s.id === 'duoji' ? '' : '<span class="spark" aria-hidden="true"><span>+</span></span>'}<span class="hotspot-name" aria-hidden="true">${esc(s.title)}</span></button>`).join('');

function setDestination(point, callback = null) {
  enterRoom(false); stopWalking();
  if (still) {
    const safe = findPath(player, point).at(-1);
    if (safe) player = { ...player, ...safe };
    updateCamera(true); callback?.(); return;
  }
  route = findPath(player, point);
  if (!route.length) { toast('Try a little closer to the open floor.'); return; }
  destination = route.at(-1); onArrival = callback;
  $('#destination').style.left = destination.x / WORLD.width * 100 + '%';
  $('#destination').style.top = destination.y / WORLD.height * 100 + '%';
  $('#destination').classList.add('active');
}

function goToStory(id, onOpen = null) {
  const story = byId(id); if (!story) return;
  enterRoom();
  $('#walk-status').textContent = `Walking to ${story.title.toLowerCase()}.`;
  bubble(`Let’s see ${story.title.toLowerCase()}.`, 3500);
  setDestination(story.approach, () => { openStory(story.id); onOpen?.(); });
}

function photoButton(photo, index, className = '') {
  return `<button data-photo="${index}" class="${className}" aria-label="Open photograph: ${esc(photo.caption)}"><img src="./assets/photos/${photo.src}.webp" alt="${esc(photo.alt)}" loading="lazy"><span>${esc(photo.caption)}</span></button>`;
}

function openStory(id) {
  const s = byId(id); if (!s) return;
  if (utilityDialog.open) utilityDialog.close();
  if (photoDialog.open) photoDialog.close();
  cleanObject(); cleanObject = () => {};
  stopWalking(); activeStory = s.id;
  const wasFound = found.has(id); found.add(id); updateMemories(); persist();
  const photo = PHOTOS.find(p => p.src === s.image);
  const photoNumber = photo ? PHOTOS.indexOf(photo) : -1;
  $('#story-content').innerHTML = `
    <div class="story-symbol">${icon(s.icon)}</div>
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h2 id="story-heading">${esc(s.heading)}</h2>
    <p class="story-intro">${esc(s.intro)}</p>
    <div class="story-copy">${s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div>
    ${s.entries ? `<div class="story-entries">${s.entries.map(e => `<article class="story-entry"><span>${esc(e.label)}</span><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></article>`).join('')}</div>` : ''}
    ${s.gallery ? `<div class="photo-grid">${PHOTOS.map((p, i) => photoButton(p, i)).join('')}</div>` : ''}
    ${photo ? `<figure class="story-image"><button data-photo="${photoNumber}" aria-label="Open photograph: ${esc(photo.caption)}"><img src="./assets/photos/${photo.src}.webp" alt="${esc(photo.alt)}" loading="lazy"></button><figcaption>${esc(photo.caption)}</figcaption></figure>` : ''}
    <div class="story-tags">${s.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
    ${s.note ? `<p class="story-note">${esc(s.note)}</p>` : ''}
    ${s.links ? `<div class="story-links">${s.links.map(l => `<a href="${esc(l.href)}"${l.href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener"'}>${esc(l.label)} ↗</a>`).join('')}</div>` : ''}`;
  cleanObject = mountObject($('#story-content'), s, {
    openStory, openUtility, openTV,
    isActive: () => storyDialog.open && !utilityDialog.open && !photoDialog.open,
    setMode: mode => { storyDialog.className = `story-dialog object-dialog ${mode}-dialog`; },
    still: () => still, atlas: () => atlas, frames: () => frames, visitor: () => visitor,
    discover: otherId => { if (!byId(otherId)) return; found.add(otherId); persist(); updateMemories(); $('#story-stamp').textContent = `A LITTLE DISCOVERY, KEPT · ${found.size} / ${STORIES.length}`; },
  });
  $('#story-stamp').textContent = `${wasFound ? 'A FAMILIAR LITTLE STORY' : 'A LITTLE DISCOVERY, KEPT'} · ${found.size} / ${STORIES.length}`;
  if (!storyDialog.open) storyDialog.showModal();
  storyDialog.scrollTop = 0;
  $('#story-close').focus({ preventScroll: true });
  tour?.dialogChanged();
  $('#walk-status').textContent = `${s.name}. ${found.size} of ${STORIES.length} stories discovered.`;
  chime();
  if (!wasFound && found.size === STORIES.length) setTimeout(() => toast('Every little discovery. Thanks for taking the scenic route.'), 350);
}

function openUtility(content, mode = '') {
  cleanUtility(); cleanUtility = () => {};
  stopWalking(); utilityDialog.className = `utility-dialog ${mode}`; $('#utility-content').innerHTML = content;
  if (!utilityDialog.open) utilityDialog.showModal(); utilityDialog.scrollTop = 0; $('#utility-close').focus({ preventScroll: true });
  tour?.dialogChanged();
}

function openContact() { enterRoom(false); openUtility(contactContent(), 'contact-dialog'); }
function openRug() { enterRoom(false); openUtility('', 'rug-dialog'); cleanUtility = mountRug($('#utility-content')); }
function openTV(initialChannel=0) { openUtility('', 'tv-dialog'); cleanUtility = mountTV($('#utility-content'), {initialChannel:Number.isInteger(initialChannel)?initialChannel:0, openStory, isActive: () => utilityDialog.open && !photoDialog.open}); }

function openHelp() {
  openUtility(`<p class="eyebrow">A LITTLE FIELD GUIDE</p><h2 id="utility-heading">Make yourself at home.</h2><p>There’s no clock, no score to beat, and no right order. Each glowing object opens a little part of Bob’s life.</p>
    <div class="help-row"><span>Walk</span><div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys.<br>On a phone, use the little direction pad.</div></div>
    <div class="help-row"><span>Wander</span><div>Click or tap the floor. Your visitor finds a path around the furniture.</div></div>
    <div class="help-row"><span>Discover</span><div>Tap a glowing object, or press <kbd>E</kbd> when you’re near one. Keyboard visitors can also tab to an object and press Enter.</div></div>
    <div class="help-row"><span>Take a pause</span><div>Escape closes a story. Stillness pauses the ambient animation. Sound starts only when you turn it on.</div></div>
    <p class="help-footnote">Prefer to read? The <button data-index class="text-link">room index ↗</button> has every story. On a phone, “Whole room” lets you see the entire apartment.</p>`);
}

function openJournal() {
  openUtility(`<p class="eyebrow">YOUR LITTLE DISCOVERIES · ${found.size} / ${STORIES.length}</p><h2 id="utility-heading">A pocketful of stories.</h2><p>${found.size === STORIES.length ? 'You took the scenic route. Every corner has a little story now.' : 'A few things you’ve noticed along the way. There’s no rush to find them all.'}</p>
    <div class="journal-grid">${STORIES.map(s => `<button class="journal-item ${found.has(s.id) ? 'found' : ''}" data-journal-story="${s.id}" aria-label="${esc(s.name)}, ${found.has(s.id) ? 'discovered' : 'waiting to be discovered'}">${icon(s.icon)}<span>${found.has(s.id) ? esc(s.name) : `${s.number} · A little curiosity`}</span></button>`).join('')}</div>
    <div class="journal-footnote"><span>Kept in this browser, just for you.</span><button id="fresh-walk">Start a fresh walk</button></div>`);
}

function openAboutRoom() {
  openUtility(`<p class="eyebrow">BEHIND THE LITTLE WINDOW</p><h2 id="utility-heading">An imaginary room.<br>A real, curious life.</h2><p>This is Shen Ruililin’s personal page, reimagined as a tiny walkable world. The apartment and animal visitors are fictional; the biography, research, writing, and photographs come from Bob’s published personal page.</p><p>The room and fox-and-rabbit sprite atlas were made with OpenAI’s built-in image generation, then brought to life with a small, original 2D game. The atmosphere is inspired by warm, magical animated worlds; all characters and artwork here are original.</p><p>Your visitor choice and discoveries stay in this browser. There are no accounts, analytics, or message forms. The room works without ChatGPT access.</p><div class="art-colophon"><p>Built with curiosity, and a few well-placed pixels.</p><p>Type: DM Sans, Fraunces, and Silkscreen. Self-hosted with their SIL Open Font Licenses.</p><a href="https://github.com/bobshenruililin/bobs-room" target="_blank" rel="noopener">Visit the room’s source ↗</a></div>`);
}

function setView(reading, focus = true) {
  if (reading) tour?.end();
  stopWalking(); indexView = reading;
  for (const d of [storyDialog, utilityDialog, photoDialog]) if (d.open) d.close();
  document.body.classList.toggle('immersive', !reading); document.body.classList.toggle('index-view', reading);
  $('#index-toggle').innerHTML = reading ? 'Enter the room <span>↗</span>' : 'Read about Bob <span>↗</span>';
  $('#room-index').open = reading;
  if (reading) { window.scrollTo({ top:0, behavior:'instant' }); if (focus) $('#room-index summary').focus({ preventScroll:true }); }
  else { window.scrollTo({top:0,behavior:'instant'}); resize(); if(focus) canvas.focus({preventScroll:true}); }
}
function openIndex() {
  if (location.hash !== '#room-index') history.pushState(null, '', '#room-index');
  setView(true);
}
function returnToRoom() {
  history.pushState(null, '', location.pathname + location.search); setView(false); enterRoom();
}
window.addEventListener('popstate', () => setView(location.hash === '#room-index'));
window.addEventListener('hashchange', () => setView(location.hash === '#room-index'));

function openPhoto(index) {
  photoIndex = (Number(index) + PHOTOS.length) % PHOTOS.length;
  const p = PHOTOS[photoIndex];
  $('#full-photo').src = `./assets/photos/${p.src}.webp`;
  $('#full-photo').alt = p.alt; $('#photo-caption').textContent = p.caption;
  $('#photo-number').textContent = `${photoIndex + 1} / ${PHOTOS.length}`;
  if (!photoDialog.open) photoDialog.showModal();
  $('#photo-close').focus({ preventScroll: true });
  tour?.dialogChanged();
}

document.addEventListener('click', event => {
  const target = event.target;
  const hot = target.closest('.hotspot');
  if (hot) { event.detail === 0 ? openStory(hot.dataset.story) : goToStory(hot.dataset.story); return; }
  const direct = target.closest('[data-story]');
  if (direct) { enterRoom(false); openStory(direct.dataset.story); return; }
  const journal = target.closest('[data-journal-story]');
  if (journal) { utilityDialog.close(); openStory(journal.dataset.journalStory); return; }
  const picture = target.closest('button[data-photo]');
  if (picture) { openPhoto(picture.dataset.photo); return; }
  const selection = target.closest('[data-visitor]');
  if (selection) { selectVisitor(selection.dataset.visitor); return; }
  if (target.closest('[data-index]')) { openIndex(); return; }
  if (target.closest('#fresh-walk')) {
    found = new Set(); persist(); updateMemories(); stopWalking(); player = { x: 660, y: 803, direction: 0 }; updateCamera(true);
    utilityDialog.close(); toast('A fresh little walk. The stories are all still here.');
  }
});

$('#index-toggle').addEventListener('click', () => indexView ? returnToRoom() : openIndex());
$('.skip-link').addEventListener('click', openIndex);
$('#return-room').addEventListener('click', returnToRoom);
$('#builder-invitation').addEventListener('click', openContact);
$('#rug-secret').addEventListener('click', openRug);
document.addEventListener('click', async event => {
  if (!event.target.closest('#copy-email')) return;
  try { await navigator.clipboard.writeText(EMAIL); event.target.closest('#copy-email').textContent='Copied ✓'; }
  catch { toast(`Bob’s email: ${EMAIL}`); }
});
$('#help-button').addEventListener('click', openHelp);
$('#memory-button').addEventListener('click', openJournal);
$('#about-room').addEventListener('click', openAboutRoom);
$('#enter-room').addEventListener('click', () => { enterRoom(); bubble('Choose a glow. I’ll walk you over.'); });
$('#guided-tour').addEventListener('click', () => tour?.start());
$('#story-close').addEventListener('click', () => storyDialog.close());
$('#utility-close').addEventListener('click', () => utilityDialog.close());
$('#photo-close').addEventListener('click', () => photoDialog.close());
$('#photo-prev').addEventListener('click', () => openPhoto(photoIndex - 1));
$('#photo-next').addEventListener('click', () => openPhoto(photoIndex + 1));
$('#next-story').addEventListener('click', () => {
  const next = STORIES[(STORIES.findIndex(s => s.id === activeStory) + 1) % STORIES.length];
  storyDialog.close();
  indexView ? openStory(next.id) : goToStory(next.id);
});
for (const dialog of [storyDialog, utilityDialog, photoDialog]) {
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { keys.clear(); });
}
storyDialog.addEventListener('close', () => { if (!storyDialog.open) { cleanObject(); cleanObject = () => {}; } });
utilityDialog.addEventListener('close', () => { if (!utilityDialog.open) { cleanUtility(); cleanUtility = () => {}; } });

$('#labels-button').addEventListener('click', () => {
  const show = !map.classList.contains('show-labels'); map.classList.toggle('show-labels', show);
  $('#labels-button').setAttribute('aria-pressed', show);
});
function setStill(value) {
  still = value; document.body.classList.toggle('still', still); $('#motion-button').setAttribute('aria-pressed', still);
  $('#motion-button').querySelector('span').textContent = still ? 'Motion off' : 'Stillness';
}
$('#motion-button').addEventListener('click', () => setStill(!still));
reduced.addEventListener('change', e => setStill(e.matches));
$('#overview-button').addEventListener('click', () => {
  overview = !overview; viewport.classList.toggle('overview', overview); $('#overview-button').setAttribute('aria-pressed', overview);
  $('#overview-button').querySelector('span').textContent = overview ? 'Follow me' : 'Whole room';
  cameraReady = false; resize();
});

function pointFromEvent(event) {
  const box = map.getBoundingClientRect();
  return { x: (event.clientX - box.left) / box.width * WORLD.width, y: (event.clientY - box.top) / box.height * WORLD.height };
}
map.addEventListener('pointerdown', e => {
  if (anyDialog()) return;
  if (e.target.closest('button, a')) return;
  const point = pointFromEvent(e); enterRoom();
  if (Math.hypot(point.x - companion.x, point.y - (companion.y - 80)) < 68) {
    openUtility(`<p class="eyebrow">A FELLOW WANDERER</p><h2 id="utility-heading">Oh, you’re visiting too?</h2><p>“I came for a cup of tea and stayed for the stories. Try the bookshelf — or the little desk. There’s a whole curious life in here.”</p><p>A greeting from the room’s fictional ${visitor === 'fox' ? 'rabbit' : 'fox'} visitor.</p><button data-journal-story="hello" class="text-link">Meet the person behind the room ↗</button>`);
    return;
  }
  setDestination(point);
});

function discoverNearby() {
  if (near) openStory(near.id);
  else { bubble('Follow a little glow, or tap an object.'); toast('Choose a glowing object, or open the room index.'); }
}
$('#nearby-prompt').addEventListener('click', discoverNearby);
$('#touch-explore').addEventListener('click', discoverNearby);
const movementKeys = { ArrowUp:'up', w:'up', ArrowDown:'down', s:'down', ArrowLeft:'left', a:'left', ArrowRight:'right', d:'right' };
window.addEventListener('keydown', e => {
  if (anyDialog()) {
    if (photoDialog.open && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); openPhoto(photoIndex + (e.key === 'ArrowRight' ? 1 : -1)); }
    return;
  }
  if (indexView) return;
  if (!$('.game-frame').contains(document.activeElement)) return;
  const direction = movementKeys[e.key] || movementKeys[e.key.toLowerCase()];
  if (direction) { e.preventDefault(); enterRoom(false); route = []; onArrival = null; destination = null; keys.add(direction); $('#destination').classList.remove('active'); }
  else if (e.key.toLowerCase() === 'e' && !e.repeat) { e.preventDefault(); discoverNearby(); }
});
window.addEventListener('keyup', e => { const direction = movementKeys[e.key] || movementKeys[e.key.toLowerCase()]; if (direction) keys.delete(direction); });
window.addEventListener('blur', () => keys.clear());
document.addEventListener('visibilitychange', () => { keys.clear(); if (audioGain) audioGain.gain.setTargetAtTime(document.hidden ? 0 : .07, audioContext.currentTime, .2); });
$$('[data-direction]').forEach(b => {
  b.addEventListener('pointerdown', e => {
    e.preventDefault(); enterRoom(false); stopWalking(); keys.add(b.dataset.direction); b.setPointerCapture(e.pointerId);
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(event, () => keys.delete(b.dataset.direction));
  b.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); enterRoom(false); const direction = b.dataset.direction; const delta = { up:[0,-32], down:[0,32], left:[-32,0], right:[32,0] }[direction]; player = { ...player, ...move(player, ...delta) }; updateCamera(true); }
  });
});

function updateNearby() {
  let next = null, closest = 107;
  for (const s of STORIES) {
    const d = Math.hypot(player.x - s.approach.x, player.y - s.approach.y);
    if (d < closest) { next = s; closest = d; }
  }
  if (near?.id === next?.id) return;
  near = next;
  $$('.hotspot').forEach(b => b.classList.toggle('near', b.dataset.story === near?.id));
  $('#nearby-prompt').hidden = !near;
  if (near) $('#nearby-prompt span').textContent = near.title;
  $('#touch-status').textContent = near ? `You’re near ${near.title.toLowerCase()}.` : 'Tap an object to explore.';
  if (near && entered) $('#walk-status').textContent = `Near ${near.title.toLowerCase()}. Press E to explore.`;
}

function resize() {
  const scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(map.clientWidth * scale);
  canvas.height = Math.round(map.clientHeight * scale);
  ctx.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0);
  ctx.imageSmoothingEnabled = false;
  cameraReady = false; updateCamera(true);
}

function updateCamera(immediate = false) {
  const width = map.clientWidth, height = map.clientHeight;
  const mobile = matchMedia('(max-width: 760px)').matches;
  let x = -(width - viewport.clientWidth) / 2, y = -(height - viewport.clientHeight) * .49;
  if (mobile && !overview) {
    const scale = width / WORLD.width;
    x = Math.min(0, Math.max(viewport.clientWidth - width, viewport.clientWidth * .5 - player.x * scale));
    y = Math.min(0, Math.max(viewport.clientHeight - height, viewport.clientHeight * .65 - player.y * scale));
  } else if (mobile && overview) { x=0; y=(viewport.clientHeight-height)/2; }
  const factor = immediate || !cameraReady || still ? 1 : .11;
  camera.x += (x - camera.x) * factor; camera.y += (y - camera.y) * factor; cameraReady = true;
  map.style.transform = `translate(${camera.x.toFixed(2)}px,${camera.y.toFixed(2)}px)`;
}
new ResizeObserver(resize).observe(viewport);

function drawSprite(point, isPlayer, time) {
  if (!atlas || !frames.length) return;
  const row = (isPlayer ? visitor === 'rabbit' : visitor !== 'rabbit') ? 1 : 0;
  const f = frames[row * 4 + point.direction];
  if (!f) return;
  const height = isPlayer ? 174 : 163, width = f.w / f.h * height;
  const bob = still || !moving || !isPlayer ? 0 : Math.sin(time * .019) * 2.5;
  ctx.fillStyle = '#1b251e50'; ctx.beginPath(); ctx.ellipse(point.x, point.y - 1, 23, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, point.x - width / 2, point.y - height - bob, width, height);
  if (isPlayer) {
    ctx.fillStyle = '#f9dfa8'; ctx.beginPath(); ctx.moveTo(point.x - 4, point.y + 12); ctx.lineTo(point.x + 4, point.y + 12); ctx.lineTo(point.x, point.y + 16); ctx.closePath(); ctx.fill();
  }
}

function render(time) {
  const dt = Math.min((time - lastTime) / 1000 || 0, .045); lastTime = time;
  moving = false;
  if (!anyDialog() && !indexView) {
    let dx = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
    let dy = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0);
    if (dx || dy) {
      const length = Math.hypot(dx, dy); dx = dx / length * 235 * dt; dy = dy / length * 235 * dt;
      const before = player; player = { ...player, ...move(player, dx, dy) };
      moving = Math.hypot(player.x - before.x, player.y - before.y) > .1;
      player.direction = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 3 : 2 : dy > 0 ? 0 : 1;
    } else if (route.length) {
      const target = route[0], x = target.x - player.x, y = target.y - player.y, distance = Math.hypot(x, y);
      const step = 370 * dt;
      if (distance <= step) {
        player = { ...player, x: target.x, y: target.y }; route.shift();
        if (!route.length) {
          destination = null; $('#destination').classList.remove('active');
          const callback = onArrival; onArrival = null; callback?.();
        }
      } else {
        player = { ...player, ...move(player, x / distance * step, y / distance * step) };
        player.direction = Math.abs(x) > Math.abs(y) ? x > 0 ? 3 : 2 : y > 0 ? 0 : 1;
      }
      moving = true;
    }
  }
  updateCamera(); updateNearby();
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  if (!still) {
    for (const f of fireflies) {
      const pulse = (Math.sin(time * .0017 + f.phase) + 1) / 2;
      const x = f.x + Math.sin(time * .0005 + f.phase) * 18, y = f.y + Math.cos(time * .0007 + f.phase) * 12;
      ctx.fillStyle = `rgba(255,220,141,${(.12 + pulse * .58).toFixed(2)})`;
      ctx.shadowColor = '#f6d16c'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(x, y, f.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (moving && time - lastFootstep > 210) { footsteps.push({ x:player.x, y:player.y + 2, born:time }); lastFootstep = time; }
    footsteps = footsteps.filter(f => time - f.born < 700);
    for (const f of footsteps) { ctx.fillStyle = `rgba(251,232,190,${.2 * (1 - (time - f.born) / 700)})`; ctx.fillRect(f.x - 2, f.y, 3, 2); }
  }
  const ordered = [{ ...companion, isPlayer:false }, { ...player, isPlayer:true }, { ...dog, dog:true }].sort((a, b) => a.y - b.y);
  for (const figure of ordered) {
    if (figure.dog) {
      if (shiba && shibaFrame) { const f=shibaFrame, h=104, w=f.w/f.h*h; ctx.fillStyle='#17271c60';ctx.beginPath();ctx.ellipse(dog.x,dog.y-2,29,8,0,0,Math.PI*2);ctx.fill();ctx.drawImage(shiba,f.x,f.y,f.w,f.h,dog.x-w/2,dog.y-h,w,h); }
    } else drawSprite(figure, figure.isPlayer, time);
  }
  $('#visitor-bubble').style.left = player.x / WORLD.width * 100 + '%';
  $('#visitor-bubble').style.top = (player.y - 190) / WORLD.height * 100 + '%';
  if (time - lastDOMUpdate > 150) {
    canvas.dataset.playerX = player.x.toFixed(1); canvas.dataset.playerY = player.y.toFixed(1); canvas.dataset.visitor = visitor;
    canvas.dataset.walking = String(moving); canvas.dataset.near = near?.id || ''; lastDOMUpdate = time;
  }
  raf = requestAnimationFrame(render);
}

function playNote(frequency, start, duration = 1.5, volume = .3) {
  if (!audioContext || !sound) return;
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
  oscillator.type = 'sine'; oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .025); gain.gain.exponentialRampToValueAtTime(.001, start + duration);
  oscillator.connect(gain); gain.connect(audioGain); oscillator.start(start); oscillator.stop(start + duration + .05);
}
function ambientNotes() {
  if (!audioContext || !sound || document.hidden) return;
  const now = audioContext.currentTime;
  [261.63, 329.63, 392, 523.25].forEach((f, i) => playNote(f, now + i * .9, 2.8, .14));
}
function chime() { if (sound && audioContext) { playNote(659.25, audioContext.currentTime, .6, .25); playNote(783.99, audioContext.currentTime + .14, .8, .18); } }
$('#sound-button').addEventListener('click', async () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioGain = audioContext.createGain(); audioGain.gain.value = .07; audioGain.connect(audioContext.destination);
    }
    sound = !sound;
    if (sound) { await audioContext.resume(); ambientNotes(); audioTimer = setInterval(ambientNotes, 12500); }
    else { clearInterval(audioTimer); await audioContext.suspend(); }
    $('#sound-button').setAttribute('aria-pressed', sound); $('#sound-button span').textContent = sound ? 'Sound on' : 'Sound off';
  } catch { sound = false; toast('Sound isn’t available in this browser. The room is still yours to explore.'); }
});

async function loadVisitors() {
  const [image, dogImage, response] = await Promise.all([
    new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = './assets/art/visitors.png'; }),
    new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = './assets/art/shiba.webp'; }),
    fetch('./assets/art/frames.json'),
  ]);
  if (!response.ok) throw new Error('Sprite metadata unavailable');
  const data = await response.json(); atlas = image; frames = data.frames; shiba = dogImage; shibaFrame = data.shiba;
}
const art = $('#room-art');
function artFailed() { $('#loading-note').hidden = true; $('#art-error').hidden = false; }
art.addEventListener('error', artFailed);
art.addEventListener('load', () => { $('#loading-note').hidden = true; $('#art-error').hidden = true; });
$('#retry-art').addEventListener('click', () => { $('#art-error').hidden = true; $('#loading-note').hidden = false; art.src = `./assets/art/room-v2.webp?retry=${Date.now()}`; loadVisitors().catch(() => toast('The visitors couldn’t load. You can still explore the stories.')); });
if (art.complete) art.naturalWidth ? $('#loading-note').hidden = true : artFailed();
loadVisitors().catch(() => toast('The visitors couldn’t load. You can still explore the glowing objects and room index.'));

tour = mountTour({
  startButton: $('#tour-start'), dialogs: [storyDialog, utilityDialog, photoDialog],
  getDialog: () => photoDialog.open ? photoDialog : utilityDialog.open ? utilityDialog : storyDialog.open ? storyDialog : null,
  prepare: () => {
    if (indexView) { history.pushState(null, '', location.pathname + location.search); setView(false); }
    enterRoom(false); stopWalking();
  },
  closeDialogs: () => { for (const dialog of [photoDialog, utilityDialog, storyDialog]) if (dialog.open) dialog.close(); },
  stopWalking, openStory, goToStory, openRug, openTV,
  walkToRug: arrived => setDestination({ x:1008, y:696 }, arrived),
});

selectVisitor(visitor, false); setStill(still); updateMemories(); resize();
setView(location.hash === '#room-index', false);
bubble('Oh, hello! Make yourself at home.', 10000);
raf = requestAnimationFrame(render);
window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); clearInterval(audioTimer); audioContext?.suspend(); });
window.addEventListener('pageshow', e => { if (e.persisted) { lastTime = 0; raf = requestAnimationFrame(render); if (sound) { audioContext?.resume(); audioTimer = setInterval(ambientNotes, 12500); } } });
