// Zet foto's in img/ om naar WebP, naast het origineel (het origineel blijft staan),
// en schrijft data/webp.js: de lijst van alle beschikbare .webp-bestanden voor index.html.
// Draait in GitHub Actions vóór scripts/maak-paginas.mjs. Lokaal: npm i sharp && node scripts/naar-webp.mjs
// Bestaat er al een .webp naast een foto, dan wordt die niet opnieuw gemaakt.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const MAP = 'img';
const MAX_BREEDTE = 2000;   // px, alleen de WebP-kopie wordt verkleind; kleinere foto's blijven zoals ze zijn
const KWALITEIT = 80;
const KLEIN_BREEDTE = 700;  // px, kleine versie (naam-klein.webp) voor kaarten en overzichten
const KLEIN_KWALITEIT = 75;
const MAX_PER_NAAM = [[/^tegel-/i, 256]];                    // tegel-afbeeldingen worden klein getoond
const OVERSLAAN_MAPPEN = new Set(['thumbs']);                // YouTube-thumbnails zijn al klein
const OVERSLAAN_BESTANDEN = /^(favicon|apple-touch-icon)/i;  // pictogrammen blijven png/ico

function* loop(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!OVERSLAAN_MAPPEN.has(e.name)) yield* loop(p); }
    else yield p;
  }
}

let nieuw = 0, bestond = 0, groter = 0, voor = 0, na = 0, klein = 0;
const webps = [];
for (const bron of loop(MAP)) {
  if (/\.webp$/i.test(bron)) { webps.push(bron.split(path.sep).join('/')); continue; }
  if (!/\.(jpe?g|png)$/i.test(bron) || OVERSLAAN_BESTANDEN.test(path.basename(bron))) continue;
  // kleine versie voor kaarten (alleen voor foto's die breder zijn dan KLEIN_BREEDTE)
  const kl = bron.replace(/\.(jpe?g|png)$/i, '-klein.webp');
  if (!fs.existsSync(kl)) {
    try {
      const meta = await sharp(bron).metadata(), br = (meta.orientation >= 5 ? meta.height : meta.width) || 0;
      if (br > KLEIN_BREEDTE) { fs.writeFileSync(kl, await sharp(bron).rotate().resize({ width: KLEIN_BREEDTE, withoutEnlargement: true }).webp({ quality: KLEIN_KWALITEIT }).toBuffer()); klein++; }
    } catch (e) { console.warn('Geen kleine versie:', bron, e.message); }
  }
  const doel = bron.replace(/\.(jpe?g|png)$/i, '.webp');
  if (fs.existsSync(doel)) { bestond++; continue; }
  try {
    const grootte = fs.statSync(bron).size;
    const breedte = (MAX_PER_NAAM.find(([re]) => re.test(path.basename(bron))) || [0, MAX_BREEDTE])[1];
    const buf = await sharp(bron).rotate().resize({ width: breedte, withoutEnlargement: true }).webp({ quality: KWALITEIT }).toBuffer();
    if (buf.length >= grootte) { groter++; continue; }  // niet kleiner: dan blijft het origineel in gebruik
    fs.writeFileSync(doel, buf);
    webps.push(doel.split(path.sep).join('/'));
    nieuw++; voor += grootte; na += buf.length;
  } catch (e) { console.warn('Overgeslagen:', bron, e.message); }
}

// Lijst voor index.html (die controleert hiermee of er een WebP-versie van een foto bestaat)
webps.sort();
const lijst = `window.WEBP={\n${webps.map(p => ` ${JSON.stringify(p)}:1`).join(',\n')}\n};\n`;
fs.mkdirSync('data', { recursive: true });
let oud = ''; try { oud = fs.readFileSync('data/webp.js', 'utf8'); } catch (e) {}
if (oud !== lijst) fs.writeFileSync('data/webp.js', lijst);

const mb = n => (n / 1048576).toFixed(1) + ' MB';
console.log(`WebP: ${nieuw} nieuw (${mb(voor)} -> ${mb(na)}), ${bestond} bestonden al, ${groter} niet kleiner dan het origineel. ${webps.length} in data/webp.js. ${klein} kleine versies gemaakt.`);
