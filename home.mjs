// All content and links work without JavaScript. These enhancements stay local.
const legacyIndex = () => {
  if (location.hash !== '#room-index') return false;
  location.replace(new URL('./room.html#room-index', location.href));
  return true;
};
legacyIndex();

const nav = document.querySelector('.project-nav');
const panelGroup = document.querySelector('.project-content');
const switches = [...document.querySelectorAll('[data-project]')];
const panels = [...document.querySelectorAll('.work-panel')];
const knownProjects = new Set(switches.map(link => link.dataset.project));
function chooseProject(id, { focus = false, updateURL = false } = {}) {
  if (!knownProjects.has(id)) return;
  switches.forEach(link => {
    const selected = link.dataset.project === id;
    link.setAttribute('aria-selected', String(selected));
    link.tabIndex = selected ? 0 : -1;
    if (selected && focus) link.focus({ preventScroll: true });
  });
  panels.forEach(panel => { panel.hidden = panel.id !== `project-${id}`; });
  if (updateURL) history.replaceState(null, '', `#project-${id}`);
}
if (nav && panelGroup && switches.length && panels.length) {
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Selected projects');
  const mobileLayout = matchMedia('(max-width: 600px)');
  const setOrientation = () => nav.setAttribute('aria-orientation', mobileLayout.matches ? 'horizontal' : 'vertical');
  setOrientation();
  mobileLayout.addEventListener('change', setOrientation);
  switches.forEach((link, index) => {
    link.setAttribute('role', 'tab');
    link.setAttribute('aria-controls', `project-${link.dataset.project}`);
    link.id = `tab-${link.dataset.project}`;
    link.addEventListener('click', event => {
      event.preventDefault();
      chooseProject(link.dataset.project, { updateURL: true });
    });
    link.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % switches.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + switches.length) % switches.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = switches.length - 1;
      if (event.key === ' ') { event.preventDefault(); chooseProject(link.dataset.project, { updateURL: true }); return; }
      if (next !== undefined) {
        event.preventDefault();
        chooseProject(switches[next].dataset.project, { focus: true, updateURL: true });
      }
    });
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${panel.id.slice(8)}`);
    panel.tabIndex = 0;
  });
  panelGroup.dataset.enhanced = 'true';
  const initial = location.hash.startsWith('#project-') ? location.hash.slice(9) : 'asterwind';
  chooseProject(knownProjects.has(initial) ? initial : 'asterwind');
}
window.addEventListener('hashchange', () => {
  if (legacyIndex()) return;
  if (location.hash.startsWith('#project-')) chooseProject(location.hash.slice(9));
});

const photos = [
  { src:'mountains', caption:'A different kind of walk.', alt:'Bob on a rocky outcrop, surrounded by mountain peaks beneath a cloudy sky' },
  { src:'sea', caption:'Room for a little wonder.', alt:'Bob with arms outstretched on rocks beside sparkling water' },
  { src:'doorway', caption:'Through the doorway · Suomenlinna', alt:'Bob framed by a stone gateway opening onto the water at Suomenlinna' },
];
const photo = document.querySelector('#personal-photo');
const caption = document.querySelector('#photo-caption');
const count = document.querySelector('#photo-count');
const nextPhoto = document.querySelector('#next-photo');
let photoIndex = 0;
if (photo && caption && count && nextPhoto) {
  nextPhoto.hidden = false;
  nextPhoto.addEventListener('click', () => {
    if (nextPhoto.disabled) return;
    const nextIndex = (photoIndex + 1) % photos.length;
    const next = photos[nextIndex];
    nextPhoto.disabled = true;
    const incoming = new Image();
    incoming.onload = () => {
      photo.src = incoming.src;
      photo.alt = next.alt;
      caption.textContent = next.caption;
      count.textContent = `0${nextIndex + 1} / 03`;
      photoIndex = nextIndex;
      nextPhoto.disabled = false;
    };
    incoming.onerror = () => { nextPhoto.disabled = false; };
    incoming.src = new URL(`./assets/photos/${next.src}.webp`, import.meta.url).href;
  });
}
const hkTime = document.querySelector('#hk-time');
if (hkTime) {
  const now = new Date();
  hkTime.dateTime = now.toISOString();
  hkTime.textContent = new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Hong_Kong', hour:'2-digit', minute:'2-digit', hour12:false }).format(now);
}
