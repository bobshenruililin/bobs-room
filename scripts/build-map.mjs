// Run with a downloaded Natural Earth 50m countries GeoJSON path.
// No image generation: polygon interiors become fixed geographic pixel cells.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const input=process.argv[2];
if(!input) throw new Error('Usage: node scripts/build-map.mjs path/to/ne_50m_admin_0_countries.geojson');
const raw=await readFile(input), source=JSON.parse(raw), width=480,height=240;
const cells=new Uint16Array(width*height), countries=[{code:'',name:'Ocean'}];
for(const feature of source.features){
  const p=feature.properties,id=countries.length;
  countries.push({code:p.ISO_A2_EH||p.ISO_A2,name:p.NAME_EN||p.ADMIN});
  const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
  for(const rings of polygons){
    const points=rings.flat(), minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
    const from=Math.max(0,Math.ceil((90-maxY)*height/180-.5));
    const to=Math.min(height-1,Math.floor((90-minY)*height/180-.5));
    for(let y=from;y<=to;y++){
      const lat=90-(y+.5)*180/height, crossings=[];
      for(const ring of rings) for(let i=0,j=ring.length-1;i<ring.length;j=i++){
        const a=ring[j],b=ring[i];
        if((a[1]>lat)!==(b[1]>lat)) crossings.push(a[0]+(lat-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      crossings.sort((a,b)=>a-b);
      for(let k=0;k+1<crossings.length;k+=2){
        const left=Math.max(0,Math.ceil((crossings[k]+180)*width/360-.5));
        const right=Math.min(width-1,Math.floor((crossings[k+1]+180)*width/360-.5));
        for(let x=left;x<=right;x++) cells[y*width+x]=id;
      }
    }
  }
}
const rows=Array.from({length:height},(_,y)=>{
  const runs=[];let start=0,id=cells[y*width];
  for(let x=1;x<=width;x++) if(x===width||cells[y*width+x]!==id){runs.push(x-start,id);start=x;id=cells[y*width+x];}
  return runs;
});
const data={width,height,bounds:[-180,-90,180,90],countries,rows};
await writeFile(new URL('../assets/maps/world-pixels.json',import.meta.url),JSON.stringify(data));
await writeFile(new URL('../assets/maps/provenance.json',import.meta.url),JSON.stringify({
  source:'Natural Earth 1:50m Admin 0 – Countries',license:'Public domain',
  url:'https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/',
  download:'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
  sha256:createHash('sha256').update(raw).digest('hex'),
  method:'480 × 240 plate carrée grid; each 0.75° cell receives the polygon containing its geographic centre. Rings use even-odd fill. No generative image processing.',
  smallPlaces:'Singapore and Hong Kong are not specially marked or enlarged, as requested. Their names remain in the travel list.'
},null,2)+'\n');
console.log(`Saved ${width} × ${height} geographic cells, ${countries.length-1} map areas.`);
