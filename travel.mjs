// Bob supplied this public travel list. Edit here to colour future journeys.
export const TRAVELS=[
  ['SG','Singapore'],['MY','Malaysia'],['TH','Thailand'],['KH','Cambodia'],
  ['CN','China'],['HK','Hong Kong'],['TW','Taiwan'],['JP','Japan'],
  ['RU','Russia'],['FI','Finland'],['SE','Sweden'],['NO','Norway'],
  ['DE','Germany'],['FR','France'],['CH','Switzerland'],['ES','Spain'],
  ['GB','UK'],['TR','Turkey'],
  ['US','US'],['CA','Canada'],['AU','Australia'],['KR','South Korea'],
  ['ID','Indonesia'],['KE','Kenya'],['EG','Egypt'],['ZA','South Africa'],
  ['NA','Namibia'],['AR','Argentina'],['PE','Peru'],
  ['VN','Vietnam'],['AT','Austria'],['IT','Italy'],
];
export const COLOURED_PLACES=new Set(TRAVELS.map(([code])=>code).filter(code=>!['SG','HK'].includes(code)));
export const MAP_DESCRIPTION=`Pixel world map highlighting ${TRAVELS.filter(([code])=>COLOURED_PLACES.has(code)).map(([,name])=>name).join(', ')}. Singapore and Hong Kong are listed but unmarked at this scale.`;
let mapPromise;
export const loadMap=()=>mapPromise??=fetch(new URL('./assets/maps/world-pixels.json',import.meta.url)).then(r=>{if(!r.ok)throw new Error('The atlas could not be opened.');return r.json();}).catch(error=>{mapPromise=null;throw error;});
export function drawTravelMap(canvas,data){
  canvas.width=data.width;canvas.height=data.height;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#173e48';ctx.fillRect(0,0,data.width,data.height);
  const grid=new Uint16Array(data.width*data.height);
  data.rows.forEach((row,y)=>{let x=0;for(let i=0;i<row.length;i+=2){grid.fill(row[i+1],y*data.width+x,y*data.width+x+row[i]);x+=row[i];}});
  for(let y=0;y<data.height;y++)for(let x=0;x<data.width;x++){
    const id=grid[y*data.width+x];if(!id)continue;
    const visited=COLOURED_PLACES.has(data.countries[id].code);
    const edge=x>0&&grid[y*data.width+x-1]!==id||y>0&&grid[(y-1)*data.width+x]!==id;
    ctx.fillStyle=visited?(edge?'#bd9049':'#edc978'):(edge?'#3d5d50':'#739078');
    ctx.fillRect(x,y,1,1);
  }
}
export function mountTravel(root){
  root.innerHTML=`<div class="travel-space"><p class="eyebrow">A LITTLE ATLAS · STILL GROWING</p><h2 id="utility-heading">Places I’ve been.</h2><p class="travel-intro">I’m fascinated by maps. Here’s a little colour from my travels.</p><figure class="travel-chart"><canvas id="travel-map" role="img" aria-label="${MAP_DESCRIPTION}"></canvas><figcaption><span><i></i> A place I’ve been</span><span><i></i> More world to discover</span></figcaption></figure><p class="travel-status" role="status">Unfolding the atlas…</p><p class="travel-places">${TRAVELS.map(([,name])=>name).join(' · ')}</p><p class="travel-footnote">Singapore and Hong Kong are in my travel list, left unmarked at this scale.</p><a class="travel-source" href="https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/" target="_blank" rel="noopener">Map geography · Natural Earth ↗</a></div>`;
  let disposed=false;
  loadMap().then(data=>{if(disposed)return;drawTravelMap(root.querySelector('#travel-map'),data);root.querySelector('.travel-status').hidden=true;}).catch(()=>{if(!disposed)root.querySelector('.travel-status').textContent='The atlas is taking a little longer. Close and open it again to retry.';});
  return()=>{disposed=true;};
}
