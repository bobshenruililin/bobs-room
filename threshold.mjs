import { EMAIL, CV } from './stories.mjs';

// The opening letter and the one-minute story.
// Every answer restates a fact already recorded in docs/content-sources.md;
// the questions are an editorial frame. Keep each answer under about 170
// characters so the whole story stays close to a minute.
export const BEATS = [
  {
    id: 'heat', place: 'The research desk', focus: { x: 300, y: 330 },
    question: 'What happens to health when a city gets hotter?',
    answer: 'That’s my research now. As a Laidlaw Scholar at HKU, I study extreme heat and cardiovascular admissions among older adults in Hong Kong.',
  },
  {
    id: 'weather', place: 'The little globe', focus: { x: 260, y: 500 },
    question: 'Can a model learn to read the sky?',
    answer: 'At the Hong Kong Observatory and PolyU, I tested DeepMind’s GraphCast for local forecasting, and presented an atmospheric-river method at AGU.',
  },
  {
    id: 'fieldwork', place: 'The travel trunk', focus: { x: 300, y: 660 },
    question: 'What do you learn by asking almost everyone?',
    answer: 'In Macha, Gansu, I co-led a study of village water scarcity: more than fifty interviews, nearly every household. Good questions start with listening.',
  },
  {
    id: 'poetry', place: 'The poetry shelf', focus: { x: 535, y: 290 },
    question: 'And the questions data can’t hold?',
    answer: 'Those become poems. “Temple of Cement” and “Threads of The Earth’s Song” were recognised at the City Literary Awards and the Hong Kong Young Writers Awards.',
  },
  {
    id: 'workshop', place: 'The little arcade', focus: { x: 1270, y: 610 },
    question: 'What if I just build it?',
    answer: 'Agency is my superpower. So far: a calibration routine for desktop quantum machines, a healthcare chatbot prototype, and a pixel world called Crossing Lives.',
  },
  {
    id: 'duoji', place: 'Duoji’s nook', focus: { x: 700, y: 440 },
    question: 'And who is this?',
    answer: 'Duoji, my mini black Shiba Inu: small body, lots of power. The window behind him looks out on Shanghai, Singapore and Hong Kong. I call all three home.',
  },
  {
    id: 'contact', place: 'The green rug', focus: { x: 814, y: 610 }, final: true,
    question: 'What’s your question?',
    answer: 'I’m always up for building something with curious people. Bring an idea, or just say hello.',
  },
];

export const beatDuration = beat => 2400 + (beat.question.length + beat.answer.length) * 36;

export function mountThreshold(api) {
  const $ = selector => document.querySelector(selector);
  const frame = $('.game-frame');
  const film = document.createElement('section');
  film.className = 'film'; film.id = 'film'; film.hidden = true; film.tabIndex = -1;
  film.setAttribute('aria-label', 'The one-minute story');
  film.innerHTML = `
    <button class="film-skip" id="film-skip">Skip to the room <span aria-hidden="true">×</span></button>
    <div class="film-panel">
      <div class="film-inner">
        <div class="film-progress" aria-hidden="true">${BEATS.map(() => '<span><i></i></span>').join('')}</div>
        <div class="film-text" id="film-text" aria-live="polite">
          <p class="film-place"></p>
          <h2 class="film-question"></h2>
          <p class="film-answer"></p>
        </div>
        <div class="film-controls">
          <button id="film-prev" aria-label="Previous question">←</button>
          <button id="film-pause" aria-pressed="false">Pause</button>
          <button id="film-next" aria-label="Next question">→</button>
          <button id="film-open" class="film-open"></button>
        </div>
        <div class="film-finale" hidden>
          <a class="film-cta" href="mailto:${EMAIL}?subject=A%20question%20for%20Bob">Say hello <span aria-hidden="true">↗</span></a>
          <a class="film-link" href="${CV}" target="_blank" rel="noopener">Read my CV</a>
          <button class="film-link" id="film-wander">Wander the room <span aria-hidden="true">→</span></button>
          <button class="film-link film-again" id="film-again">Watch again</button>
        </div>
      </div>
    </div>`;
  frame.append(film);

  const bars = [...film.querySelectorAll('.film-progress i')];
  const text = film.querySelector('.film-text');
  let active = false, index = 0, elapsed = 0, paused = false, last = 0, raf = 0, swapTimer = 0;

  const mobile = () => matchMedia('(max-width: 760px)').matches;
  function thresholdFocus() {
    // On a phone the room is wider than the screen: open on Duoji and the window.
    if (!api.isEntered() && !active) api.setFocus({ x: 720, y: 395, z: 1, zm: 1, ax: .5, ay: .27 });
  }

  function paint() {
    const beat = BEATS[index];
    film.querySelector('.film-place').textContent = `${index + 1} / ${BEATS.length} · ${beat.place}`;
    film.querySelector('.film-question').textContent = beat.question;
    film.querySelector('.film-answer').textContent = beat.answer;
    film.querySelector('.film-finale').hidden = !beat.final;
    film.querySelector('.film-controls').hidden = !!beat.final;
    const open = $('#film-open');
    open.hidden = !!beat.final; open.innerHTML = 'Step inside <span aria-hidden="true">↗</span>'; open.setAttribute('aria-label', `Leave the story and open ${beat.place.toLowerCase()}`);
    $('#film-prev').disabled = index === 0;
    $('#film-next').hidden = !!beat.final; $('#film-pause').hidden = !!beat.final;
    bars.forEach((bar, i) => { bar.style.transform = `scaleX(${i < index ? 1 : 0})`; });
    document.querySelectorAll('.hotspot.film-focus').forEach(b => b.classList.remove('film-focus'));
    document.querySelector(`.hotspot[data-story="${beat.id}"]`)?.classList.add('film-focus');
    document.body.classList.toggle('film-final', !!beat.final);
    api.setFocus({ ...beat.focus, z: 1.55, zm: 1.3, ax: .5, ay: mobile() ? (beat.final ? .17 : .27) : .36 });
  }

  function show(next) {
    index = Math.max(0, Math.min(BEATS.length - 1, next)); elapsed = 0;
    clearTimeout(swapTimer);
    if (api.isStill()) { paint(); return; }
    text.classList.add('leaving');
    swapTimer = setTimeout(() => { paint(); text.classList.remove('leaving'); }, 220);
  }

  function setPaused(value) {
    paused = value;
    $('#film-pause').textContent = paused ? 'Play' : 'Pause';
    $('#film-pause').setAttribute('aria-pressed', String(paused));
  }

  function tick(time) {
    if (!active) return;
    const dt = Math.min(time - (last || time), 100); last = time;
    const beat = BEATS[index];
    // With reduced motion nothing advances on its own; the visitor sets the pace.
    if (!paused && !beat.final && !api.isStill() && !document.hidden) {
      elapsed += dt;
      const duration = beatDuration(beat);
      bars[index].style.transform = `scaleX(${Math.min(1, elapsed / duration).toFixed(4)})`;
      if (elapsed >= duration) show(index + 1);
    } else if (beat.final) bars[index].style.transform = 'scaleX(1)';
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (active) return;
    api.prepare();
    active = true; document.body.classList.add('story-mode');
    api.enterRoom(false);
    film.hidden = false; setPaused(false); index = 0; elapsed = 0; last = 0;
    paint();
    film.focus({ preventScroll: true });
    raf = requestAnimationFrame(tick);
  }

  function end() {
    if (!active) return;
    active = false; cancelAnimationFrame(raf); clearTimeout(swapTimer);
    document.body.classList.remove('story-mode', 'film-final');
    document.querySelectorAll('.hotspot.film-focus').forEach(b => b.classList.remove('film-focus'));
    film.hidden = true; api.setFocus(null);
  }

  function wander() {
    end(); api.enterRoom(); api.bubble('Every glow is one of those questions. Pick any.', 6000);
  }

  $('#story-start').addEventListener('click', start);
  $('#story-replay')?.addEventListener('click', start);
  $('#film-skip').addEventListener('click', wander);
  $('#film-wander').addEventListener('click', wander);
  $('#film-again').addEventListener('click', () => show(0));
  $('#film-prev').addEventListener('click', () => show(index - 1));
  $('#film-next').addEventListener('click', () => show(index + 1));
  $('#film-pause').addEventListener('click', () => setPaused(!paused));
  $('#film-open').addEventListener('click', () => {
    const id = BEATS[index].id; end(); api.goToStory(id);
  });
  // A tap on the room itself moves the story on, like turning a page.
  film.addEventListener('click', event => {
    if (event.target.closest('button, a')) return;
    if (!BEATS[index].final) show(index + 1);
  });
  window.addEventListener('keydown', event => {
    if (!active || event.metaKey || event.ctrlKey || event.altKey) return;
    const onControl = event.target.closest?.('button, a');
    if (event.key === 'Escape') { event.preventDefault(); wander(); }
    else if (event.key === 'ArrowRight' || (!onControl && (event.key === ' ' || event.key === 'Enter'))) {
      event.preventDefault(); if (!BEATS[index].final) show(index + 1);
    } else if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });
  matchMedia('(max-width: 760px)').addEventListener('change', () => { if (active) paint(); else thresholdFocus(); });

  thresholdFocus();
  return { start, end, active: () => active };
}
