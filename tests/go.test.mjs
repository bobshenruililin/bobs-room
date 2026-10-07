import test from 'node:test';
import assert from 'node:assert/strict';
import {newGo,playGo,passGo,undoGo,groupAt} from '../go.mjs';

function position(rows,turn=1){const state=newGo(rows.length);state.board=rows.join('').split('').map(Number);state.turn=turn;return state;}

test('Go places alternating stones, rejects occupied points, and preserves old positions',()=>{
 const original=newGo();const first=playGo(original,40).state;
 assert.equal(first.board[40],1);assert.equal(first.turn,2);assert.equal(original.board[40],0);
 assert.match(playGo(first,40).error,/already/);assert.equal(first.move,1);
 const next=playGo(first,41).state;assert.equal(next.board[41],2);assert.equal(next.turn,1);
 assert.deepEqual(undoGo(next).board,first.board);assert.equal(undoGo(next).turn,2);
});

test('Go captures an entire connected group and awards the capturing colour',()=>{
 const state=position(['01000','12210','01100','00000','00000']);
 const next=playGo(state,2).state;
 assert.equal(next.board[6],0);assert.equal(next.board[7],0);assert.equal(next.captures[1],2);
 assert.equal(state.board[6],2);assert.deepEqual(undoGo(next).board,state.board);
});

test('Go rejects suicide, but allows a capture that creates liberties',()=>{
 const surrounded=position(['010','101','010'],2);
 assert.match(playGo(surrounded,4).error,/breathing room/);
 const capturing=position(['012','120','200'],2);
 const result=playGo(capturing,0);assert.equal(result.error,undefined);assert.ok(result.captured>=2);
});

test('Go detects immediate ko and permits recapture after intervening play',()=>{
 const state=position(['01200','12020','01200','00000','00000']);
 const capture=playGo(state,7);assert.equal(capture.error,undefined);assert.equal(capture.captured,1);
 const blocked=playGo(capture.state,6);assert.match(blocked.error,/Ko/);
 let later=playGo(capture.state,24).state;later=playGo(later,23).state;
 const recapture=playGo(later,6);assert.equal(recapture.error,undefined);assert.equal(recapture.captured,1);
 assert.equal(recapture.state.board[7],0);
});

test('two passes end practice and undo restores the previous turn and pass count',()=>{
 const first=passGo(newGo());assert.equal(first.ended,false);assert.equal(first.turn,2);
 const ended=passGo(first);assert.equal(ended.ended,true);assert.match(playGo(ended,0).error,/ended/);
 const restored=undoGo(ended);assert.equal(restored.ended,false);assert.equal(restored.passes,1);assert.equal(restored.turn,2);
 const resumed=playGo(restored,40).state;assert.equal(resumed.passes,0);assert.equal(resumed.ended,false);
});

test('edge groups count unique liberties without wrapping around the board',()=>{
 const state=position(['110','100','000']);const group=groupAt(state.board,0,3);
 assert.equal(group.stones.size,3);assert.deepEqual([...group.liberties].sort((a,b)=>a-b),[2,4,6]);
});
