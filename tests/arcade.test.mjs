import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_HEIGHT, BOARD_WIDTH, PIECE_TYPES, shuffledBag, newRound, stepRound, canPlace, pieceCells, movePiece, rotatePiece, hardDrop, softDrop, lockPiece, clearLines } from '../arcade.mjs';
const emptyBoard = () => Array.from({length:BOARD_HEIGHT}, () => Array(BOARD_WIDTH).fill(null));
test('each seeded bag contains all seven tetrominoes exactly once and is reproducible', () => {
  for (const seed of [0,1,42,4294967295]) { const a=shuffledBag(seed),b=shuffledBag(seed);assert.deepEqual(a,b);assert.deepEqual([...a.pieces].sort(),[...PIECE_TYPES].sort()); }
  assert.notDeepEqual(shuffledBag(42).pieces,shuffledBag(211).pieces);
  const state=newRound(42);assert.deepEqual([state.active.type,...state.queue.slice(0,6)].sort(),[...PIECE_TYPES].sort());
});
test('four rotations restore a piece and rotation kicks away from a wall and floor', () => {
  const state=newRound(1);state.active={type:'T',rotation:0,x:3,y:5};const cells=pieceCells(state.active);
  for(let i=0;i<4;i++)assert.ok(rotatePiece(state));assert.deepEqual(pieceCells(state.active),cells);
  state.active={type:'I',rotation:1,x:-2,y:5};assert.ok(canPlace(state.board,state.active));assert.ok(rotatePiece(state));assert.ok(canPlace(state.board,state.active));
  state.active={type:'T',rotation:0,x:3,y:18};assert.ok(rotatePiece(state));assert.ok(canPlace(state.board,state.active));assert.ok(state.active.y<18);
});
test('collision prevents movement through walls and settled blocks; impossible rotations are rejected', () => {
  const state=newRound(1);state.active={type:'O',rotation:0,x:0,y:5};assert.equal(movePiece(state,-1),false);state.board[5][2]='I';assert.equal(movePiece(state,1),false);
  state.board=Array.from({length:20},()=>Array(10).fill('J'));state.active={type:'T',rotation:0,x:3,y:10};for(const[x,y]of pieceCells(state.active))state.board[y][x]=null;
  const before={...state.active};assert.equal(rotatePiece(state),false);assert.deepEqual(state.active,before);
});
test('hard drop settles four cells, awards distance points, and advances to the previewed piece', () => {
  const state=newRound(5);state.active={type:'O',rotation:0,x:4,y:0};const next=state.queue[0];assert.equal(hardDrop(state),18);
  assert.equal(state.score,36);assert.equal(state.pieces,1);assert.equal(state.active.type,next);assert.equal(state.board.flat().filter(Boolean).length,4);assert.ok(state.board[19][4]);
});
test('full rows clear simultaneously while surviving rows keep their order', () => {
  const board=emptyBoard();board[18].fill('O');board[19].fill('T');board[17][2]='I';const cleared=clearLines(board);
  assert.equal(cleared.count,2);assert.deepEqual(cleared.rows,[18,19]);assert.equal(cleared.board.length,20);assert.equal(cleared.board[19][2],'I');assert.equal(cleared.board[0].some(Boolean),false);
});
test('a four-line clear awards 800 points and crossing ten rows advances the level', () => {
  const state=newRound(1);state.lines=8;for(let y=16;y<20;y++){state.board[y].fill('J');state.board[y][5]=null;}state.active={type:'I',rotation:1,x:3,y:16};
  assert.equal(lockPiece(state),4);assert.equal(state.score,800);assert.equal(state.lines,12);assert.equal(state.level,2);assert.equal(state.board.flat().filter(Boolean).length,0);
});
test('soft dropping scores per cell; ground contact allows a lock delay then settles', () => {
  const state=newRound(1);state.active={type:'O',rotation:0,x:4,y:17};assert.ok(softDrop(state));assert.equal(state.score,1);assert.equal(softDrop(state),false);
  for(let i=0;i<4;i++)stepRound(state,.1);assert.equal(state.pieces,0);stepRound(state,.1);assert.equal(state.pieces,1);
});
test('a blocked spawn or locking above the ceiling ends play and finished states do not change', () => {
  const state=newRound(1);state.board[0][4]='J';state.board[0][5]='J';state.board[1][4]='J';state.board[1][5]='J';state.queue[0]='O';state.active={type:'O',rotation:0,x:0,y:18};lockPiece(state);assert.equal(state.finished,true);
  const before=structuredClone(state);stepRound(state,20);hardDrop(state);movePiece(state,1);rotatePiece(state);assert.deepEqual(state,before);
  const ceiling=newRound(1);ceiling.active={type:'O',rotation:0,x:4,y:-1};lockPiece(ceiling);assert.equal(ceiling.finished,true);
});
test('delayed frames cannot fast-forward the board, and seeded rounds stay deterministic', () => {
  const a=newRound(35),b=newRound(35);stepRound(a,4);stepRound(b,.1);assert.deepEqual(a,b);for(let i=0;i<20;i++){hardDrop(a);hardDrop(b);}assert.deepEqual(a,b);
});
