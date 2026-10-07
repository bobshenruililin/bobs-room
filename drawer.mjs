const FOLDERS = [
  {
    id: 'question',
    label: 'QUESTION',
    title: 'When a city gets hotter.',
    copy: 'I’m studying how extreme heat relates to cardiovascular hospital admissions among older adults in Hong Kong.',
    meta: 'Laidlaw research · Hong Kong',
  },
  {
    id: 'data',
    label: 'DATA',
    title: 'Across the seasons.',
    copy: 'The research uses Hospital Authority data from hot and cold seasons, supervised by Professor David Bishai at HKU’s School of Public Health.',
    meta: 'Hospital Authority data · HKU',
  },
  {
    id: 'purpose',
    label: 'WHY',
    title: 'Preparing for heat.',
    copy: 'The research asks how evidence can inform hospital preparedness and cross-boundary heat-health surveillance. The work is still in progress.',
    meta: 'Research in progress · Laidlaw Scholar, 2026',
  },
];

const artPath = (format, open) => `./assets/art/drawer-${format}-${open ? 'open' : 'closed'}.webp`;

export function mountDrawer(root, story, api) {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  let open = false;
  let selected = 0;

  root.innerHTML = `
    <div class="research-drawer" data-open="false">
      <h2 id="story-heading" class="sr-only">Research desk</h2>
      <picture class="research-drawer-art">
        <source media="(max-width: 760px)" srcset="${artPath('phone', false)}">
        <img src="${artPath('scene', false)}" width="1536" height="1024" alt="A pixel research desk with a closed wooden drawer and a note waiting to be read.">
      </picture>
      <button type="button" id="drawer-handle" class="research-drawer-handle" aria-expanded="false" aria-controls="drawer-folders" aria-label="Pull the drawer open">
        <span>PULL THE HANDLE ↓</span>
      </button>
      <div id="drawer-folders" class="research-drawer-folders" role="group" aria-label="Research folders" hidden>
        ${FOLDERS.map(folder => `<button type="button" class="research-folder" data-folder="${folder.id}" aria-pressed="false" aria-controls="drawer-note" aria-label="Read the ${folder.label === 'WHY' ? 'purpose' : folder.id} folder"><span>${folder.label}</span></button>`).join('')}
      </div>
      <button type="button" id="drawer-brick" class="research-drawer-brick" aria-label="Inspect the colourful toy brick" hidden></button>
      <article id="drawer-note" class="research-drawer-paper" aria-live="polite" aria-atomic="true">
        <span class="research-note-label">Heat &amp; health</span>
        <h3 class="research-note-title">A drawer full of questions.</h3>
        <p class="research-note-copy">Pull the brass handle, then choose a folder.</p>
        <small class="research-note-meta">Laidlaw research · HKU</small>
        <button type="button" class="research-paper-open" aria-controls="drawer-folders">Open the drawer →</button>
        <span class="research-note-counter" hidden>01 / 03</span>
        <button type="button" class="research-paper-next" aria-controls="drawer-note" hidden>Next folder →</button>
      </article>
    </div>`;

  const scene = root.querySelector('.research-drawer');
  const source = scene.querySelector('source');
  const image = scene.querySelector('img');
  const handle = root.querySelector('#drawer-handle');
  const folders = root.querySelector('#drawer-folders');
  const folderButtons = [...folders.querySelectorAll('[data-folder]')];
  const brick = root.querySelector('#drawer-brick');
  const label = root.querySelector('.research-note-label');
  const title = root.querySelector('.research-note-title');
  const copy = root.querySelector('.research-note-copy');
  const meta = root.querySelector('.research-note-meta');
  const openButton = root.querySelector('.research-paper-open');
  const counter = root.querySelector('.research-note-counter');
  const nextButton = root.querySelector('.research-paper-next');

  function renderNote() {
    const folder = FOLDERS[selected];
    root.dataset.folder = folder.id;
    folderButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(open && button.dataset.folder === folder.id));
    });
    label.textContent = open ? `Heat & health · ${folder.label}` : 'Heat & health';
    title.textContent = open ? folder.title : 'A drawer full of questions.';
    copy.textContent = open ? folder.copy : 'Pull the brass handle, then choose a folder.';
    meta.textContent = open ? folder.meta : 'Laidlaw research · HKU';
    openButton.hidden = open;
    counter.hidden = !open;
    nextButton.hidden = !open;
    counter.textContent = `${String(selected + 1).padStart(2, '0')} / 03`;
    nextButton.setAttribute('aria-label', `Next folder: ${FOLDERS[(selected + 1) % FOLDERS.length].label}`);
  }

  function setOpen(value) {
    if (open === value) return;
    const focused = root.ownerDocument.activeElement;
    const focusWillHide = value
      ? focused === openButton
      : folders.contains(focused) || focused === brick || focused === nextButton;
    open = value;
    if (open) selected = 0;
    scene.dataset.open = String(open);
    root.dataset.drawer = open ? 'open' : 'closed';
    source.srcset = artPath('phone', open);
    image.src = artPath('scene', open);
    image.alt = open
      ? 'An open pixel research drawer containing three folders and a colourful toy brick, beside a research note.'
      : 'A pixel research desk with a closed wooden drawer and a note waiting to be read.';
    folders.hidden = !open;
    brick.hidden = !open;
    handle.setAttribute('aria-expanded', String(open));
    handle.setAttribute('aria-label', open ? 'Push the drawer closed' : 'Pull the drawer open');
    handle.querySelector('span').textContent = open ? 'PUSH TO CLOSE ↑' : 'PULL THE HANDLE ↓';
    renderNote();
    if (focusWillHide) {
      (open ? folderButtons[0] : handle).focus({ preventScroll: true });
    }
  }

  handle.addEventListener('click', () => setOpen(!open), options);
  openButton.addEventListener('click', () => setOpen(true), options);
  folderButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (!open) return;
      selected = index;
      renderNote();
    }, options);
  });
  nextButton.addEventListener('click', () => {
    if (!open) return;
    selected = (selected + 1) % FOLDERS.length;
    renderNote();
  }, options);
  brick.addEventListener('click', () => {
    if (!open) return;
    if (typeof api.openTV === 'function') api.openTV(1);
    else api.openStory('duoji');
  }, options);

  root.dataset.drawer = 'closed';
  renderNote();

  // Warm both responsive image pairs before the first handle interaction.
  const preloads = [];
  if (typeof Image !== 'undefined') {
    for (const format of ['scene', 'phone']) {
      for (const state of [false, true]) {
        const preload = new Image();
        preload.src = artPath(format, state);
        preloads.push(preload);
      }
    }
  }

  return () => {
    controller.abort();
    preloads.length = 0;
  };
}
