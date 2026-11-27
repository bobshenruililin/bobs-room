import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { WORKS } from '../lab/doorway/works.mjs';

const media = new URL('../lab/doorway/media/', import.meta.url);
const json = (name) => JSON.parse(readFileSync(new URL(name, media), 'utf8'));

test('the gate opening lies inside the photograph and contains the entering anchor', () => {
  const door = json('door.json');
  const [x0, y0, x1, y1] = door.opening;
  assert.ok(0 < x0 && x0 < x1 && x1 < 1 && 0 < y0 && y0 < y1 && y1 < 1);
  const [ax, ay] = door.anchor;
  assert.ok(x0 < ax && ax < x1 && y0 < ay && ay < y1);
  assert.ok(existsSync(new URL('doorway-fg.webp', media)) && existsSync(new URL('view-sea.webp', media)));
});

test('every work has a door view, frames for desktop and phone, and a destination', () => {
  const ids = new Set();
  for (const w of WORKS) {
    assert.ok(!ids.has(w.id), `duplicate ${w.id}`); ids.add(w.id);
    assert.ok(w.title && w.line && w.credit && w.href, w.id);
    for (const name of [w.door, ...w.frames.d, ...w.frames.p]) {
      if (name.startsWith('@')) continue;
      assert.ok(existsSync(new URL(`${name}.webp`, media)), `${w.id}: missing ${name}.webp`);
    }
  }
});

test('a Higgsfield slot marked ready has its file, and every work has G and E slots', () => {
  const motion = json('motion.json');
  for (const w of WORKS) assert.ok(motion.G[w.id] && motion.E[w.id], `no slots for ${w.id}`);
  const root = new URL('../lab/doorway/', import.meta.url);
  for (const group of ['L', 'G', 'E']) {
    for (const [id, slot] of Object.entries(motion[group])) {
      if (!slot.ready) continue;
      for (const src of [slot.src, slot.wide, slot.tall].filter(Boolean)) assert.ok(existsSync(new URL(src, root)), `${group}.${id} is ready but ${src} is missing`);
    }
  }
});

test('the heat strip covers 2013–2023 with a value for every day', () => {
  const { years } = json('hko-maxtemp-2013-2023.json');
  assert.deepEqual(Object.keys(years), ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023']);
  for (const [y, days] of Object.entries(years)) {
    assert.equal(days.length, +y % 4 === 0 ? 366 : 365, y);
    assert.ok(days.every((t) => typeof t === 'number'), y);
  }
});
