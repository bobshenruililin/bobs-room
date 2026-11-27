// The six works behind the gate, in order. Frames are captures of the real work in ./media,
// or '@heat' / '@hotdays', which the page draws from Hong Kong Observatory data.
// `pos` is where the still sits in the gate (CSS object-position); scripts/prepare-requests.py
// uses the same values to build the Higgsfield landing frames.
// Copy is a draft for Bob to rewrite. Colours are taken from each work.
export const WORKS = [
  { id: 'carryistic', title: 'Carryistic', kind: 'A portfolio for an artist', color: '#7d0f14',
    door: 'carry-1', pos: '66% 42%', frames: { d: ['carry-1', 'carry-2', 'carry-3'], p: ['carry-p', 'carry-3'] },
    line: 'Carry’s profile picture throws fifteen rays of light, one for each of her works, in colours taken from the works themselves.',
    credit: 'Direction and build, for the artist Carry', href: 'https://carryistic.vercel.app/' },
  { id: 'asterwind', title: 'Asterwind', kind: 'Interactive paper theatre', color: '#3a3150',
    door: 'asterwind-2', pos: '74% 50%', frames: { d: ['asterwind-2', 'asterwind-1'], p: ['asterwind-p', 'asterwind-2'] },
    line: 'A group’s ideas about leadership became a paper world you step into, one difficult choice at a time.',
    credit: 'HKU group project · interactive design and build', href: 'https://bobshenruililin.github.io/asterwind/' },
  { id: 'crossing', title: 'Crossing Lives', kind: 'Research, drawn as a map', color: '#2c5a4e',
    door: 'crossing-photo', pos: '50% 50%', frames: { d: ['crossing-photo', 'crossing-1', 'crossing-2'], p: ['crossing-photo', 'crossing-p'] },
    line: 'Everyday life across Hong Kong and Shenzhen – where people sleep, work, shop and visit – from Jamie Ko’s fieldwork.',
    credit: 'Research and presentation: Jamie Ko · Visualization: Bob', href: 'https://bobshenruililin.github.io/jamie-crossing-lives-site/' },
  { id: 'heat', title: 'Heat & health', kind: 'Public-health research', color: '#16202c',
    door: '@heat', frames: { d: ['@heat', '@hotdays'], p: ['@heat', '@hotdays'] },
    line: 'How do thermal extremes relate to cardiovascular hospitalisations in Hong Kong? Undergraduate research with Professor David Bishai, 2013–2023. In progress.',
    credit: 'Laidlaw research · HKU School of Public Health · temperatures: Hong Kong Observatory open data', href: 'https://github.com/bobshenruililin/Laidlaw-Heat-Project' },
  { id: 'careers', title: 'Career Atlas', kind: 'A tool for finding work', color: '#2f3846',
    door: 'careers-1', pos: '28% 30%', frames: { d: ['careers-1', 'careers-2'], p: ['careers-p'] },
    line: 'Internships with their original sources, practical requirements and a shortlist you keep in your own browser.',
    credit: 'Design and build', href: '../../careers/' },
  { id: 'room', title: 'Bob’s Room', kind: 'The first world I built', color: '#1d2a4a',
    door: 'room-art', pos: '50% 58%', frames: { d: ['room-art', 'room-1'], p: ['room-art', 'room-p'] },
    line: 'A pixel room to walk through as a fox or a rabbit, with a Go board, an arcade, a travel atlas and Duoji, my Shiba.',
    credit: 'Bob’s Room, 2026', href: '../../room.html' },
];
export const SEA = { title: 'Suomenlinna, Helsinki', kind: 'the view as I photographed it', color: '#a0cef3' };
