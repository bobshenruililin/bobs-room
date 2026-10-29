import { PHOTOS, CV } from './stories.mjs';
import { TV_CHANNELS } from './personal.mjs';
export { TV_CHANNELS } from './personal.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function mountAlbum(root){
  root.innerHTML=`<div class="album-space"><h2 id="story-heading" class="sr-only">The scenic route, a little photo album</h2><div class="album-stage"><img class="album-illustration" src="./assets/art/photo-album.webp" alt="An open pixel photo album on a green desk, with a lantern, camera, and six photographs."><span class="album-label">THE SCENIC ROUTE</span>${PHOTOS.map((p,i)=>`<button class="album-photo" data-photo="${i}" style="--photo-x:${[20.45,42.65,64.5][i%3]}%;--photo-y:${i<3?22.5:52.65}%" aria-label="Open photograph: ${esc(p.caption)}"><img src="./assets/photos/${p.src}.webp" alt="${esc(p.alt)}"><span>${esc(p.caption)}</span></button>`).join('')}</div><div class="album-mobile"><div class="album-mobile-frame" id="album-single"></div><nav class="album-navigation" aria-label="Photograph pages"><button id="album-prev" aria-label="Previous album page">←</button><span id="album-count"></span><button id="album-next" aria-label="Next album page">→</button></nav></div></div>`;
  const controller=new AbortController(),options={signal:controller.signal};let selected=0;
  function render(){
    const p=PHOTOS[selected];
    root.querySelector('#album-single').innerHTML=`<button class="album-single-photo" data-photo="${selected}" aria-label="Open photograph: ${esc(p.caption)}"><img src="./assets/photos/${p.src}.webp" alt="${esc(p.alt)}"></button><p class="album-single-caption">${esc(p.caption)}</p>`;
    root.querySelector('#album-count').textContent=`${selected+1} / ${PHOTOS.length}`;
    root.dataset.albumPage=String(selected+1);
  }
  root.querySelector('#album-prev').addEventListener('click',()=>{selected=(selected+PHOTOS.length-1)%PHOTOS.length;render();},options);
  root.querySelector('#album-next').addEventListener('click',()=>{selected=(selected+1)%PHOTOS.length;render();},options);
  render();return ()=>controller.abort();
}

export function mountFern(root){
  root.innerHTML=`<div class="fern-scene"><h2 id="story-heading" class="sr-only">Room for a little wonder</h2><div class="fern-postcard" id="fern-postcard"><h3>Room for a little wonder.</h3><p>Touch the lantern.<br>Follow three little lights.</p></div><button id="fern-lantern" class="fern-lantern" aria-label="Open the firefly lantern"><span>FOLLOW THE LIGHT ↗</span></button><div class="fern-fireflies" id="fern-fireflies" hidden>${[[49,20],[62,12],[89,37]].map(([x,y],i)=>`<button class="fern-firefly" data-firefly="${i}" style="left:${x}%;top:${y}%" aria-label="Follow firefly ${i+1}"><span>✦</span></button>`).join('')}</div><span class="fern-status" id="fern-status" role="status">A small pause. No clock, no rush.</span></div>`;
  const controller=new AbortController(),options={signal:controller.signal};let lit=false,found=new Set();
  root.querySelector('#fern-lantern').addEventListener('click',()=>{
    if(lit)return;lit=true;root.querySelector('#fern-fireflies').hidden=false;root.querySelector('.fern-scene').classList.add('lantern-open');
    root.querySelector('#fern-lantern').setAttribute('aria-label','The firefly lantern is open');root.querySelector('#fern-lantern span').textContent='THREE LITTLE LIGHTS';root.querySelector('#fern-status').textContent='Follow the three little lights to uncover a real moment.';
  },options);
  root.querySelectorAll('[data-firefly]').forEach(b=>b.addEventListener('click',()=>{
    found.add(b.dataset.firefly);b.hidden=true;root.dataset.fireflies=String(found.size);
    root.querySelector('#fern-status').textContent=`${found.size} / 3 little lights followed.`;
    if(found.size===3){
      const photo=PHOTOS[1];root.querySelector('#fern-postcard').innerHTML=`<button class="fern-photo" data-photo="1" aria-label="Open photograph: ${esc(photo.caption)}"><img src="./assets/photos/${photo.src}.webp" alt="${esc(photo.alt)}"><span>A real moment. See the whole frame ↗</span></button>`;
      root.querySelector('#fern-status').textContent='A little wonder, from the wider world.';
    }
  },options));
  return ()=>controller.abort();
}

export function mountFolio(root,story,api){
  const weather=story.id==='weather';
  const pages=weather?[
    {label:'HKO · POLYU · 2024',title:'The sky, through a model’s eyes.',text:'At the Hong Kong Observatory and PolyU MicroLARGE Lab, I tested how DeepMind’s GraphCast could fit into Hong Kong weather forecasting.'},
    {label:'ATMOSPHERIC RIVERS · AGU',title:'Finding a river in the sky.',text:'I presented an atmospheric-river identification method at the American Geophysical Union. Another way to find useful patterns in the atmosphere.'},
  ]:[
    {label:'MACHA, GANSU · MAY–JUNE 2026',title:'Good questions start with listening.',text:'I was one of three student coordinators for HKU’s Wu Zhi Qiao team, helping plan logistics and choose rural health and infrastructure projects.'},
    {label:'WU ZHI QIAO · FIELD NOTES',title:'Water, health, and a village.',text:'I co-led a village water-scarcity study, interviewing more than fifty residents and reaching nearly every household. These field notes remember those conversations.'},
  ];
  root.innerHTML=`<div class="folio-scene ${weather?'globe-scene':'trunk-scene'}"><h2 id="story-heading" class="sr-only">${esc(story.heading)}</h2><article class="folio-paper" id="folio-paper" aria-live="polite"></article><div class="folio-objects" role="group" aria-label="${weather?'Explore the globe':'Explore the trunk'}"><button data-folio="0" class="folio-first" aria-label="${weather?'Turn the globe toward the sky model':'Open the field notebook'}"><span>${weather?'THE SKY MODEL ↗':'THE NOTEBOOK ↗'}</span></button><button data-folio="1" class="folio-second" aria-label="${weather?'Follow an atmospheric river':'Unfold the water-scarcity field map'}"><span>${weather?'A RIVER IN THE SKY ↗':'THE FIELD MAP ↗'}</span></button></div></div>`;
  const controller=new AbortController(),options={signal:controller.signal};
  if(weather){
    const atlasButton=document.createElement('button');atlasButton.className='folio-travel';atlasButton.id='folio-travel';atlasButton.textContent='My travel atlas ↗';
    root.querySelector('.folio-scene').append(atlasButton);atlasButton.addEventListener('click',()=>api.openTravel(),options);
  }
  function show(index){const p=pages[index];root.querySelector('#folio-paper').innerHTML=`<p class="eyebrow">${esc(p.label)}</p><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><span class="folio-page">${index+1} / 2 · ${weather?'A WEATHER NOTE':'A FIELD NOTE'}</span><a href="${CV}" target="_blank" rel="noopener">More from my CV ↗</a>`;root.querySelectorAll('[data-folio]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.folio)===index)));root.dataset.folio=String(index+1);}
  root.querySelectorAll('[data-folio]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.folio)),options));
  show(0);return ()=>controller.abort();
}

export function mountTV(root,api){
  root.innerHTML=`<div class="tv-scene"><h2 id="utility-heading" class="sr-only">A little TV, awakened by the lost remote</h2><div class="tv-screen"><div id="tv-image" class="tv-picture" role="img" aria-label=""></div><div class="tv-channel-label" id="tv-channel"></div><div class="tv-caption"><p id="tv-caption"></p><a id="tv-visit" target="_blank" rel="noopener" hidden></a></div><div class="tv-off" id="tv-off" hidden><span>THE LITTLE TV IS RESTING</span></div></div><button class="tv-dial tv-next" id="tv-next" aria-label="Change the TV channel"><span>CH +</span></button><button class="tv-dial tv-power" id="tv-power" aria-label="Switch the TV off" aria-pressed="true"><span>ON / OFF</span></button><div class="tv-guide">THE REMOTE WAS HERE ALL ALONG · <span id="tv-count"></span><button id="tv-prev">← Previous channel</button></div></div>`;
  const controller=new AbortController(),options={signal:controller.signal};let channel=0,on=true;
  function tune(index){channel=(index+TV_CHANNELS.length)%TV_CHANNELS.length;const c=TV_CHANNELS[channel];const picture=root.querySelector('#tv-image');picture.style.backgroundImage=`url("${c.image}")`;picture.style.backgroundPosition=`${(c.frame%3)*50}% ${Math.floor(c.frame/3)*100}%`;picture.setAttribute('aria-label',c.caption);const link=root.querySelector('#tv-visit');link.hidden=!c.link;if(c.link){link.href=c.link;link.textContent=c.linkLabel+' ↗';}root.querySelector('#tv-channel').textContent=c.name;root.querySelector('#tv-caption').textContent=c.caption;root.querySelector('#tv-count').textContent=`${channel+1} / ${TV_CHANNELS.length}`;root.dataset.channel=String(channel+1);}
  root.querySelector('#tv-next').addEventListener('click',()=>tune(channel+1),options);
  root.querySelector('#tv-prev').addEventListener('click',()=>tune(channel-1),options);
  root.querySelector('#tv-power').addEventListener('click',()=>{on=!on;root.querySelector('#tv-off').hidden=on;root.querySelector('.tv-caption').hidden=!on;root.querySelector('#tv-image').hidden=!on;root.querySelector('#tv-channel').hidden=!on;root.querySelector('#tv-power').setAttribute('aria-pressed',String(on));root.querySelector('#tv-power').setAttribute('aria-label',on?'Switch the TV off':'Switch the TV on');root.dataset.power=on?'on':'off';},options);
  document.addEventListener('keydown',e=>{if(!api.isActive()||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();tune(channel+(e.key==='ArrowRight'?1:-1));},options);
  tune(api.initialChannel || 0);return ()=>controller.abort();
}
