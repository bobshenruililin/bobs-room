export function randomStep(seed) {
  const next = (seed * 1664525 + 1013904223) >>> 0;
  return { seed: next, value: next / 4294967296 };
}
export function newRound(seed) {
  return { seed: seed >>> 0, x:160, elapsed:0, score:0, lives:3, spawn:0, objects:[], finished:false, caught:0 };
}
export function stepRound(state, dt, direction = 0) {
  if (state.finished) return state;
  dt = Math.max(0, Math.min(dt, .06));
  state.elapsed += dt;
  state.x = Math.max(19, Math.min(301, state.x + direction * 170 * dt));
  state.spawn -= dt;
  if (state.spawn <= 0) {
    let random = randomStep(state.seed); state.seed = random.seed;
    const x = 18 + random.value * 284;
    random = randomStep(state.seed); state.seed = random.seed;
    const cloud = random.value < .23;
    random = randomStep(state.seed); state.seed = random.seed;
    state.objects.push({ x, y:-12, speed:cloud ? 63 + random.value*35 : 60 + random.value*36, cloud });
    state.spawn = Math.max(.24, .6 - state.elapsed*.007);
  }
  state.objects = state.objects.filter(object => {
    object.y += object.speed * dt;
    if (object.y >= 183 && object.y < 201 && Math.abs(object.x-state.x) < (object.cloud ? 22 : 18)) {
      if (object.cloud) state.lives--;
      else { state.score += 10; state.caught++; }
      return false;
    }
    return object.y < 230;
  });
  if (state.elapsed >= 30 || state.lives <= 0) { state.finished = true; state.lives = Math.max(0,state.lives); }
  return state;
}

export function mountArcade(root, api) {
  root.innerHTML = `<div class="arcade-space"><div class="arcade-heading"><p class="eyebrow">BOB’S LITTLE ARCADE</p><h2 id="story-heading">Lantern Catch</h2><p>Catch the light. Dodge the rain. A new little adventure every round.</p></div>
    <div class="arcade-machine"><img class="cabinet-illustration" src="./assets/art/arcade-cabinet.webp" alt="A magical teal pixel arcade cabinet with brass trim, lanterns, books, and a live screen."><div class="arcade-marquee"><span>✦</span> LANTERN CATCH <span>✦</span></div><div class="arcade-scoreboard"><span>LIGHT <b id="arcade-score">000</b></span><span id="arcade-hearts">♥ ♥ ♥</span><span>TIME <b id="arcade-time">30</b></span></div>
    <div class="arcade-screen"><canvas id="arcade-canvas" width="320" height="220" tabindex="0" aria-label="Lantern Catch. Move left or right with arrows or A and D. Catch golden lanterns and avoid grey rain clouds."></canvas><div class="arcade-overlay" id="arcade-overlay"><span class="arcade-moon">☾</span><h3 id="arcade-message">A pocketful of light.</h3><p id="arcade-message-copy">30 seconds. Three hearts. Follow the lanterns.</p><button id="arcade-start">Start a round →</button></div></div>
    <div class="arcade-controls"><button data-arcade-dir="-1" aria-label="Move left">←</button><span><kbd>←</kbd><kbd>→</kbd> / <kbd>A</kbd><kbd>D</kbd><small>or slide a finger across the screen</small></span><button data-arcade-dir="1" aria-label="Move right">→</button></div></div>
    <div class="arcade-footer"><button id="arcade-pause" disabled>Pause</button><span id="arcade-announcement" role="status">Ready when you are.</span><button id="workshop-notes">Peek at Bob’s workshop ↗</button></div></div>`;
  const canvas = root.querySelector('#arcade-canvas'), ctx = canvas.getContext('2d');
  const startButton=root.querySelector('#arcade-start'), overlay=root.querySelector('#arcade-overlay');
  const pauseButton=root.querySelector('#arcade-pause');
  const controller = new AbortController(), options={signal:controller.signal};
  const backdrop=new Image();backdrop.src='./assets/art/hong-kong.webp';
  let state=newRound(1), running=false, paused=false, held=new Set(), last=0, raf, previousScore=-1, previousTime=-1, previousLives=-1;
  ctx.imageSmoothingEnabled=false;
  function start() {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    state=newRound(seed); canvas.dataset.round=String(seed); running=true; paused=false; held.clear();
    overlay.hidden=true; pauseButton.disabled=false; pauseButton.textContent='Pause';
    root.querySelector('#arcade-announcement').textContent='Catch the golden lanterns. Avoid rain clouds.';
    canvas.focus({preventScroll:true}); last=0;
  }
  function finish() {
    running=false; held.clear(); pauseButton.disabled=true; overlay.hidden=false;
    root.querySelector('#arcade-message').textContent=state.lives ? 'You brought the light home.' : 'A little rain. Another little try?';
    root.querySelector('#arcade-message-copy').textContent=`${state.caught} lantern${state.caught===1?'':'s'} · ${state.score} points. Every replay has a fresh pattern.`;
    startButton.textContent='Play a fresh round →';
    root.querySelector('#arcade-announcement').textContent=`Round finished. ${state.score} points from ${state.caught} lanterns.`;
  }
  function togglePause() {
    if (!running) return; paused=!paused; held.clear();
    pauseButton.textContent=paused?'Resume':'Pause';
    root.querySelector('#arcade-announcement').textContent=paused?'Taking a little pause.':'Back to catching the light.';
  }
  startButton.addEventListener('click',start,options); pauseButton.addEventListener('click',togglePause,options);
  root.querySelector('#workshop-notes').addEventListener('click',()=>{
    paused=true; pauseButton.textContent='Resume';
    api.openUtility(`<p class="eyebrow">QUESTIONS BECOME THINGS</p><h2 id="utility-heading">A few experiments.</h2><p><b>Quantum circuits & calibration · HKUST IAS, 2023–24.</b><br>Qiskit circuit models and an auto-calibration routine for SpinQ desktop machines.</p><p><b>MEDocGPT · MIT Hong Kong Innovation Node, 2023.</b><br>A healthcare chatbot and mobile app prototype for early health intervention. An early prototype, not a clinical service.</p><p><b>Crossing Lives.</b><br>An ongoing pixel-world experiment in the workshop. Ask Bob about it.</p><p><a href="https://github.com/bobshenruililin" target="_blank" rel="noopener">Explore Bob’s public projects ↗</a></p>`);
  },options);
  const keyDirection = key => ['ArrowLeft','a','A'].includes(key)?-1:['ArrowRight','d','D'].includes(key)?1:0;
  document.addEventListener('keydown',e=>{
    if (!api.isActive() || !running) return;
    const direction=keyDirection(e.key);
    if(direction){e.preventDefault();held.add(direction);}
    if(e.code==='Space'&&!e.repeat&&e.target===canvas){e.preventDefault();togglePause();}
  },options);
  document.addEventListener('keyup',e=>{held.delete(keyDirection(e.key));},options);
  window.addEventListener('blur',()=>{held.clear();if(running&&!paused)togglePause();},options);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)togglePause();},options);
  root.querySelectorAll('[data-arcade-dir]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held.add(Number(button.dataset.arcadeDir));},options);
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>held.delete(Number(button.dataset.arcadeDir)),options);
    button.addEventListener('click',()=>{if(running)state.x=Math.max(19,Math.min(301,state.x+Number(button.dataset.arcadeDir)*25));},options);
  });
  function slide(e){const box=canvas.getBoundingClientRect();state.x=Math.max(19,Math.min(301,(e.clientX-box.left)/box.width*320));}
  canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);slide(e);},options);
  canvas.addEventListener('pointermove',e=>{if(canvas.hasPointerCapture(e.pointerId))slide(e);},options);
  function draw(time) {
    const dt=last?Math.min((time-last)/1000,.05):0;last=time;
    if(running&&!paused&&api.isActive()){stepRound(state,dt,(held.has(1)?1:0)-(held.has(-1)?1:0));if(state.finished)finish();}
    ctx.fillStyle='#172d39';ctx.fillRect(0,0,320,220);
    ctx.fillStyle='#efda9c';ctx.fillRect(261,19,17,17);ctx.fillStyle='#172d39';ctx.fillRect(256,15,14,17);
    for(let i=0;i<23;i++){ctx.fillStyle=i%3===0?'#dac89b':'#657b85';ctx.fillRect((i*73)%320,(i*29)%116,1,1);}
    for(let i=0;i<17;i++){const x=i*20,h=18+(i*37)%63;ctx.fillStyle=i%2?'#2b4650':'#233b46';ctx.fillRect(x,161-h,18,h);ctx.fillStyle='#bf9a5c';for(let y=167-h;y<153;y+=10)ctx.fillRect(x+4,y,3,3);}
    if(backdrop.complete&&backdrop.naturalWidth){ctx.drawImage(backdrop,0,0,320,194);ctx.fillStyle='#123c3950';ctx.fillRect(0,0,320,194);}
    ctx.fillStyle='#425c48';ctx.fillRect(0,194,320,26);ctx.fillStyle='#718364';ctx.fillRect(0,194,320,3);
    for(const o of state.objects){
      if(o.cloud){ctx.fillStyle='#839daa';ctx.fillRect(o.x-12,o.y,24,9);ctx.fillRect(o.x-7,o.y-6,14,8);ctx.fillStyle='#80b9da';ctx.fillRect(o.x-6,o.y+13,2,4);ctx.fillRect(o.x+4,o.y+15,2,4);}
      else{ctx.fillStyle='#f8d08a';ctx.fillRect(o.x-5,o.y-7,10,14);ctx.fillStyle='#bf6948';ctx.fillRect(o.x-6,o.y-8,12,2);ctx.fillRect(o.x-6,o.y+6,12,2);ctx.fillStyle='#fff0c4';ctx.fillRect(o.x-1,o.y-4,2,7);}
    }
    const atlas=api.atlas(), frame=api.frames()?.[api.visitor()==='rabbit'?4:0];
    if(atlas&&frame){const h=51,w=frame.w/frame.h*h;ctx.drawImage(atlas,frame.x,frame.y,frame.w,frame.h,state.x-w/2,194-h,w,h);}
    if(paused&&running){ctx.fillStyle='#112c35a8';ctx.fillRect(0,0,320,220);ctx.fillStyle='#f1e3bc';ctx.font='12px Silkscreen';ctx.textAlign='center';ctx.fillText('A LITTLE PAUSE',160,103);ctx.textAlign='start';}
    if(state.score!==previousScore){root.querySelector('#arcade-score').textContent=String(state.score).padStart(3,'0');previousScore=state.score;}
    const remaining=Math.max(0,Math.ceil(30-state.elapsed));
    if(remaining!==previousTime){root.querySelector('#arcade-time').textContent=String(remaining).padStart(2,'0');previousTime=remaining;}
    if(state.lives!==previousLives){root.querySelector('#arcade-hearts').textContent=Array.from({length:3},(_,i)=>i<state.lives?'♥':'♡').join(' ');previousLives=state.lives;}
    canvas.dataset.status=running?paused?'paused':'running':state.finished?'finished':'ready';canvas.dataset.score=state.score;canvas.dataset.lives=state.lives;canvas.dataset.remaining=remaining;
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  return ()=>{controller.abort();cancelAnimationFrame(raf);held.clear();};
}
