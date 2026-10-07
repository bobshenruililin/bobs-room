// A tour uses the same room paths, object buttons, dialogs, and journal as a visit.
// It never follows a link, changes sound, or publishes anything.
export const TOUR_STOPS = [
  { id:'welcome', title:'Come in. I’ll show you around.', kind:'room', copy:'Agency is my superpower. I’m Bob. Come along for a gentle wander; I’ll open the doors, and you can stop wherever curiosity takes you.' },
  { id:'hello', story:'hello', title:'A cup of tea, to begin.', copy:'First, a place to sit. Three small notes introduce the person behind the room. We’ll read them, then look for something between the cushions.', minimumDuration:32000, actions:[[8000,'click','#sofa-next'],[16000,'click','#sofa-next'],[24000,'click','#lift-cushion']] },
  { id:'television', kind:'tv', title:'Bob, off the clock.', copy:'Twelve channels, from short-lived hobbies to unexpected detours. Each station has something different to tell you. Pause on a favourite, or turn the dial yourself.', minimumDuration:100000, actions:[[8000, "click", "#tv-next"], [16000, "click", "#tv-next"], [24000, "click", "#tv-next"], [32000, "click", "#tv-next"], [40000, "click", "#tv-next"], [48000, "click", "#tv-next"], [56000, "click", "#tv-next"], [64000, "click", "#tv-next"], [72000, "click", "#tv-next"], [80000, "click", "#tv-next"], [88000, "click", "#tv-next"]] },
  { id:'heat', story:'heat', title:'Three parts of one question.', copy:'A research project has more than one part. These folders separate the question, the data, and the purpose. Let’s give each its own moment.', minimumDuration:32000, actions:[[2000,'click','#drawer-handle'],[12000,'click','[data-folder="data"]'],[22000,'click','[data-folder="purpose"]']] },
  { id:'poetry', story:'poetry', title:'A moment with the book.', copy:'The shelf holds two pieces from my writing life. I’ll turn the pages slowly, leaving the titles and their stories to speak for themselves.', minimumDuration:30000, actions:[[10000,'book',2],[20000,'book',4]], mobileActions:[[6000,'book',1],[12000,'book',2],[18000,'book',3],[24000,'book',4],[30000,'book',5]] },
  { id:'weather', story:'weather', title:'A different way to read the sky.', copy:'This globe opens two weather notes. Stay with the first for a moment, then turn toward the second. Each describes a different piece of work.', minimumDuration:26000, actions:[[12000,'click','[data-folio="1"]']] },
  { id:'travel', story:'travel', title:'A little colour from my travels.', copy:'Maps fascinate me. The gold areas mark places I’ve visited, drawn from real geographic boundaries. There is still so much world to discover.' },
  { id:'fieldwork', story:'fieldwork', title:'Open the field notebook.', copy:'The trunk keeps the field notes together. We’ll open the notebook first, then unfold the map. Give the people and place on these pages a moment.', minimumDuration:26000, actions:[[12000,'click','[data-folio="1"]']] },
  { id:'dialogue', story:'dialogue', title:'The view from home.', copy:'One window, three familiar views. Let’s spend a little time at each before moving on. The postcard on the sill waits for the next stop.', minimumDuration:24000, immediate:['click','[data-city="shanghai"]'], actions:[[8000,'click','[data-city="singapore"]'],[16000,'click','[data-city="hong-kong"]']] },
  { id:'postcard', story:'dialogue', walk:false, title:'A postcard from further north.', copy:'A smaller note, from a little further away. This postcard holds one particular encounter. I’ll leave it open long enough for you to read.', immediate:['click','#nordic-postcard'] },
  { id:'photos', story:'photos', title:'Stay with a frame.', copy:'Six photographs, each with its own view. We’ll turn through the album slowly. If one catches your attention, open it and stay a little longer.', minimumDuration:26000, actions:[[4000,'album',1],[8000,'album',2],[12000,'album',3],[16000,'album',4],[20000,'album',5]] },
  { id:'workshop', story:'workshop', title:'Your turn, if you like.', copy:'A quick demonstration before you take the controls. Turn the blocks and complete a row. Touch the game whenever you like; the tour will wait.', minimumDuration:20000, actions:[[2000,'click','#arcade-start'],[4000,'click','[data-arcade-dir="-1"]'],[5000,'click','[data-arcade-dir="-1"]'],[6000,'click','[data-arcade-action="rotate"]'],[7000,'click','[data-arcade-dir="1"]'],[8000,'click','[data-arcade-dir="1"]'],[9000,'click','[data-arcade-dir="1"]'],[10000,'click','[data-arcade-action="drop"]'],[11500,'click','[data-arcade-dir="-1"]'],[14000,'pause-game']] },
  { id:'workshop-notes', story:'workshop', walk:false, title:'On the workbench.', copy:'A few project notes live behind the cabinet. Each describes something different I’ve tried making. We’ll leave the paper open before returning to the room.', immediate:['click','#workshop-notes'] },
  { id:'duoji', story:'duoji', title:'Duoji has the floor.', copy:'Duoji knows the more personal stories. Let’s hear about that name, a little confidence, and the softer company around the room. I’ll let him speak.', minimumDuration:24000, actions:[[6000,'click','[data-dog="confidence"]'],[14000,'click','[data-dog="plushies"]']] },
  { id:'go', story:'go', title:'A quieter kind of game.', copy:'I love Go. This little nine-by-nine board is a place to leave a stone and take a breath. Share it with a friend, or try a position.', actions:[[3000,'click','[data-point="20"]'],[6500,'click','[data-point="60"]']] },
  { id:'wonder', story:'wonder', title:'One last quiet corner.', copy:'Open the lantern and follow three small lights. There’s a quiet moment waiting at the end. We can leave it open for a little while.', minimumDuration:22000, actions:[[2000,'click','#fern-lantern'],[5000,'click','[data-firefly="0"]'],[8000,'click','[data-firefly="1"]'],[11000,'click','[data-firefly="2"]']] },
  { id:'home', kind:'room', title:'Make yourself at home.', copy:'There’s room for your next idea. Stay a little longer, revisit whatever caught your attention, or begin a new conversation at the floor note.' },
];

export function readingDuration(text, lastAction = 0) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(18000, Math.min(30000, words / 3.1 * 1000 + 2500), lastAction + 6000);
}

export function mountTour(api) {
  const hud = document.createElement('section');
  hud.id = 'room-tour'; hud.className = 'room-tour'; hud.hidden = true;
  hud.setAttribute('aria-label','A guided wander through Bob’s room');
  if ('showPopover' in hud) hud.setAttribute('popover','manual');
  hud.innerHTML = `<div class="tour-heading"><span class="tour-kicker">WANDER WITH ME</span><span id="tour-count"></span><button id="tour-exit" aria-label="End the guided wander">×</button></div><div class="tour-narrative" aria-live="polite" aria-atomic="true"><h2 class="tour-title" id="tour-title"></h2><p class="tour-copy" id="tour-copy"></p></div><div class="tour-bottom"><span id="tour-status" role="status"></span><nav class="tour-controls" aria-label="Guided wander controls"><button id="tour-previous" aria-label="Previous tour stop">←</button><button id="tour-pause">Pause</button><button id="tour-next" aria-label="Next tour stop">→</button></nav></div><div class="tour-progress" role="progressbar" aria-label="Guided wander progress" aria-valuemin="0" aria-valuemax="${TOUR_STOPS.length}"><span></span></div>`;
  document.body.append(hud);
  const q = selector => hud.querySelector(selector);
  const controller = new AbortController(), options = { signal:controller.signal };
  const expectedCloses = new Map();
  let active = false, paused = false, index = 0, phase = 'idle', serial = 0;
  let elapsed = 0, lastTick = 0, actionIndex = 0, timer, duration = 0, restartOnResume = false, pausedArcade = false;
  let plannedActions = [];
  const popoverOpen = () => hud.hasAttribute('popover') && hud.matches(':popover-open');

  function dock() {
    if (!active) return;
    const host = api.getDialog() || document.body;
    if (hud.parentElement !== host) {
      const focused = hud.contains(document.activeElement) ? document.activeElement : null;
      if (popoverOpen()) hud.hidePopover();
      host.append(hud);
      if (focused) focused.focus({preventScroll:true});
    }
    hud.hidden = false;
    if (hud.showPopover && !popoverOpen()) hud.showPopover();
    document.documentElement.style.setProperty('--tour-hud-height', `${Math.ceil(hud.getBoundingClientRect().height)}px`);
  }
  function progress() {
    const amount = phase === 'complete' ? TOUR_STOPS.length : index + (phase === 'showing' ? Math.min(1, elapsed / duration) : 0);
    q('.tour-progress span').style.width = `${amount / TOUR_STOPS.length * 100}%`;
    q('.tour-progress').setAttribute('aria-valuenow',String(index + 1));
    q('.tour-progress').setAttribute('aria-valuetext',`Stop ${index+1} of ${TOUR_STOPS.length}: ${TOUR_STOPS[index].title}`);
    hud.dataset.stop = TOUR_STOPS[index].id; hud.dataset.state = phase === 'complete' ? 'complete' : paused ? 'paused' : phase;
  }
  function controls(message) {
    q('#tour-previous').disabled = index === 0;
    q('#tour-next').disabled = index === TOUR_STOPS.length - 1;
    q('#tour-pause').textContent = phase === 'complete' ? 'Walk again' : paused ? 'Resume tour' : 'Pause';
    q('#tour-pause').setAttribute('aria-label',phase === 'complete' ? 'Restart the guided wander' : paused ? 'Resume the guided wander' : 'Pause the guided wander');
    q('#tour-status').textContent = message || (paused ? 'Paused. Take your time.' : phase === 'walking' ? 'A little walk to the next discovery…' : 'Take over any object to pause.');
    progress(); dock();
  }
  function clearTimer() { clearInterval(timer); timer = undefined; }
  function visiblePaperText() {
    const selectors = '.sofa-paper h3, .sofa-paper p, #drawer-note h3, #drawer-note p, .book-leaf h3, .book-leaf p, .book-leaf small, #folio-paper h3, #folio-paper p, .city-plaque p, .postcard h2, .postcard p, .dog-speech h3, .dog-speech p, .tv-caption p, #fern-postcard h3, #fern-postcard p, #utility-content > h2, #utility-content > p';
    return [...(api.getDialog()?.querySelectorAll(selectors) || [])]
      .filter(node=>node.getClientRects().length && !node.closest('[hidden], .sr-only, button, a'))
      .map(node=>node.textContent.trim()).filter(Boolean).join(' ');
  }
  function paperReadingDuration(text) {
    return Math.max(6000,Math.min(14000,text.trim().split(/\s+/).length / 3.1 * 1000 + 1200));
  }
  function click(selector) {
    // The allowlisted plan only operates buttons already offered by the room.
    const button = api.getDialog()?.querySelector(selector);
    if (button?.tagName === 'BUTTON' && !button.disabled) button.click();
  }
  function action([kind, value]) {
    const focused = hud.contains(document.activeElement) ? document.activeElement : null;
    if (kind === 'click') click(value);
    if (kind === 'book') {
      for (let n=0;n<8;n++) {
        const current = Number(document.querySelector('#story-content')?.dataset.page || 1) - 1;
        if (current >= value) break;
        click('#book-next');
      }
    }
    if (kind === 'album') {
      click('#album-next');
      document.querySelectorAll('.tour-photo-current').forEach(b=>b.classList.remove('tour-photo-current'));
      document.querySelector(`.album-photo[data-photo="${value}"]`)?.classList.add('tour-photo-current');
    }
    if (kind === 'pause-game' && document.querySelector('#arcade-canvas')?.dataset.status === 'running') click('#arcade-pause');
    dock();
    if (focused) focused.focus({preventScroll:true});
  }
  function closePanels() {
    if (popoverOpen()) hud.hidePopover();
    document.body.append(hud);
    for (const dialog of api.dialogs) {
      if (dialog.open) expectedCloses.set(dialog,(expectedCloses.get(dialog)||0)+1);
    }
    api.closeDialogs();
    document.querySelectorAll('.tour-photo-current').forEach(b=>b.classList.remove('tour-photo-current'));
  }
  function clock() {
    clearTimer(); lastTick = performance.now();
    timer = setInterval(() => {
      if (!active || paused || phase !== 'showing') return;
      const now = performance.now(); elapsed += Math.min(now-lastTick,1000); lastTick=now;
      while (actionIndex < plannedActions.length && elapsed >= plannedActions[actionIndex][0]) {
        const before = visiblePaperText();
        action(plannedActions[actionIndex].slice(1)); actionIndex++;
        const after = visiblePaperText();
        if (after && before !== after) {
          // Hold each newly revealed note before turning another page.
          const readableUntil = elapsed + paperReadingDuration(after);
          const next = plannedActions[actionIndex];
          if (next && next[0] < readableUntil) {
            const extra = readableUntil-next[0];
            for (let i=actionIndex;i<plannedActions.length;i++) plannedActions[i][0]+=extra;
            duration+=extra;
          }
          duration=Math.max(duration,readableUntil);
        }
      }
      progress();
      if (elapsed >= duration) {
        if (index < TOUR_STOPS.length-1) visit(index+1);
        else { clearTimer(); phase='complete'; controls('Every corner visited. Explore freely, or walk again.'); }
      }
    },200);
  }
  function visit(nextIndex) {
    const turn = ++serial;
    const restoreFocus = hud.contains(document.activeElement);
    clearTimer(); api.stopWalking(); closePanels();
    index=Math.max(0,Math.min(TOUR_STOPS.length-1,nextIndex));
    const stop = TOUR_STOPS[index];
    paused=false; restartOnResume=false; pausedArcade=false; elapsed=0; actionIndex=0;
    plannedActions=(matchMedia('(max-width: 600px)').matches && stop.mobileActions ? stop.mobileActions : stop.actions || []).map(action=>[...action]);
    duration=Math.max(stop.minimumDuration || 0,readingDuration(stop.copy,plannedActions.at(-1)?.[0] || 0));
    phase=stop.story && stop.walk !== false ? 'walking' : 'showing';
    q('#tour-title').textContent=stop.title; q('#tour-copy').textContent=stop.copy;
    q('#tour-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(TOUR_STOPS.length).padStart(2,'0')}`;
    controls();
    function arrived() {
      if (!active || turn !== serial || paused) return;
      phase='showing';
      if (stop.immediate) action(stop.immediate);
      if (stop.id === 'photos') document.querySelector('.album-photo')?.classList.add('tour-photo-current');
      duration=Math.max(duration,readingDuration(`${stop.copy} ${visiblePaperText()}`,plannedActions.at(-1)?.[0] || 0));
      controls(); clock();
      if (restoreFocus) q('#tour-pause').focus({preventScroll:true});
    }
    if (stop.story) {
      if (stop.walk === false) { api.openStory(stop.story); arrived(); }
      else api.goToStory(stop.story,arrived);
    } else if (stop.kind === 'tv') { api.openTV(); arrived(); }
    else arrived();
  }
  function pause(message='Paused. Take your time.', manual=false, keepGame=false) {
    if (!active || phase === 'complete') return;
    if (!paused && phase === 'showing') elapsed+=Math.min(performance.now()-lastTick,1000);
    restartOnResume = restartOnResume || manual || phase === 'walking';
    paused=true; clearTimer(); api.stopWalking();
    if (!keepGame && document.querySelector('#arcade-canvas')?.dataset.status === 'running') { action(['pause-game']); pausedArcade=true; }
    controls(message);
  }
  function resume() {
    if (phase === 'complete') { visit(0); return; }
    if (restartOnResume) { visit(index); return; }
    paused=false;
    if (pausedArcade && document.querySelector('#arcade-canvas')?.dataset.status === 'paused') click('#arcade-pause');
    pausedArcade=false; controls(); clock();
  }
  function start() {
    if (active) { resume(); return; }
    api.prepare(); active=true; document.body.classList.add('touring'); api.startButton.hidden=true;
    visit(0); q('#tour-pause').focus({preventScroll:true});
  }
  function end() {
    if (!active) return;
    active=false; ++serial; clearTimer(); api.stopWalking(); closePanels();
    hud.hidden=true; document.body.classList.remove('touring'); api.startButton.hidden=false;
    api.startButton.focus({preventScroll:true});
  }
  function manual(event) {
    if (!active || !event.isTrusted || hud.contains(event.target) || event.target.closest('#tour-start, #guided-tour')) return;
    if (event.type === 'keydown' && !['Tab','Enter',' ','Escape','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','e','W','A','S','D','E'].includes(event.key)) return;
    const gameControl = event.target.closest('#arcade-canvas, [data-arcade-dir], [data-arcade-action], #arcade-start, #arcade-pause, #arcade-restart');
    pause('Paused while you explore. Resume reopens this stop.',true,Boolean(gameControl));
  }
  api.startButton.addEventListener('click',start,options);
  q('#tour-exit').addEventListener('click',end,options);
  q('#tour-previous').addEventListener('click',()=>visit(index-1),options);
  q('#tour-next').addEventListener('click',()=>visit(index+1),options);
  q('#tour-pause').addEventListener('click',()=>paused || phase === 'complete' ? resume() : pause(),options);
  hud.addEventListener('keydown',event=>{
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) event.stopPropagation();
  },options);
  for (const type of ['pointerdown','keydown','wheel']) document.addEventListener(type,manual,{...options,capture:true,passive:type === 'wheel'});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('Paused while you’re away. Resume whenever you’re ready.');},options);
  window.addEventListener('blur',()=>pause('Paused while you’re away. Resume whenever you’re ready.'),options);
  window.addEventListener('pagehide',()=>pause('Paused while you’re away. Resume whenever you’re ready.'),options);
  window.addEventListener('resize',dock,options);
  for (const dialog of api.dialogs) dialog.addEventListener('close',()=>{
    const expected=expectedCloses.get(dialog)||0;
    if(expected) { expectedCloses.set(dialog,expected-1); dock(); return; }
    if(active) { pause('Discovery closed. Resume reopens this stop.',true); dock(); }
  },options);
  return { start, end, dialogChanged:dock, active:()=>active, destroy:()=>{end();controller.abort();hud.remove();} };
}
