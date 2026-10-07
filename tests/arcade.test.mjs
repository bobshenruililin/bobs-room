import test from 'node:test';
import assert from 'node:assert/strict';
import { newRound, stepRound } from '../arcade.mjs';

test('fresh seeds make different falling patterns, the same seed is replayable',()=>{
  const a=newRound(42),b=newRound(42),c=newRound(2137);
  for(let i=0;i<20;i++){stepRound(a,.05);stepRound(b,.05);stepRound(c,.05);}
  assert.deepEqual(a,b);
  assert.notDeepEqual(a.objects,c.objects);
});
test('a caught lantern adds points, a caught rain cloud costs a heart, missed lanterns cost nothing',()=>{
  const state=newRound(5);state.spawn=10;
  state.objects=[{x:160,y:182,speed:60,cloud:false},{x:50,y:229,speed:60,cloud:false}];
  stepRound(state,.05);assert.equal(state.score,10);assert.equal(state.caught,1);assert.equal(state.lives,3);assert.equal(state.objects.length,0);
  state.objects=[{x:160,y:182,speed:60,cloud:true}];stepRound(state,.05);assert.equal(state.lives,2);assert.equal(state.score,10);
});
test('a round ends after thirty seconds or three cloud collisions and stays finished',()=>{
  const state=newRound(1);state.elapsed=29.99;stepRound(state,.05);assert.ok(state.finished);
  const before=structuredClone(state);stepRound(state,.05,1);assert.deepEqual(state,before);
  const lost=newRound(1);lost.spawn=10;lost.objects=Array.from({length:3},()=>({x:160,y:182,speed:60,cloud:true}));stepRound(lost,.05);
  assert.ok(lost.finished);assert.equal(lost.lives,0);
});
test('held directions stay inside the cabinet and a delayed frame cannot skip a falling collision',()=>{
  const left=newRound(5),right=newRound(5);left.spawn=100;right.spawn=100;
  for(let i=0;i<300;i++){stepRound(left,.05,-1);stepRound(right,.05,1);}
  assert.equal(left.x,19);assert.equal(right.x,301);
  const lag=newRound(1);lag.spawn=10;lag.objects=[{x:160,y:182,speed:100,cloud:false}];stepRound(lag,4);
  assert.equal(lag.score,10);assert.ok(lag.elapsed<=.06);
});
