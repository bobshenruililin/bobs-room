export const EMAIL = 'bobshenruililin@gmail.com';
export const CV = './assets/Shen-Ruililin-CV.pdf';
export const PHOTOS = [
  { src: 'mountains', caption: 'A different kind of walk.', alt: 'Shen on a rocky outcrop, surrounded by mountain peaks beneath a cloudy sky' },
  { src: 'sea', caption: 'Room for a little wonder.', alt: 'Shen with arms outstretched on rocks beside sparkling water' },
  { src: 'daisies', caption: 'At ground level · Suomenlinna', alt: 'Small daisies beside a grassy path beneath trees on Suomenlinna' },
  { src: 'tower', caption: 'Looking up · Suomenlinna', alt: 'Shen sitting in the grass below a tall church tower' },
  { src: 'doorway', caption: 'Through the doorway · Suomenlinna', alt: 'Shen framed by a stone gateway opening onto the water' },
  { src: 'sailboat', caption: 'Between the branches · Suomenlinna', alt: 'A white sailboat seen through branches above the sea' },
];

// Biographical facts come from Bob's published page, its public CV,
// and his direct instructions. See docs/content-sources.md.
// The apartment, animal visitors, and their dialogue are fictional.
export const STORIES = [
  {
    id: 'hello', number: '01', title: 'A cup of tea', name: 'Meet Bob', icon: 'tea',
    marker: { x: 1181, y: 426 }, approach: { x: 1038, y: 649 },
    eyebrow: 'THE SOFA · A LITTLE INTRODUCTION',
    heading: 'Pull up a chair.',
    intro: 'I’m Shen Ruililin. You can call me Bob.',
    paragraphs: [
      'I study Global Health and Development at HKU’s medical faculty. My BASc degree runs from 2025 to 2029.',
      'I’m a member of St. John’s College, and a Martin Scholar there for 2025–26.',
      'I’m one of four Tung and Ngai Foundation Scholarship recipients at HKU. I also received the Tam Wun Tsun HKU Horizons Student Enrichment Award for 2025–26.',
    ],
    tags: ['HKUMed', 'St. John’s College', '2025–2029'],
    image: 'mountains',
    links: [{ label: 'Read my CV', href: CV }, { label: 'Say hello', href: `mailto:${EMAIL}` }],
  },
  {
    id: 'heat', number: '02', title: 'The research desk', name: 'Heat & health', icon: 'sun',
    marker: { x: 262, y: 304 }, approach: { x: 424, y: 570 },
    eyebrow: 'HKU · LAIDLAW SCHOLAR · 2026—',
    heading: 'Heat, hospitals, and preparedness.',
    intro: 'What happens to health when a city gets hotter?',
    paragraphs: [
      'As a Laidlaw undergraduate research scholar, I’m studying extreme heat and cardiovascular admissions among older adults in Hong Kong, using Hospital Authority data.',
      'I work under Professor David Bishai at HKU’s School of Public Health. The analysis covers hot and cold seasons, with hospital preparedness and cross-boundary heat-health surveillance in view.',
    ],
    tags: ['Public health', 'Climate', 'Research in progress'],
    note: 'This is a description of ongoing research. Patient-level data and unpublished findings are not shared here.',
    links: [{ label: 'More about my work', href: CV }],
  },
  {
    id: 'poetry', number: '03', title: 'The poetry shelf', name: 'Words, too', icon: 'book',
    marker: { x: 535, y: 247 }, approach: { x: 600, y: 550 },
    eyebrow: 'THE BOOKSHELF · WORDS, TOO',
    heading: 'Another way of paying attention.',
    intro: 'Some questions become research. Others become poems.',
    paragraphs: ['Two pieces from my writing life, recognised in 2024 and 2026. The book holds their titles and a way to ask me about the poems.'],
    entries: [
      { label: '2026 · City Literary Awards', title: 'Temple of Cement', text: 'New Poetry Recommended Award' },
      { label: '2024 · Hong Kong Young Writers Awards', title: 'Threads of The Earth’s Song', text: 'Bauhinia Club Award' },
    ],
    tags: ['Poetry', 'Attention', 'Language'],
    links: [{ label: 'Ask me about my writing', href: `mailto:${EMAIL}?subject=I%27d%20love%20to%20read%20your%20poetry` }],
  },
  {
    id: 'weather', number: '04', title: 'The little globe', name: 'Weather & models', icon: 'globe',
    marker: { x: 182, y: 505 }, approach: { x: 337, y: 568 },
    eyebrow: 'HKO · POLYU · 2024',
    heading: 'Weather, through a model’s eyes.',
    intro: 'A model is another way to look at the sky.',
    paragraphs: [
      'From February to July 2024, I was a research intern at the Hong Kong Observatory and PolyU MicroLARGE Lab through the Junior Researcher Mentoring Programme. I tested the integration of DeepMind’s GraphCast into Hong Kong weather forecasting.',
      'I also presented an atmospheric-river identification method at the American Geophysical Union (AGU). This was another part of my work on finding useful patterns in the atmosphere.',
    ],
    tags: ['GraphCast', 'Atmospheric rivers', 'Computation'],
    links: [{ label: 'See my research background', href: CV }],
  },
  {
    id: 'fieldwork', number: '05', title: 'The travel trunk', name: 'Field notes', icon: 'case',
    marker: { x: 226, y: 690 }, approach: { x: 521, y: 718 },
    eyebrow: 'WU ZHI QIAO · MACHA, GANSU · 2026',
    heading: 'Listening across a village.',
    intro: 'Good questions start with listening.',
    paragraphs: [
      'In May–June 2026, I was one of three student coordinators for HKU’s Wu Zhi Qiao team in Macha, Gansu. I helped plan logistics and decide which rural health and infrastructure projects the team took on.',
      'I co-led a study of village water scarcity, interviewing more than fifty residents and reaching nearly every household. The field notes here remember those conversations.',
    ],
    tags: ['May–June 2026', 'Rural health', 'Water scarcity'],
    links: [{ label: 'More about my fieldwork', href: CV }],
  },
  {
    id: 'dialogue', number: '06', title: 'The home window', name: 'Three cities, home', icon: 'window',
    marker: { x: 833, y: 242 }, approach: { x: 801, y: 542 },
    eyebrow: 'SHANGHAI · SINGAPORE · HONG KONG',
    heading: 'Three cities. All of them home.',
    intro: 'Pick a city. Change the view.',
    paragraphs: [
      'Shanghai, Singapore, and Hong Kong: I’ve lived for years in each, and I call all three home. This imaginary window looks out on all of them.',
      'Beyond those three homes, I joined the nine-day NEWDAY residential dialogue at the Nansen Academy in Lillehammer in July–August 2026, with East Asian and Nordic students.',
    ],
    tags: ['Shanghai', 'Singapore', 'Hong Kong', 'Nordic dialogue'],
    links: [{ label: 'Start a conversation', href: `mailto:${EMAIL}` }],
  },
  {
    id: 'photos', number: '07', title: 'The photo wall', name: 'The scenic route', icon: 'camera',
    marker: { x: 1227, y: 230 }, approach: { x: 1006, y: 580 },
    eyebrow: 'THE PHOTO WALL · A FEW REAL MOMENTS',
    heading: 'Things worth stopping for.',
    intro: 'A few photographs from the wider world.',
    paragraphs: ['Mountains, open water, and small details from Suomenlinna. Open a photograph to leave its frame behind and see the whole image.'],
    gallery: true,
    tags: ['Photography', 'Suomenlinna', 'Wandering'],
  },
  {
    id: 'workshop', number: '08', title: 'The little arcade', name: 'The workshop', icon: 'game',
    marker: { x: 1330, y: 647 }, approach: { x: 1062, y: 719 },
    eyebrow: 'THE ARCADE · QUESTIONS BECOME THINGS',
    heading: 'A few things in the workshop.',
    intro: 'Ideas I’ve tried to make work.',
    paragraphs: ['Play a round, then open the workshop notes to see where the experiments began.'],
    entries: [
      { label: 'HKUST IAS · JUL 2023–MAR 2024', title: 'Quantum circuits & calibration', text: 'At the IAS Center for Quantum Technologies, I built Qiskit circuit models and an auto-calibration routine for SpinQ desktop machines, and presented work on entanglement and measurement at physics department seminars.' },
      { label: 'MIT Hong Kong Innovation Node · JUL–SEP 2023', title: 'MEDocGPT', text: 'As a Youth Fellow, I prototyped a healthcare chatbot and mobile app using large language models for early health intervention. An early prototype, not a clinical service.' },
      { label: 'A NEW PIXEL EXPERIMENT', title: 'Crossing Lives', text: 'An ongoing pixel-world experiment. Ask me about it.' },
    ],
    tags: ['Making', 'Code', 'Pixel worlds'],
    links: [{ label: 'Explore my public projects', href: 'https://github.com/bobshenruililin' }],
  },
  {
    id: 'wonder', number: '09', title: 'The lantern fern', name: 'A little wonder', icon: 'leaf',
    marker: { x: 945, y: 823 }, approach: { x: 801, y: 760 },
    eyebrow: 'A SMALL PAUSE · NO CLOCK, NO RUSH',
    heading: 'Room for a little wonder.',
    intro: 'You don’t have to be going somewhere to notice something.',
    paragraphs: ['Open the lantern and follow three little lights. There’s a real moment by the water waiting at the end.'],
    image: 'sea',
    tags: ['Stay curious', 'Take your time'],
    links: [{ label: 'Tell me what you’re curious about', href: `mailto:${EMAIL}` }],
  },
  {
    id: 'duoji', number: '10', title: 'Duoji’s nook', name: 'Duoji’s little secrets', icon: 'star',
    marker: { x: 641, y: 518 }, approach: { x: 675, y: 600 },
    eyebrow: 'A MINI BLACK SHIBA · A CONSIDERABLE PERSONALITY',
    heading: 'Small body. Lots of power.',
    intro: 'Meet Duoji, my mini black Shiba Inu.',
    paragraphs: [
      'His name is inspired by Boji from Ranking of Kings: a small body with lots of power.',
      'A few little personal things: I like LEGO and Doraemon. And I’m always up for building something with curious people.',
    ],
    tags: ['Duoji', 'LEGO', 'Doraemon', 'Let’s build'],
    links: [{ label: 'Let’s build something', href: `mailto:${EMAIL}?subject=Let%27s%20build%20something` }],
  },
];

export const byId = id => STORIES.find(s => s.id === id);
