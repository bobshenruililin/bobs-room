// Coordinates belong to the illustration, not the browser viewport.
export const WORLD = Object.freeze({ width: 1536, height: 1024 });
export const FLOOR = Object.freeze({ left: 176, right: 1395, top: 484, bottom: 832 });
export const OBSTACLES = Object.freeze([
  { x: 104, y: 330, w: 326, h: 221 }, // research desk and chair
  { x: 430, y: 376, w: 142, h: 146 }, // book piles
  { x: 625, y: 365, w: 347, h: 134 }, // window ledge and storage
  { x: 1050, y: 369, w: 326, h: 223 }, // sofa
  { x: 981, y: 407, w: 124, h: 141 }, // tea table
  { x: 103, y: 476, w: 197, h: 127 }, // globe and books
  { x: 105, y: 589, w: 370, h: 248 }, // travel trunk and backpack
  { x: 1120, y: 545, w: 316, h: 290 }, // arcade and camera table
  { x: 848, y: 748, w: 155, h: 128 }, // front fern
]);

export function isWalkable(x, y, margin = 13) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x < FLOOR.left + margin || x > FLOOR.right - margin || y < FLOOR.top + margin || y > FLOOR.bottom - margin) return false;
  return !OBSTACLES.some(o => x > o.x - margin && x < o.x + o.w + margin && y > o.y - margin && y < o.y + o.h + margin);
}

export function move(position, dx, dy) {
  // Separate axes allow a visitor to slide gently along furniture.
  const next = { ...position };
  if (isWalkable(next.x + dx, next.y)) next.x += dx;
  if (isWalkable(next.x, next.y + dy)) next.y += dy;
  return next;
}

const CELL = 16;
const COLS = Math.ceil(WORLD.width / CELL);
const ROWS = Math.ceil(WORLD.height / CELL);
const centre = (c, r) => ({ x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 });
const id = (c, r) => r * COLS + c;

function nearestCell(point) {
  let best, distance = Infinity;
  for (let r = Math.floor(FLOOR.top / CELL); r <= Math.ceil(FLOOR.bottom / CELL); r++) {
    for (let c = Math.floor(FLOOR.left / CELL); c <= Math.ceil(FLOOR.right / CELL); c++) {
      const p = centre(c, r);
      if (!isWalkable(p.x, p.y, 15)) continue;
      const d = (p.x - point.x) ** 2 + (p.y - point.y) ** 2;
      if (d < distance) { best = { c, r }; distance = d; }
    }
  }
  return best;
}

export function findPath(start, goal) {
  if (![start?.x, start?.y, goal?.x, goal?.y].every(Number.isFinite)) return [];
  const a = nearestCell(start), b = nearestCell(goal);
  if (!a || !b) return [];
  const startId = id(a.c, a.r), goalId = id(b.c, b.r);
  const queue = [startId], parents = new Map([[startId, null]]);
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    if (current === goalId) break;
    const c = current % COLS, r = Math.floor(current / COLS);
    for (const [dc, dr] of directions) {
      const nc = c + dc, nr = r + dr, next = id(nc, nr);
      if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || parents.has(next)) continue;
      const p = centre(nc, nr);
      if (!isWalkable(p.x, p.y, 15)) continue;
      parents.set(next, current); queue.push(next);
    }
  }
  if (!parents.has(goalId)) return [];
  const path = [];
  let current = goalId;
  while (current !== null) {
    path.push(centre(current % COLS, Math.floor(current / COLS)));
    current = parents.get(current);
  }
  return path.reverse();
}

export function safeMemories(value, validIds) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(v => typeof v === 'string' && validIds.includes(v)))];
}
