import { CV } from './stories.mjs';

// Personal details were supplied by Bob for this public room.
// Duoji's first-person voice is fictional; the anecdotes are Bob's.
export const DUOJI_LINES = {
  name: {
    title: 'Small body. Lots of power.',
    text: '“I’m Duoji, Bob’s mini black Shiba Inu. My name comes from Boji in Ranking of Kings: a small body with lots of power.”',
  },
  confidence: {
    title: 'A little too confident.',
    text: '“I tend to overestimate myself around big dogs. Once, I ended up with a hole bitten in my ear. Confidence can run ahead of size.”',
  },
  plushies: {
    title: 'A word about plush dogs.',
    text: '“I shake dog plushies about and eat their ears. A small Shiba, a plush dog, and a rather unfortunate pair of ears.”',
  },
};

// Each image is a six-panel illustration; frame selects a panel from 0 to 5.
// CV links accompany only the public-CV channels; personal channels need no link.
// See docs/content-sources.md for the distinction between personal and CV sources.
export const TV_CHANNELS = [
  {
    name: '01 · AGENCY',
    image: './assets/art/tv-hobbies.webp', frame: 0,
    caption: 'Agency is my superpower. I’m always up for building something. Bring an idea—let’s make a start.',
  },
  {
    name: '02 · THE LEGO TYPEWRITER',
    image: './assets/art/tv-hobbies.webp', frame: 1,
    caption: 'My favourite LEGO set is the Typewriter: a brick-built machine for words. Very at home beside my poetry shelf.',
  },
  {
    name: '03 · DORAEMON & THE ANYWHERE DOOR',
    image: './assets/art/tv-hobbies.webp', frame: 2,
    caption: 'I’ve watched every episode of Doraemon and learned so much from it. I love the possibilities of the Anywhere Door.',
  },
  {
    name: '04 · A GADGET DETOUR',
    image: './assets/art/tv-hobbies.webp', frame: 3,
    caption: 'A niche gadget detour: the What-If Phone Booth reshapes reality. The Afterward-Real Speaker makes a lie come true afterward.',
    link: 'https://www.tv-asahi.co.jp/doraemon//story/0075/', linkLabel: 'The What-If Booth · TV Asahi',
  },
  {
    name: '05 · FINE DINING',
    image: './assets/art/tv-hobbies.webp', frame: 4,
    caption: 'Fine dining is one of my “three-minute heat” hobbies: curiosity that burns brightly, then moves on to something new.',
  },
  {
    name: '06 · A LITTLE GUNDAM PHASE',
    image: './assets/art/tv-hobbies.webp', frame: 5,
    caption: 'Gundam is another short, enthusiastic sprint. I get very into these hobbies for a while. Three-minute heat strikes again.',
  },
  {
    name: '07 · THE MEDICAL CLUB',
    image: './assets/art/tv-detours.webp', frame: 0,
    caption: 'I co-founded my school’s Medical Club: over eighty members, weekly healthcare sessions, and CPR training for classmates.',
    link: CV, linkLabel: 'Read my CV',
  },
  {
    name: '08 · LAUREATE FORUM · 2025',
    image: './assets/art/tv-detours.webp', frame: 1,
    caption: 'As a Hong Kong Laureate Forum Ambassador, I hosted visiting Shaw Laureates and young scientists, and supported the Secretariat.',
    link: CV, linkLabel: 'Read my CV',
  },
  {
    name: '09 · RATIONALITY · 2025',
    image: './assets/art/tv-detours.webp', frame: 2,
    caption: 'Ten days in Taoyuan as a fully funded rationality scholar: game theory, Bayesian inference, and Fermi estimation.',
    link: CV, linkLabel: 'Read my CV',
  },
  {
    name: '10 · PHYSICS TOURNAMENT · 2021–22',
    image: './assets/art/tv-detours.webp', frame: 3,
    caption: 'International Young Physicists’ Tournament, Hong Kong: first runner-up in 2021, champion in 2022. Two years to remember.',
    link: CV, linkLabel: 'Read my CV',
  },
  {
    name: '11 · AI RACING · 2023',
    image: './assets/art/tv-detours.webp', frame: 4,
    caption: 'Hong Kong and Greater Bay Area champion in the AI Formula Edge Racing Competition. One of my competitive detours.',
    link: CV, linkLabel: 'Read my CV',
  },
  {
    name: '12 · WORLD SCHOLARS’ CUP · 2023',
    image: './assets/art/tv-detours.webp', frame: 5,
    caption: 'I was Hong Kong champion in the World Scholars’ Cup in 2023. A little chapter from my school years.',
    link: CV, linkLabel: 'Read my CV',
  },
];
