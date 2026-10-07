import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TRAVELS,COLOURED_PLACES,MAP_DESCRIPTION} from '../travel.mjs';
const data=JSON.parse(await readFile(new URL('../assets/maps/world-pixels.json',import.meta.url)));
const grid=data.rows.map(row=>{const result=[];for(let i=0;i<row.length;i+=2)result.push(...Array(row[i]).fill(row[i+1]));return result;});
function at(lon,lat){const x=Math.floor((lon+180)/360*data.width),y=Math.floor((90-lat)/180*data.height);return data.countries[grid[y][x]].code;}
test('the geographic raster has complete rows and valid country indexes',()=>{
 assert.equal(grid.length,data.height);
 for(const row of grid){assert.equal(row.length,data.width);assert.ok(row.every(id=>id>=0&&id<data.countries.length));}
});
test('travel colouring matches Bob’s list and does not enlarge Singapore or Hong Kong',()=>{
 assert.equal(TRAVELS.length,29);assert.equal(new Set(TRAVELS.map(p=>p[0])).size,29);
 for(const [code] of TRAVELS)assert.ok(data.countries.some(p=>p.code===code),code);
 assert.equal(COLOURED_PLACES.size,27);assert.ok(!COLOURED_PLACES.has('SG'));assert.ok(!COLOURED_PLACES.has('HK'));
 assert.match(MAP_DESCRIPTION,/South Korea/);assert.match(MAP_DESCRIPTION,/Namibia/);
 assert.match(MAP_DESCRIPTION,/Singapore and Hong Kong are listed but unmarked/);
});
test('known interior locations retain their country and ocean positions',()=>{
 for(const [lon,lat,code] of [[2,47,'FR'],[10,51,'DE'],[105,35,'CN'],[100,15,'TH'],[137,36,'JP'],[100,60,'RU'],[15,63,'SE'],[25,65,'FI'],[-3,40,'ES'],[33,39,'TR'],[-100,40,'US'],[17,-22,'NA'],[-30,0,'']])assert.equal(at(lon,lat),code,`${lon},${lat}`);
});
