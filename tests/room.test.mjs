import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { WORLD, OBSTACLES, isWalkable, move, findPath, safeMemories } from '../engine.mjs';
import { STORIES, PHOTOS } from '../stories.mjs';

test('every story is reachable from the entrance and every other story', () => {
  const starts = [{ x:660, y:803 }, ...STORIES.map(s => s.approach)];
  for (const from of starts) for (const story of STORIES) {
    assert.ok(isWalkable(story.approach.x, story.approach.y), `${story.id} has a safe place to stand`);
    const path = findPath(from, story.approach);
    assert.ok(path.length, `${story.id} is reachable from ${JSON.stringify(from)}`);
    assert.ok(Math.hypot(path.at(-1).x - story.approach.x, path.at(-1).y - story.approach.y) < 24);
    for (let i = 0; i < path.length; i++) {
      assert.ok(isWalkable(path[i].x, path[i].y), `${story.id} path stays on the floor`);
      if (i > 0) for (let j = 0; j <= 8; j++) {
        const t = j / 8, prev = path[i - 1], next = path[i];
        assert.ok(isWalkable(prev.x + (next.x-prev.x)*t, prev.y + (next.y-prev.y)*t), `${story.id}: segment cannot cut through furniture`);
      }
    }
  }
});

test('keyboard movement cannot leave the floor or pass through furniture', () => {
  for (const [dx,dy] of [[10,0],[-10,0],[0,10],[0,-10],[7,7],[-7,-7],[7,-7],[-7,7]]) {
    let player = { x:660, y:803 };
    for (let i=0;i<500;i++) { player = move(player,dx,dy); assert.ok(isWalkable(player.x,player.y)); }
  }
  for (const obstacle of OBSTACLES) assert.equal(isWalkable(obstacle.x + obstacle.w/2, obstacle.y + obstacle.h/2), false);
});

test('a click on a wall or piece of furniture resolves to a reachable floor point', () => {
  const from = { x:660, y:803 };
  for (const goal of [{x:0,y:0},{x:WORLD.width,y:WORLD.height},...STORIES.map(s => s.marker)]) {
    const path = findPath(from,goal);
    assert.ok(path.length);
    assert.ok(isWalkable(path.at(-1).x,path.at(-1).y));
  }
  assert.deepEqual(findPath(from,{x:NaN,y:0}),[]);
});

test('damaged, duplicated, or obsolete discoveries cannot break the journal', () => {
  const ids = STORIES.map(s => s.id);
  assert.deepEqual(safeMemories(null,ids),[]);
  assert.deepEqual(safeMemories('hello',ids),[]);
  assert.deepEqual(safeMemories(['hello','hello','missing',{},'photos'],ids),['hello','photos']);
});

test('all photographs, fonts, generated assets, map data and CV are served locally', () => {
  const art = [
    'room-v2','room-v3','room-v4','book','rug','shiba','shiba-closeup','shanghai','singapore','hong-kong',
    'sofa-nook','sofa-closed','sofa-phone-open','sofa-phone-closed',
    'drawer-scene-open','drawer-scene-closed','drawer-phone-open','drawer-phone-closed',
    'duoji-nook','duoji-phone','fern-nook','fern-phone','globe-scene','globe-phone',
    'trunk-scene','trunk-phone','note-paper','arcade-cabinet','photo-album',
    'tv-set','tv-phone','tv-hobbies','tv-detours','bob-emblem',
    'arcade-blocks','go-floor','go-table',
  ];
  const fonts = ['dm-sans.ttf','fraunces.ttf','fraunces-italic.ttf','silkscreen.ttf','pixelify-sans.ttf'];
  const fontNotices = ['DM-Sans-OFL.txt','Fraunces-OFL.txt','Silkscreen-OFL.txt','Pixelify-Sans-OFL.txt'];
  const paths = [
    'assets/Shen-Ruililin-CV.pdf','assets/art/visitors.png','assets/art/frames.json',
    'assets/maps/world-pixels.json','assets/maps/provenance.json',
    'assets/art/arcade-blocks-prompt.json','assets/art/go-prompts.json','assets/art/room-v3-prompt.json','assets/art/room-v4-prompt.json',
    ...art.flatMap(name => ['png','webp'].map(extension => `assets/art/${name}.${extension}`)),
    ...[...fonts,...fontNotices].map(name => `assets/fonts/${name}`),
    ...PHOTOS.map(photo => `assets/photos/${photo.src}.webp`),
  ];
  for (const file of paths) assert.ok(existsSync(new URL('../'+file,import.meta.url)),file);
  const html = readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(!/src="https?:\/\//.test(html),'no externally hosted scripts or essential media');
  assert.ok(html.includes('id="room-index" open'),'the biography remains accessible without JavaScript');
});

test('each story has a unique index, an in-room marker, and a valid next story', () => {
  assert.equal(new Set(STORIES.map(s=>s.id)).size,STORIES.length);
  const html = readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const index = html.match(/<div class="index-list">([\s\S]*?)<\/div>/)?.[1] || '';
  const indexedIds = [...index.matchAll(/data-story="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(indexedIds.sort(),STORIES.map(s=>s.id).sort(),'the static room index includes each story exactly once');
  for (const s of STORIES) {
    assert.ok(s.paragraphs.length && s.heading && s.intro);
    assert.ok(s.marker.x > 0 && s.marker.x < WORLD.width && s.marker.y > 0 && s.marker.y < WORLD.height);
    if (s.image) assert.ok(PHOTOS.some(p=>p.src===s.image));
  }
});
