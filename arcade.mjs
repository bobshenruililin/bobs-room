export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const PIECE_TYPES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]], O: [[1,1],[1,1]], S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]],
};
export function randomStep(seed) {
  const next = (seed * 1664525 + 1013904223) >>> 0;
  return { seed: next, value: next / 4294967296 };
}
export function shuffledBag(seed) {
  const pieces = [...PIECE_TYPES];
  for (let i = pieces.length - 1; i > 0; i--) {
    const random = randomStep(seed); seed = random.seed;
    const j = Math.floor(random.value * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return { pieces, seed };
}
function fillQueue(state) {
  if (state.queue.length < 7) { const bag = shuffledBag(state.seed); state.seed = bag.seed; state.queue.push(...bag.pieces); }
}
export function pieceCells(piece) {
  let matrix = SHAPES[piece.type];
  for (let rotation = 0; rotation < ((piece.rotation % 4) + 4) % 4; rotation++) matrix = matrix[0].map((_, x) => matrix.map(row => row[x]).reverse());
  return matrix.flatMap((row, y) => row.flatMap((filled, x) => filled ? [[piece.x + x, piece.y + y]] : []));
}
export function canPlace(board, piece) {
  return pieceCells(piece).every(([x, y]) => x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT && (y < 0 || !board[y][x]));
}
function spawnPiece(state) {
  fillQueue(state); const type = state.queue.shift();
  state.active = { type, rotation: 0, x: type === 'O' ? 4 : 3, y: -1 };
  state.gravityElapsed = 0; state.lockElapsed = 0; state.lockResets = 0; fillQueue(state);
  if (!canPlace(state.board, state.active)) state.finished = true;
}
export function newRound(seed = 1) {
  const state = { seed: seed >>> 0, board: Array.from({length:BOARD_HEIGHT}, () => Array(BOARD_WIDTH).fill(null)), queue: [], active: null,
    score: 0, lines: 0, level: 1, pieces: 0, elapsed: 0, gravityElapsed: 0, lockElapsed: 0, lockResets: 0, finished: false, clearedRows: [], clearFlash: 0 };
  spawnPiece(state); return state;
}
export function clearLines(board) {
  const rows = [], kept = board.filter((row, y) => { if (row.every(Boolean)) { rows.push(y); return false; } return true; });
  return { board: [...Array.from({length:rows.length}, () => Array(BOARD_WIDTH).fill(null)), ...kept], count: rows.length, rows };
}
export function lockPiece(state) {
  if (state.finished) return 0;
  const cells = pieceCells(state.active);
  if (cells.some(([,y]) => y < 0)) { state.finished = true; return 0; }
  for (const [x, y] of cells) state.board[y][x] = state.active.type;
  const cleared = clearLines(state.board); state.board = cleared.board;
  state.score += [0, 100, 300, 500, 800][cleared.count] * state.level; state.lines += cleared.count; state.level = 1 + Math.floor(state.lines / 10);
  state.clearedRows = cleared.rows; state.clearFlash = cleared.count ? .22 : 0; state.pieces++; spawnPiece(state); return cleared.count;
}
function grounded(state) { return !canPlace(state.board, {...state.active, y: state.active.y + 1}); }
function resetLock(state, wasGrounded) { if (wasGrounded && state.lockResets < 15) { state.lockElapsed = 0; state.lockResets++; } }
export function movePiece(state, direction) {
  if (state.finished || !direction) return false;
  const next = {...state.active, x: state.active.x + Math.sign(direction)};
  if (!canPlace(state.board, next)) return false;
  const wasGrounded = grounded(state); state.active = next; resetLock(state, wasGrounded); return true;
}
export function rotatePiece(state, direction = 1) {
  if (state.finished || state.active.type === 'O') return false;
  const rotation = (state.active.rotation + direction + 4) % 4;
  // Small sideways/floor kicks keep corners friendly without passing through settled blocks.
  const kicks = [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[-1,-1],[1,-1],[0,-2]], wasGrounded = grounded(state);
  for (const [dx,dy] of kicks) {
    const next = {...state.active, rotation, x: state.active.x + dx, y: state.active.y + dy};
    if (canPlace(state.board, next)) { state.active = next; resetLock(state, wasGrounded); return true; }
  }
  return false;
}
export function softDrop(state) {
  if (state.finished) return false;
  const next = {...state.active, y: state.active.y + 1};
  if (!canPlace(state.board, next)) return false;
  state.active = next; state.score++; state.gravityElapsed = 0; state.lockElapsed = 0; return true;
}
export function landingPiece(state) {
  const landing = {...state.active};
  while (canPlace(state.board, {...landing, y: landing.y + 1})) landing.y++;
  return landing;
}
export function hardDrop(state) {
  if (state.finished) return 0;
  const landing = landingPiece(state), distance = landing.y - state.active.y;
  state.active = landing; state.score += distance * 2; lockPiece(state); return distance;
}
export function stepRound(state, dt) {
  if (state.finished) return state;
  dt = Math.max(0, Math.min(dt, .1)); state.elapsed += dt; state.clearFlash = Math.max(0, state.clearFlash - dt); state.gravityElapsed += dt;
  const interval = Math.max(.075, .82 * .82 ** (state.level - 1));
  while (state.gravityElapsed >= interval) { state.gravityElapsed -= interval; const next = {...state.active, y: state.active.y + 1}; if (canPlace(state.board, next)) state.active = next; }
  if (grounded(state)) { state.lockElapsed += dt; if (state.lockElapsed >= .5) lockPiece(state); } else state.lockElapsed = 0;
  return state;
}
const COLORS = { I:'#83d9d4', J:'#7b9be0', L:'#eda368', O:'#edce72', S:'#9ec788', T:'#c698cc', Z:'#e88f8a' };
export function mountArcade(root, api) {
  root.innerHTML = `<div class="arcade-space moonlight-arcade"><div class="arcade-heading"><p class="eyebrow">BOB’S LITTLE ARCADE</p><h2 id="story-heading">Moonlight Blocks</h2><p>A small falling-block game. Make complete rows, find a rhythm, and stay for one more piece.</p></div>
    <div class="arcade-machine"><img class="cabinet-illustration" src="./assets/art/arcade-blocks.webp" alt="A cozy teal pixel arcade cabinet with a tall game screen, gold trim and warm lantern light."><div class="arcade-marquee">MOONLIGHT<br>BLOCKS</div>
    <div class="arcade-screen"><canvas id="arcade-canvas" width="280" height="400" tabindex="0" aria-label="Moonlight Blocks. Left and right arrows or A and D move. Up or W rotates. Down or S soft drops. Space drops the piece. P pauses. Complete horizontal rows to score."></canvas><div class="arcade-overlay" id="arcade-overlay"><span class="arcade-moon">☾</span><h3 id="arcade-message">One more piece.</h3><p id="arcade-message-copy">Fill a row. Watch it disappear.<br>There’s no rush at the start.</p><button id="arcade-start">Play →</button><span class="arcade-start-help">← → move · ↑ rotate<br>↓ lower · Space drop</span></div></div>
    <div class="arcade-controls" aria-label="Game controls"><button data-arcade-dir="-1" data-arcade-action="left" aria-label="Move left">←<small>LEFT</small></button><button data-arcade-action="rotate" aria-label="Rotate block">↻<small>TURN</small></button><button data-arcade-action="down" aria-label="Lower block">↓<small>LOWER</small></button><button data-arcade-action="drop" aria-label="Drop block">⇓<small>DROP</small></button><button data-arcade-dir="1" data-arcade-action="right" aria-label="Move right">→<small>RIGHT</small></button></div>
    <div class="arcade-scoreboard" aria-hidden="true"><span>SCORE <b id="arcade-score">0</b></span><span>LINES <b id="arcade-lines">0</b></span><span>LV <b id="arcade-level">1</b></span></div></div>
    <div class="arcade-footer"><button id="arcade-pause" disabled>Pause</button><button id="arcade-restart" disabled>Restart</button><span id="arcade-announcement" role="status" aria-live="polite">Ready when you are.</span><button id="workshop-notes">Bob’s workshop ↗</button></div></div>`;
  const canvas = root.querySelector('#arcade-canvas'), ctx = canvas.getContext('2d');
  const startButton = root.querySelector('#arcade-start'), overlay = root.querySelector('#arcade-overlay');
  const pauseButton = root.querySelector('#arcade-pause'), restartButton = root.querySelector('#arcade-restart'), announcement = root.querySelector('#arcade-announcement');
  const scoreLabels = {score:root.querySelector('#arcade-score'), lines:root.querySelector('#arcade-lines'), level:root.querySelector('#arcade-level')};
  const controller = new AbortController(), options = {signal:controller.signal};
  let state = newRound(1), running = false, paused = false, last = 0, raf, announcedLines = 0;
  const held = new Map(); ctx.imageSmoothingEnabled = false;
  const playing = () => running && !paused && api.isActive();
  function release() { held.clear(); }
  function start() {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0]; state = newRound(seed); canvas.dataset.round = String(seed);
    running = true; paused = false; release(); last = 0; announcedLines = 0;
    overlay.hidden = true; pauseButton.disabled = false; restartButton.disabled = false; pauseButton.textContent = 'Pause';
    announcement.textContent = 'Make complete rows. Space drops; P pauses.'; canvas.focus({preventScroll:true});
  }
  function finish() {
    running = false; release(); pauseButton.disabled = true; overlay.hidden = false;
    root.querySelector('#arcade-message').textContent = 'A lovely little stack.';
    root.querySelector('#arcade-message-copy').textContent = `${state.lines} row${state.lines === 1 ? '' : 's'} · ${state.score} points. A fresh bag of blocks is waiting.`;
    startButton.textContent = 'Play again →'; announcement.textContent = `Game over. ${state.lines} rows and ${state.score} points.`;
  }
  function togglePause() {
    if (!running) return; paused = !paused; release(); last = 0;
    pauseButton.textContent = paused ? 'Resume' : 'Pause'; announcement.textContent = paused ? 'Paused. The pieces can wait.' : 'Back to one more piece.';
    if (!paused) canvas.focus({preventScroll:true});
  }
  function action(name) {
    if (!playing()) return;
    if (name === 'left') movePiece(state, -1); if (name === 'right') movePiece(state, 1);
    if (name === 'rotate') rotatePiece(state); if (name === 'reverse') rotatePiece(state, -1);
    if (name === 'down') softDrop(state); if (name === 'drop') { hardDrop(state); held.clear(); }
    if (state.finished) finish();
  }
  function hold(key, name) {
    if (!playing() || held.has(key)) return; action(name);
    if (['left','right','down'].includes(name)) held.set(key, {name, wait: name === 'down' ? .065 : .18});
  }
  startButton.addEventListener('click', start, options); restartButton.addEventListener('click', start, options); pauseButton.addEventListener('click', togglePause, options);
  root.querySelector('#workshop-notes').addEventListener('click', () => {
    if (running && !paused) togglePause();
    api.openUtility(`<p class="eyebrow">QUESTIONS BECOME THINGS</p><h2 id="utility-heading">A few experiments.</h2><p><b>Quantum circuits & calibration · HKUST IAS, 2023–24.</b><br>Qiskit circuit models and an auto-calibration routine for SpinQ desktop machines.</p><p><b>MEDocGPT · MIT Hong Kong Innovation Node, 2023.</b><br>A healthcare chatbot and mobile app prototype for early health intervention. An early prototype, not a clinical service.</p><p><b>Crossing Lives.</b><br>An ongoing pixel-world experiment in the workshop. Ask Bob about it.</p><p><a href="https://github.com/bobshenruililin" target="_blank" rel="noopener">Explore Bob’s public projects ↗</a></p>`, 'workshop-dialog');
  }, options);
  const keys = {ArrowLeft:'left', a:'left', ArrowRight:'right', d:'right', ArrowUp:'rotate', w:'rotate', x:'rotate', z:'reverse', ArrowDown:'down', s:'down'};
  document.addEventListener('keydown', e => {
    if (!api.isActive() || !running || e.altKey || e.ctrlKey || e.metaKey) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === 'p' && !e.repeat) { e.preventDefault(); togglePause(); return; }
    if (e.target !== canvas && e.target.closest('button,a,input,textarea,select')) return;
    if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) action('drop'); return; }
    if (keys[key]) { e.preventDefault(); if (!e.repeat) hold(key, keys[key]); }
  }, options);
  document.addEventListener('keyup', e => held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key), options);
  window.addEventListener('blur', () => { release(); if (running && !paused) togglePause(); }, options);
  document.addEventListener('visibilitychange', () => { if (document.hidden && running && !paused) togglePause(); }, options);
  root.querySelectorAll('[data-arcade-action]').forEach(button => {
    button.addEventListener('pointerdown', e => { if (!playing()) return; e.preventDefault(); button.setPointerCapture(e.pointerId); hold(`pointer-${e.pointerId}`, button.dataset.arcadeAction); }, options);
    for (const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type, e => held.delete(`pointer-${e.pointerId}`), options);
    // Keyboard activation and guided-tour clicks; pointer actions already fired on press.
    button.addEventListener('click', e => { if (e.detail === 0) action(button.dataset.arcadeAction); }, options);
  });
  function block(x, y, size, type, ghost = false) {
    if (ghost) { ctx.strokeStyle = '#dec88a'; ctx.lineWidth = 1; ctx.strokeRect(x + 2.5, y + 2.5, size - 5, size - 5); return; }
    ctx.fillStyle = COLORS[type]; ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.fillStyle = '#ffffff35'; ctx.fillRect(x + 2, y + 2, size - 4, 2); ctx.fillStyle = '#091b2b45'; ctx.fillRect(x + 2, y + size - 4, size - 4, 2);
  }
  function text(value, x, y, size = 14, color = '#e8d3a5') { ctx.fillStyle = color; ctx.font = `${size}px Pixelify, monospace`; ctx.fillText(value, x, y); }
  function draw(time) {
    const dt = last ? Math.min((time - last) / 1000, .05) : 0; last = time;
    if (playing()) {
      for (const item of held.values()) { item.wait -= dt; if (item.wait <= 0) { action(item.name); item.wait += item.name === 'down' ? .045 : .07; } }
      stepRound(state, dt); if (state.finished) finish();
      if (state.lines !== announcedLines) { announcement.textContent = `${state.lines - announcedLines} row${state.lines - announcedLines === 1 ? '' : 's'} cleared! ${state.score} points. Level ${state.level}.`; announcedLines = state.lines; }
    }
    const size = 18, bx = 8, by = 20;
    ctx.fillStyle = '#122a35'; ctx.fillRect(0, 0, 280, 400); ctx.fillStyle = '#091f2c'; ctx.fillRect(bx, by, size * BOARD_WIDTH, size * BOARD_HEIGHT);
    ctx.strokeStyle = '#24404a'; ctx.lineWidth = 1; ctx.strokeRect(bx - .5, by - .5, size * BOARD_WIDTH + 1, size * BOARD_HEIGHT + 1);
    for (let y = 0; y < BOARD_HEIGHT; y++) for (let x = 0; x < BOARD_WIDTH; x++) { ctx.fillStyle = '#1d3540'; ctx.fillRect(bx + x * size + size - 1, by + y * size + size - 1, 1, 1); if (state.board[y][x]) block(bx + x * size, by + y * size, size, state.board[y][x]); }
    if (!state.finished) {
      for (const [x,y] of pieceCells(landingPiece(state))) if (y >= 0) block(bx + x * size, by + y * size, size, state.active.type, true);
      for (const [x,y] of pieceCells(state.active)) if (y >= 0) block(bx + x * size, by + y * size, size, state.active.type);
    }
    if (state.clearFlash > 0) { ctx.fillStyle = `rgba(245,221,151,${state.clearFlash * 1.7})`; for (const y of state.clearedRows) ctx.fillRect(bx, by + y * size, size * BOARD_WIDTH, size); }
    text('NEXT', 201, 37, 15);
    for (let i = 0; i < 3; i++) {
      const type = state.queue[i], cells = pieceCells({type, rotation:0, x:0, y:0}), minX = Math.min(...cells.map(c => c[0])), minY = Math.min(...cells.map(c => c[1]));
      for (const [x,y] of cells) block(204 + (x - minX) * 13, 51 + i * 45 + (y - minY) * 13, 13, type);
    }
    text('SCORE', 201, 211, 13); text(String(state.score), 201, 233, 17, '#efcf83'); text('LINES', 201, 271, 13); text(String(state.lines), 201, 293, 17, '#efcf83'); text('LEVEL', 201, 331, 13); text(String(state.level), 201, 353, 17, '#efcf83'); text('make a little room', 15, 394, 12, '#89a39b');
    if (paused && running) { ctx.fillStyle = '#10252eea'; ctx.fillRect(0, 0, 280, 400); ctx.textAlign = 'center'; text('A LITTLE PAUSE', 140, 185, 22); text('Resume below · or press P', 140, 218, 14); ctx.textAlign = 'start'; }
    for (const key of ['score','lines','level']) if (scoreLabels[key].textContent !== String(state[key])) scoreLabels[key].textContent = String(state[key]);
    const diagnostics = {status:running ? paused ? 'paused' : 'running' : state.finished ? 'finished' : 'ready', score:state.score, lines:state.lines, level:state.level, pieces:state.pieces, piece:state.active.type};
    for (const [key,value] of Object.entries(diagnostics)) if (canvas.dataset[key] !== String(value)) canvas.dataset[key] = String(value);
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return () => { controller.abort(); cancelAnimationFrame(raf); release(); };
}
