/** A small local 9×9 board: alternating play, liberties, captures and simple ko. */
export function newGo(size=9) {
  return { size, board:Array(size*size).fill(0), turn:1, captures:{1:0,2:0}, passes:0, ended:false, ko:null, last:null, move:0, history:[] };
}
const positionKey = board => board.join('');
const snapshot = ({history,...state}) => ({...state,board:[...state.board],captures:{...state.captures}});
export function neighbours(point,size) {
  const x=point%size,y=Math.floor(point/size), out=[];
  if(x)out.push(point-1);if(x<size-1)out.push(point+1);if(y)out.push(point-size);if(y<size-1)out.push(point+size);
  return out;
}
export function groupAt(board,point,size) {
  const color=board[point],stones=new Set(),liberties=new Set(),pending=[point];
  if(!color)return {stones,liberties};
  while(pending.length){const p=pending.pop();if(stones.has(p))continue;stones.add(p);
    for(const next of neighbours(p,size)){if(!board[next])liberties.add(next);else if(board[next]===color&&!stones.has(next))pending.push(next);}
  }
  return {stones,liberties};
}
export function playGo(state,point) {
  if(state.ended)return {state,error:'This quiet round has ended. Undo or clear the board to begin again.'};
  if(!Number.isInteger(point)||point<0||point>=state.board.length)return {state,error:'Choose an intersection on the board.'};
  if(state.board[point])return {state,error:'There is already a stone here. Try an empty intersection.'};
  const board=[...state.board];board[point]=state.turn;
  const opponent=3-state.turn;let captured=0;
  for(const next of neighbours(point,state.size)){
    if(board[next]!==opponent)continue;
    const group=groupAt(board,next,state.size);
    if(!group.liberties.size){for(const p of group.stones)board[p]=0;captured+=group.stones.size;}
  }
  if(!groupAt(board,point,state.size).liberties.size)return {state,error:'That stone would have no breathing room. Leave at least one liberty.'};
  if(positionKey(board)===state.ko)return {state,error:'Ko: play somewhere else before recapturing here.'};
  return {state:{...snapshot(state),board,turn:opponent,captures:{...state.captures,[state.turn]:state.captures[state.turn]+captured},passes:0,ko:positionKey(state.board),last:point,move:state.move+1,history:[...state.history,snapshot(state)]},captured};
}
export function passGo(state) {
  if(state.ended)return state;
  return {...snapshot(state),turn:3-state.turn,passes:state.passes+1,ended:state.passes+1>=2,ko:null,last:null,move:state.move+1,history:[...state.history,snapshot(state)]};
}
export function undoGo(state) {
  if(!state.history.length)return state;
  return {...snapshot(state.history.at(-1)),history:state.history.slice(0,-1)};
}
const columns='ABCDEFGHJ';
const coordinate=(point,size)=>`${columns[point%size]}${size-Math.floor(point/size)}`;

export function mountGo(root,api={}) {
  root.innerHTML=`<section class="go-space"><div class="go-heading"><p class="eyebrow">A QUIET CORNER OF THE ROOM</p><h2 id="utility-heading">A little game of Go.</h2><p>Go is one of my favourite games.<br>Leave a stone, take a breath.</p></div><div class="go-table"><img class="go-table-art" src="./assets/art/go-table.webp" alt="A warm wooden Go board, a bowl of black stones and a bowl of white stones, illustrated in chunky pixels."><div class="go-turn" id="go-turn"></div><div class="go-grid" role="grid" aria-label="Nine by nine Go board" aria-describedby="go-instructions" aria-rowcount="9" aria-colcount="9">${Array.from({length:9},(_,y)=>`<div class="go-row" role="row">${Array.from({length:9},(_,x)=>`<button class="go-point" type="button" role="gridcell" data-point="${y*9+x}" tabindex="${x===4&&y===4?'0':'-1'}" aria-label="${coordinate(y*9+x,9)}, empty"><span class="go-stone" aria-hidden="true"></span></button>`).join('')}</div>`).join('')}</div><div class="go-score" aria-label="Stones captured"><span>BLACK <b id="go-black">0</b></span><span id="go-move">MOVE 0</span><span>WHITE <b id="go-white">0</b></span></div></div><div class="go-paper"><p id="go-status" role="status">Black begins. Take turns, or explore both colours.</p><div class="go-actions"><button id="go-pass">Pass</button><button id="go-undo" disabled>Undo</button><button id="go-reset">Clear</button><button id="go-help" aria-expanded="false" aria-controls="go-rules">How?</button></div><div class="go-help" id="go-rules" hidden><p class="go-instructions" id="go-instructions">A shared 9×9 practice board. Surround stones to capture them. Two passes finish the round; agree territory together.</p><p>Stones need an empty neighbour, called a liberty. Capture a group by surrounding every liberty. You can’t immediately recreate the previous board position (ko). Use the arrow keys to explore and Enter or Space to place a stone.</p></div></div></section>`;
  const controller=new AbortController(),options={signal:controller.signal};
  let state=newGo(),selected=40;
  const points=[...root.querySelectorAll('.go-point')];
  function render(message){
    points.forEach((button,i)=>{const stone=state.board[i];button.dataset.stone=String(stone);button.classList.toggle('last-stone',i===state.last);button.setAttribute('aria-label',`${coordinate(i,9)}, ${stone===1?'black stone':stone===2?'white stone':'empty'}${i===state.last?', last move':''}`);button.setAttribute('aria-selected',String(i===selected));button.tabIndex=i===selected?0:-1;});
    root.querySelector('#go-turn').innerHTML=state.ended?'A QUIET FINISH':`<span class="go-turn-stone ${state.turn===1?'black':'white'}" aria-hidden="true"></span> ${state.turn===1?'BLACK':'WHITE'} TO PLAY`;
    root.querySelector('#go-black').textContent=state.captures[1];root.querySelector('#go-white').textContent=state.captures[2];root.querySelector('#go-move').textContent=`MOVE ${state.move}`;
    root.querySelector('#go-undo').disabled=!state.history.length;root.querySelector('#go-pass').disabled=state.ended;
    if(message)root.querySelector('#go-status').textContent=message;
    root.dataset.goTurn=String(state.turn);root.dataset.goMoves=String(state.move);root.dataset.goEnded=String(state.ended);
  }
  function place(point){
    if(api.isActive&&!api.isActive())return;
    selected=point;const played=playGo(state,point);
    if(played.error){render(played.error);return;}
    const color=state.turn===1?'Black':'White';state=played.state;
    render(`${color} played ${coordinate(point,9)}.${played.captured?` Captured ${played.captured} stone${played.captured===1?'':'s'}.`:''} ${state.turn===1?'Black':'White'} to play.`);
  }
  points.forEach((button,i)=>{
    button.addEventListener('click',()=>place(i),options);
    button.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
      e.preventDefault();const x=i%9,y=Math.floor(i/9);
      const next=e.key==='ArrowLeft'?y*9+Math.max(0,x-1):e.key==='ArrowRight'?y*9+Math.min(8,x+1):e.key==='ArrowUp'?Math.max(0,y-1)*9+x:e.key==='ArrowDown'?Math.min(8,y+1)*9+x:e.key==='Home'?y*9:y*9+8;
      selected=next;render();points[next].focus({preventScroll:true});
    },options);
  });
  root.querySelector('#go-pass').addEventListener('click',()=>{const color=state.turn===1?'Black':'White';state=passGo(state);render(state.ended?'Two passes. A peaceful finish — agree territory together, or undo and keep exploring.':`${color} passed. ${state.turn===1?'Black':'White'} to play.`);},options);
  root.querySelector('#go-undo').addEventListener('click',()=>{state=undoGo(state);render(`One step back. ${state.turn===1?'Black':'White'} to play.`);},options);
  root.querySelector('#go-reset').addEventListener('click',()=>{state=newGo();selected=40;render('A fresh board. Black begins.');},options);
  root.querySelector('#go-help').addEventListener('click',()=>{const rules=root.querySelector('#go-rules'),button=root.querySelector('#go-help');rules.hidden=!rules.hidden;button.setAttribute('aria-expanded',String(!rules.hidden));button.textContent=rules.hidden?'How?':'Hide';},options);
  render();return ()=>controller.abort();
}
