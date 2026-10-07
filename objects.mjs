import { byId, EMAIL, CV } from './stories.mjs';
import { DUOJI_LINES } from './personal.mjs';
export { DUOJI_LINES } from './personal.mjs';
import { mountArcade } from './arcade.mjs';
import { mountDrawer } from './drawer.mjs';
import { mountAlbum, mountFern, mountFolio } from './discoveries.mjs';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const contact = `mailto:${EMAIL}?subject=Let%27s%20build%20something`;
const links = story => (story.links || []).map(l => `<a href="${esc(l.href)}"${l.href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener"'}>${esc(l.label)} ↗</a>`).join('');
const note = story => `<p class="eyebrow">${esc(story.eyebrow)}</p><h3>${esc(story.heading)}</h3><p class="note-intro">${esc(story.intro)}</p>${story.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}<div class="object-links">${links(story)}</div>${story.note ? `<small>${esc(story.note)}</small>` : ''}`;

export const BOOK_PAGES = [
  { label:'A SMALL BOOK OF ATTENTION', title:'Words, too.', text:'Some questions become research. Others become poems.', footer:'From Bob’s poetry shelf' },
  { label:'TWO PIECES FROM ALONG THE WAY', title:'In these pages', text:'01 · Temple of Cement\n02 · Threads of The Earth’s Song\n', footer:'Turn a page. Take your time.' },
  { label:'2026 · CITY LITERARY AWARDS', title:'Temple of Cement', text:'New Poetry Recommended Award', footer:'A piece from my writing life.' },
  { label:'A CONVERSATION, PERHAPS', title:'Curious about the poem?', text:'I’d love to talk about my writing. Send me a little note.', link:'Ask about Temple of Cement', subject:'I’d love to read Temple of Cement' },
  { label:'2024 · HONG KONG YOUNG WRITERS AWARDS', title:'Threads of The Earth’s Song', text:'Bauhinia Club Award', footer:'Another way of paying attention.' },
  { label:'BETWEEN THE PAGES', title:'A small dog. A big personality.', text:'Someone has left a pawprint on the bookmark…', dog:true },
];

function mountBook(root, api) {
  root.innerHTML = `<div class="book-space"><div class="object-caption"><p class="eyebrow">THE POETRY SHELF</p><h2 id="story-heading">A little book of attention.</h2><span>Turn the pages. Follow a pawprint.</span></div><div class="book-stage"><div id="book-leaves" class="book-leaves" aria-live="polite"></div><button class="book-bookmark" id="book-bookmark" aria-label="Follow Duoji’s pawprint bookmark">✦</button><div class="page-turn" aria-hidden="true"></div></div><nav class="book-navigation" aria-label="Book pages"><button id="book-prev">← Previous page</button><span id="book-number"></span><button id="book-next">Turn the page →</button></nav></div>`;
  const controller = new AbortController(), options={signal:controller.signal};
  const mobile=matchMedia('(max-width: 600px)');
  let page=0, timer;
  function render() {
    const count=mobile.matches ? 1 : 2;
    const first=mobile.matches ? page : Math.floor(page/2)*2;
    root.querySelector('#book-leaves').innerHTML=BOOK_PAGES.slice(first,first+count).map((p,i)=>`<article class="book-leaf ${i?'right':'left'}"><span class="leaf-label">${esc(p.label)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text).replaceAll('\n','<br>')}</p>${p.footer?`<small>${esc(p.footer)}</small>`:''}${p.link?`<a href="mailto:${EMAIL}?subject=${encodeURIComponent(p.subject)}">${esc(p.link)} ↗</a>`:''}${p.dog?'<button data-object-story="duoji">Follow the pawprint ↗</button>':''}<span class="leaf-number">${String(first+i+1).padStart(2,'0')}</span></article>`).join('');
    root.querySelector('#book-number').textContent=mobile.matches?`${first+1} / ${BOOK_PAGES.length}`:`${first+1}–${first+2} / ${BOOK_PAGES.length}`;
    root.querySelector('#book-prev').disabled=first===0;
    root.querySelector('#book-next').disabled=first+count>=BOOK_PAGES.length;
    root.dataset.page=String(first+1);
  }
  function turn(direction) {
    const count=mobile.matches?1:2;
    page=Math.max(0,Math.min(BOOK_PAGES.length-count,page+direction*count));
    clearTimeout(timer);root.querySelector('.book-stage').classList.remove('turning');
    if(!api.still()){
      requestAnimationFrame(()=>root.querySelector('.book-stage')?.classList.add('turning'));
      timer=setTimeout(()=>root.querySelector('.book-stage')?.classList.remove('turning'),460);
    }
    render();
  }
  root.querySelector('#book-prev').addEventListener('click',()=>turn(-1),options);
  root.querySelector('#book-next').addEventListener('click',()=>turn(1),options);
  root.querySelector('#book-bookmark').addEventListener('click',()=>api.openStory('duoji'),options);
  root.addEventListener('click',e=>{const b=e.target.closest('[data-object-story]');if(b)api.openStory(b.dataset.objectStory);},options);
  document.addEventListener('keydown',e=>{
    if(!api.isActive()||!['ArrowLeft','ArrowRight'].includes(e.key))return;
    e.preventDefault();turn(e.key==='ArrowRight'?1:-1);
  },options);
  mobile.addEventListener('change',render,options);render();
  return ()=>{controller.abort();clearTimeout(timer);};
}

export const HOME_CITIES=[
  {id:'shanghai',name:'Shanghai',detail:'A little light along the Huangpu.',alt:'Imagined pixel view of Shanghai at dusk, with the Bund, Oriental Pearl Tower, and Pudong skyline.'},
  {id:'singapore',name:'Singapore',detail:'A little warmth beside Marina Bay.',alt:'Imagined pixel view of Singapore at dusk, with Marina Bay Sands, the Supertrees, and waterfront.'},
  {id:'hong-kong',name:'Hong Kong',detail:'A little wonder across the harbour.',alt:'Imagined pixel view of Hong Kong at dusk, with Victoria Harbour, skyline, and a Star Ferry.'},
];
function mountWindow(root,api){
  root.innerHTML=`<div class="home-space"><div class="object-caption"><p class="eyebrow">THE HOME WINDOW</p><h2 id="story-heading">Three cities. All of them home.</h2><span>I’ve lived for years in each. This window looks out on all three.</span></div><div class="city-tabs" role="tablist" aria-label="Choose a home city">${HOME_CITIES.map(c=>`<button role="tab" id="tab-${c.id}" data-city="${c.id}" aria-controls="city-view" aria-selected="false" tabindex="-1">${c.name}</button>`).join('')}</div><div class="city-frame" id="city-view" role="tabpanel" tabindex="0"><img id="city-image" width="1536" height="1024" alt=""><div class="window-mullion vertical" aria-hidden="true"></div><div class="window-mullion horizontal" aria-hidden="true"></div><div class="city-plaque"><span id="city-name"></span><p id="city-detail"></p></div></div><div class="window-sill"><span>THREE PLACES I CALL HOME</span><button id="nordic-postcard">A postcard on the sill ↗</button></div></div>`;
  const controller=new AbortController(),options={signal:controller.signal};
  function show(id,focus=false){
    const city=HOME_CITIES.find(c=>c.id===id);
    root.querySelector('#city-image').src=`./assets/art/${city.id}.webp`;root.querySelector('#city-image').alt=city.alt;
    root.querySelector('#city-name').textContent=city.name;root.querySelector('#city-detail').textContent=city.detail;
    root.querySelector('#city-view').setAttribute('aria-labelledby',`tab-${city.id}`);
    root.querySelectorAll('[data-city]').forEach(b=>{const selected=b.dataset.city===id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
    root.dataset.city=id;if(focus)root.querySelector(`#tab-${id}`).focus();
  }
  root.querySelectorAll('[data-city]').forEach(b=>{
    b.addEventListener('click',()=>show(b.dataset.city),options);
    b.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
      const i=HOME_CITIES.findIndex(c=>c.id===b.dataset.city);
      const next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;
      show(HOME_CITIES[next].id,true);
    },options);
  });
  root.querySelector('#nordic-postcard').addEventListener('click',()=>api.openUtility(`<div class="postcard"><p class="eyebrow">A POSTCARD · LILLEHAMMER, 2026</p><h2 id="utility-heading">Conversations beyond home.</h2><p>In 2026, I joined the NEWDAY dialogue programme at Nansen in Lillehammer, bringing together East Asian and Nordic perspectives.</p><p>Some of the most interesting things happen between disciplines — and between people.</p><a href="mailto:${EMAIL}">Start a conversation ↗</a></div>`),options);
  show('hong-kong');return ()=>controller.abort();
}

function mountSofa(root,api){
  root.innerHTML=`<div class="sofa-scene"><h2 id="story-heading" class="sr-only">A cup of tea, a curious life.</h2><picture class="sofa-picture"><source id="sofa-phone-art" media="(max-width:760px)" srcset="./assets/art/sofa-phone-closed.webp"><img id="sofa-scene-art" src="./assets/art/sofa-closed.webp" alt="A single illustrated pixel sofa nook, with a fern cushion, a cup of tea, and a large paper note."></picture><button class="sofa-cushion-target" id="lift-cushion" aria-expanded="false" aria-label="Look between the sofa cushions"><span>BETWEEN THE CUSHIONS? ↗</span></button><button id="found-remote" class="sofa-remote-target" hidden aria-label="Use the missing remote control"><span>THE LOST REMOTE ↗</span></button><article class="sofa-paper" id="sofa-paper" aria-live="polite"></article></div>`;
  const controller=new AbortController(),options={signal:controller.signal};let lifted=false,page=0;
  const titles=['A student, still curious.','A college within a city.','Support along the way.'];
  function render(){
    root.querySelector('#sofa-scene-art').src=`./assets/art/${lifted?'sofa-nook':'sofa-closed'}.webp`;
    root.querySelector('#sofa-phone-art').srcset=`./assets/art/sofa-phone-${lifted?'open':'closed'}.webp`;
    root.querySelector('#lift-cushion').setAttribute('aria-expanded',String(lifted));
    root.querySelector('#lift-cushion').setAttribute('aria-label',lifted?'Put the cushion back':'Look between the sofa cushions');
    root.querySelector('#lift-cushion span').textContent=lifted?'PUT THE CUSHION BACK ↓':'BETWEEN THE CUSHIONS? ↗';
    root.querySelector('#found-remote').hidden=!lifted;
    root.querySelector('.sofa-scene').classList.toggle('cushion-lifted',lifted);
    root.querySelector('#sofa-paper').innerHTML=lifted?`<div id="cushion-note"><p class="eyebrow">A LITTLE DISCOVERY</p><h3>The missing remote!</h3><p>The sofa has been keeping it safe.</p><p>Twelve channels. Little detours from Bob’s life. Turn the brass knob and see where it takes you.</p><button id="remote-note">Switch on the little TV ↗</button><button id="sofa-intro">Back to our cup of tea ↶</button></div>`:`<p class="eyebrow">SHEN RUILILIN · YOU CAN CALL ME BOB</p><h3>${titles[page]}</h3><p>${esc(byId('hello').paragraphs[page])}</p><button id="sofa-next">${page+1} / 3 · Another little note →</button><a href="${CV}" target="_blank" rel="noopener">My CV ↗</a><p class="sofa-hint">Something’s hiding between the cushions.</p>`;
    root.dataset.cushion=lifted?'lifted':'resting';
  }
  root.querySelector('#lift-cushion').addEventListener('click',()=>{lifted=!lifted;render();},options);
  root.querySelector('#found-remote').addEventListener('click',api.openTV,options);
  root.querySelector('#sofa-paper').addEventListener('click',e=>{if(e.target.closest('#remote-note'))api.openTV();if(e.target.closest('#sofa-intro')){lifted=false;render();}if(e.target.closest('#sofa-next')){page=(page+1)%3;render();}},options);
  render();return ()=>controller.abort();
}

function mountDuoji(root,api){
  root.innerHTML=`<div class="duoji-space"><div class="object-caption"><p class="eyebrow">DUOJI’S NOOK · LITTLE PERSONAL THINGS</p><h2 id="story-heading">Small dog. Considerable power.</h2></div><div class="duoji-layout"><div class="duoji-portrait"><img src="./assets/art/shiba-closeup.webp" alt="Duoji, a little black and tan Shiba Inu with a green collar, illustrated in pixels."><span>DUOJI · MINI BLACK SHIBA</span></div><div class="duoji-conversation"><div class="dog-speech" aria-live="polite"><span>DUOJI SAYS</span><h3 id="duoji-title"></h3><p id="duoji-line"></p></div><div class="dog-questions" role="group" aria-label="Ask Duoji"><button data-dog="name">My name</button><button data-dog="confidence">Big dogs</button><button data-dog="plushies">Toy dogs</button></div><small class="dog-footnote">Bob’s real dog. An imagined conversation.</small></div></div></div>`;
  const controller=new AbortController(),options={signal:controller.signal};
  function talk(topic){const line=DUOJI_LINES[topic];root.querySelector('#duoji-title').textContent=line.title;root.querySelector('#duoji-line').textContent=line.text;root.querySelectorAll('[data-dog]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dog===topic)));root.dataset.topic=topic;}
  root.querySelectorAll('[data-dog]').forEach(b=>b.addEventListener('click',()=>talk(b.dataset.dog),options));
  talk('name');return ()=>controller.abort();
}

export function mountObject(root,story,api){
  const modes={poetry:'book',heat:'drawer',weather:'globe',fieldwork:'trunk',dialogue:'home',hello:'sofa',duoji:'duoji',workshop:'arcade',photos:'photowall',wonder:'fern'};
  api.setMode(modes[story.id]);
  if(story.id==='poetry')return mountBook(root,api);
  if(story.id==='heat')return mountDrawer(root,story,api);
  if(['weather','fieldwork'].includes(story.id))return mountFolio(root,story);
  if(story.id==='dialogue')return mountWindow(root,api);
  if(story.id==='hello')return mountSofa(root,api);
  if(story.id==='duoji')return mountDuoji(root,api);
  if(story.id==='workshop')return mountArcade(root,api);
  if(story.id==='photos')return mountAlbum(root);
  if(story.id==='wonder')return mountFern(root);
  return ()=>{};
}

export function contactContent(){
  return `<div class="contact-note"><p class="eyebrow">A CALL TO FELLOW BUILDERS</p><h2 id="utility-heading">Let’s build something.</h2><p class="contact-intro">An idea, an experiment, a strange little world.<br>I’m always up for it.</p><p>Health, climate, code, pixel worlds, or something in between. Bring your curiosity. Let’s see what we can make.</p><a class="builder-link" href="${contact}">Bring me an idea ↗</a><div class="contact-address"><a href="mailto:${EMAIL}">${EMAIL}</a><button id="copy-email" aria-label="Copy Bob’s email address">Copy</button></div><div class="contact-social"><a href="https://www.linkedin.com/in/shenruililin" target="_blank" rel="noopener">LinkedIn ↗</a><a href="https://github.com/bobshenruililin" target="_blank" rel="noopener">GitHub ↗</a><a href="${CV}" target="_blank" rel="noopener">My CV ↗</a></div></div>`;
}

export function mountRug(root){
  root.innerHTML=`<div class="rug-space"><div class="object-caption"><p class="eyebrow">SOMETHING UNDER THE RUG</p><h2 id="utility-heading">Every room needs a little secret.</h2><span>Lift the corner. Leave a brick for the next idea.</span></div><div class="rug-stage"><div class="brick-stash" id="brick-stash" hidden><p>A LITTLE STASH OF POSSIBILITIES</p><div class="brick-tower" id="brick-tower" role="img" aria-label="A colourful toy tower with no bricks yet"><span class="tower-hint">A little idea starts here.</span></div><div class="brick-actions"><button data-brick="rust" aria-label="Add a red brick">+ <span class="brick rust"></span></button><button data-brick="gold" aria-label="Add a yellow brick">+ <span class="brick gold"></span></button><button data-brick="sky" aria-label="Add a blue brick">+ <span class="brick sky"></span></button><button id="brick-undo" disabled>Undo</button></div><span id="brick-status" class="brick-status" role="status">Try building something small.</span></div><button class="lift-rug" id="lift-rug" aria-expanded="false" aria-label="Lift the rug corner"><img src="./assets/art/rug.webp" alt="An oval green rug with gold trim and a curled corner, in chunky pixels."><span id="rug-action">LIFT THE CORNER ↗</span></button></div><a class="builder-link" href="${contact}">Bring your bigger idea to Bob ↗</a></div>`;
  const controller=new AbortController(),options={signal:controller.signal};let lifted=false,bricks=[];
  root.querySelector('#lift-rug').addEventListener('click',()=>{
    lifted=!lifted;root.querySelector('.rug-stage').classList.toggle('rug-lifted',lifted);root.querySelector('#brick-stash').hidden=!lifted;
    root.querySelector('#lift-rug').setAttribute('aria-expanded',String(lifted));root.querySelector('#lift-rug').setAttribute('aria-label',lifted?'Lay the rug back down':'Lift the rug corner');root.querySelector('#rug-action').textContent=lifted?'LAY IT BACK DOWN ↓':'LIFT THE CORNER ↗';root.dataset.rug=lifted?'lifted':'resting';
  },options);
  function render(){
    root.querySelector('#brick-tower').innerHTML=bricks.length?bricks.map((color,i)=>`<span class="toy-brick ${color}" style="--brick-x:${i%3*25+13}%;--brick-y:${Math.floor(i/3)*28}px"></span>`).join(''):'<span class="tower-hint">A little idea starts here.</span>';
    root.querySelector('#brick-tower').setAttribute('aria-label',`A colourful toy tower with ${bricks.length} bricks`);
    root.querySelector('#brick-status').textContent=bricks.length===18?'A tiny tower. A bigger idea? Tell Bob.':`${bricks.length} little brick${bricks.length===1?'':'s'}. What shall we build?`;
    root.querySelector('#brick-undo').disabled=!bricks.length;root.querySelectorAll('[data-brick]').forEach(b=>b.disabled=bricks.length>=18);root.dataset.bricks=String(bricks.length);
  }
  root.querySelectorAll('[data-brick]').forEach(b=>b.addEventListener('click',()=>{if(bricks.length<18){bricks.push(b.dataset.brick);render();}},options));
  root.querySelector('#brick-undo').addEventListener('click',()=>{bricks.pop();render();},options);
  return ()=>controller.abort();
}
