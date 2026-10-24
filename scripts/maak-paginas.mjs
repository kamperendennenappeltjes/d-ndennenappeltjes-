// Maakt voor elke camping en elk verhaal een eigen pagina, plus sitemap.xml en robots.txt.
// Draait automatisch via GitHub Actions (.github/workflows/paginas.yml).
import fs from 'node:fs';

const BASE = 'https://www.dennenappeltjes.nl';
const SITE = "Kamperen met d'n Dennenappeltjes";
const vandaag = new Date().toISOString().slice(0, 10);

const laad = (bestand, naam, leeg = []) => {
  try { return new Function(fs.readFileSync(bestand, 'utf8') + `;return ${naam}`)(); }
  catch (e) { console.log('Overgeslagen:', bestand, e.message); return leeg; }
};
const CAMPINGS = laad('data/campings.js', 'CAMPINGS');
const VERHALEN = laad('data/verhalen.js', 'VERHALEN');
const UIT = laad('data/uitrusting.js', 'UIT', {});
const TIPS = laad('data/tips.js', 'TIPS');
const PAK = laad('data/paklijst.js', 'PAK', {});
const OVER = laad('data/over.js', 'OVER', {});
const CHK = laad('data/checklists.js', 'CHK');
const INST = laad('data/instellingen.js', 'INST', {});
// Aangepaste titels en teksten uit Beheer > Paginateksten. Is er niets aangepast, dan blijft de standaardtekst staan.
const TX = (INST && INST.teksten) || {};
const tx = (k, std) => (TX[k] != null && String(TX[k]).trim() !== '') ? String(TX[k]).trim() : std;

const esc = x => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const schoon = x => String(x ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const kort = (x, n) => { x = schoon(x); return x.length > n ? x.slice(0, n - 1).replace(/\s+\S*$/, '') + '\u2026' : x; };
const slug = (t, terug = 'verhaal') => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || terug;
const abs = p => p ? (/^https?:/.test(p) ? p : `${BASE}/${String(p).replace(/^\//, '')}`) : `${BASE}/img/foto-7.jpg`;
const rel = p => p ? (/^https?:/.test(p) ? p : '../' + String(p).replace(/^\//, '')) : '';

const CSS = `:root{color-scheme:dark;--nacht:#0d1a15;--den:#17301f;--mos:#21402c;--oranje:#f08a3c;--rood:#d90f14;--room:#f6ecd6;--zacht:#c9d6c4}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--den);color:var(--room);font:17px/1.65 Nunito,system-ui,sans-serif}
h1,h2,h3{font-family:Fredoka,"Trebuchet MS",sans-serif;line-height:1.15;margin:0 0 .5em}
h1{font-size:clamp(1.9rem,4vw,2.8rem)}h3{font-size:1.2rem}
a{color:var(--oranje)}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px}
nav{position:sticky;top:0;z-index:20;background:rgba(13,26,21,.94);backdrop-filter:blur(8px);padding-top:env(safe-area-inset-top,0px)}
nav .wrap{display:flex;align-items:center;gap:18px;height:62px}
nav img{height:44px;width:44px;object-fit:contain}
nav b{font-family:Fredoka,sans-serif;font-size:1.05rem;margin-right:auto}
nav a{color:var(--room);text-decoration:none;font-weight:700;font-size:.95rem}
nav a:hover{color:var(--oranje)}nav .links{display:flex;gap:16px;flex-wrap:wrap}nav .links a{font-size:.9rem}
nav a.on{color:var(--oranje);box-shadow:0 3px 0 var(--oranje)}
main{padding:64px 0 72px;min-height:60vh}
.terug{display:inline-block;margin-bottom:18px;font-weight:700}
.lead{color:var(--zacht);max-width:62ch}
.foto{width:100%;max-height:380px;border-radius:18px;display:block;object-fit:cover;margin:0 0 18px}
.btn{display:inline-block;background:var(--oranje);color:#1a0f05;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;margin:6px 10px 0 0}
.btn.s{background:transparent;color:var(--room);border:2px solid var(--oranje);padding:10px 22px}
.feiten{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:20px 0}
.feiten div{background:var(--nacht);border-radius:14px;padding:14px 16px}.feiten small{display:block;color:var(--zacht)}
.pm{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin-bottom:18px}
.vlak{padding:26px;background:var(--nacht);border-radius:20px;border-left:6px solid var(--oranje)}
.vlak ul{margin:0;padding-left:20px}
.camp{display:flex;flex-wrap:wrap;gap:12px 14px;align-items:center;padding:16px;background:var(--den);border-radius:16px;margin-bottom:12px;text-decoration:none;color:var(--room);border:1px solid rgba(240,138,60,.25)}
.camp:hover{outline:2px solid var(--oranje)}
.camp img{width:112px;height:80px;object-fit:cover;border-radius:10px;flex:none}
.camp .cijfer{font:700 1.5rem Fredoka,sans-serif;background:var(--oranje);color:#1a0f05;border-radius:14px;min-width:56px;text-align:center;padding:6px 0}
.camp h3{margin:0;line-height:1.25}.camp h3 small{display:block;font-size:.9rem;font-weight:600;color:var(--oranje);margin-top:2px}
.camp p{margin:6px 0 0;font-size:1rem;line-height:1.5;color:var(--zacht)}
.camp .cijfer{flex:none}.camp>div:last-child{flex:1 1 240px}
.ruit{height:48px;background:repeating-conic-gradient(#fff 0 25%,var(--rood) 0 50%) 0 0/48px 48px}
footer{background:#070f0b;padding:44px 0;text-align:center;color:var(--zacht)}
footer img{height:90px}footer p{margin:.6em 0}
body.mos{background:var(--mos)}body.nacht{background:var(--nacht)}
.menuknop{display:none;font:inherit;background:none;border:2px solid var(--oranje);color:var(--room);border-radius:10px;padding:6px 12px;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px;margin-top:28px}
.kaart{background:var(--nacht);border-radius:20px;overflow:hidden;border:2px solid rgba(240,138,60,.35)}
.kaart img{width:100%;height:190px;object-fit:cover;display:block}
.kaart div{padding:20px}
.kaart h3{font-size:1.3rem}
.kaart p{margin:.3em 0 0;color:var(--zacht);font-size:.97rem}
.kaart .btn{margin-top:14px}
.blok{display:grid;border:2px solid var(--oranje);border-radius:18px;overflow:hidden;margin-bottom:18px;background:var(--nacht)}
.blok.met{grid-template-columns:1fr 2fr}.blok.met.r{grid-template-columns:2fr 1fr}.blok.r .ft{order:2}
.blok.kop{grid-template-columns:1fr}.blok.kop .ft img{height:380px}
.blok.vol{background:var(--oranje);color:#1a0f05}.blok.vol h2,.blok.vol h3,.blok.vol p{color:#1a0f05}
.tk{padding:22px 26px}.tk h2{font-size:1.6rem}.tk h3{font-size:1.35rem}.tk p{margin:0 0 1em;font-size:1.05rem}.tk p:last-child{margin:0}
.ft{margin:0;display:flex;flex-direction:column;min-height:200px}.ft img{flex:1;min-height:180px;width:100%;object-fit:cover;display:block}
.ft figcaption{padding:8px 14px;font-size:.9rem;line-height:1.4;color:var(--zacht);background:var(--nacht)}
.vfoto2{margin:0 0 18px}.vfoto2 img{width:100%;max-height:480px;object-fit:cover;border-radius:18px;display:block}.vfoto2 figcaption{padding:7px 4px 0;color:var(--zacht);font-size:.95rem}
.duo{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}.duo .blok{margin-bottom:0}.duo .blok.kop .ft img{height:220px}
.car{margin:6px 0 24px}.ckop{font-size:1.35rem;margin:.2em 0 .6em}.cw{position:relative}
.rij{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:14px;scrollbar-color:var(--oranje) var(--nacht)}
.rij::-webkit-scrollbar{height:12px}.rij::-webkit-scrollbar-track{background:var(--nacht);border-radius:99px}.rij::-webkit-scrollbar-thumb{background:var(--oranje);border-radius:99px}
.rij figure{margin:0;flex:0 0 calc((100% - 28px)/3);scroll-snap-align:start}
.rij img{width:100%;height:210px;object-fit:cover;border-radius:14px;display:block}.rij figcaption{padding:6px 4px 0;color:var(--zacht);font-size:.9rem;line-height:1.35}
.pijl{position:absolute;top:83px;width:44px;height:44px;border:0;border-radius:50%;background:rgba(240,138,60,.95);color:#1a0f05;font:700 1.6rem/1 Fredoka,sans-serif;cursor:pointer;display:none;place-items:center;z-index:2}
.pijl.p{left:8px}.pijl.n{right:8px}.car.scroll .pijl{display:grid}
.brij{grid-column:1/-1;order:3;padding:0 26px 24px;display:grid;gap:14px}.brij .car{margin:0}.blok.vol .rij figcaption{color:#1a0f05}.blok.vol .rij{scrollbar-color:var(--nacht) rgba(0,0,0,.2)}.blok.vol .rij::-webkit-scrollbar-track{background:rgba(0,0,0,.2)}.blok.vol .rij::-webkit-scrollbar-thumb{background:var(--nacht)}.duo .rij figure{flex-basis:calc((100% - 14px)/2)}
@media(max-width:760px){.blok.met,.blok.met.r,.duo{grid-template-columns:1fr}.blok.r .ft{order:0}.ft img,.blok.kop .ft img{height:230px;flex:none}.rij figure{flex-basis:80%}.pijl{top:83px}}
.tk h1{font-size:1.6rem}.kaart h3 a{color:var(--room);text-decoration:none}.kaart h3 a:hover{color:var(--oranje)}
.ck-bar{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9999;max-width:760px;margin:0 auto;background:var(--den);border:2px solid var(--oranje);border-radius:22px;padding:18px 22px;box-shadow:0 12px 40px rgba(0,0,0,.6);color:var(--room)}
.ck-bar[hidden]{display:none}
.ck-bar h2{font-size:1.35rem;margin:0 0 .35em}
.ck-bar p{margin:0 0 .7em;font-size:1rem;line-height:1.45}
.ck-bar details{margin:0 0 .9em;color:var(--zacht);font-size:.93rem;line-height:1.45}
.ck-bar summary{cursor:pointer;font-weight:700;color:var(--oranje)}
.ck-bar details p{margin:.5em 0 0;font-size:.93rem}
.ck-knoppen{display:flex;flex-wrap:wrap;gap:10px}
.ck-knop{font:700 1rem Nunito,sans-serif;text-decoration:none;text-align:center;cursor:pointer;border-radius:999px;padding:12px 22px;border:2px solid var(--oranje);flex:1 1 150px;display:inline-block;box-sizing:border-box}
.ck-knop.ja{background:var(--oranje);color:#1a0f05}
.ck-knop.nee{background:var(--mos);color:var(--room)}
.ck-link{background:none;border:0;padding:0;margin-top:8px;font:inherit;color:var(--zacht);text-decoration:underline;cursor:pointer}
@media(max-width:900px){.menuknop{display:block}nav .wrap{flex-wrap:wrap;height:auto;min-height:62px}nav .links{display:none;width:100%;flex-direction:column;gap:0;padding-bottom:10px}nav .links.open{display:flex}nav .links a{display:block;padding:12px 4px;border-top:1px solid rgba(255,255,255,.12)}}
.vlak h2{font-size:1.25rem}
.twee{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
@media(max-width:800px){.twee{grid-template-columns:1fr}}
.fotos{display:grid;gap:16px}.fotos .foto{margin:0;max-height:none}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 8px}
.chips a{border:2px solid var(--oranje);border-radius:999px;padding:8px 18px;text-decoration:none;color:var(--room);font-weight:700}
.chips a:hover,.chips a.on{background:var(--oranje);color:#1a0f05}
.sub{margin-top:38px;scroll-margin-top:80px}.sub>h2{font-size:1.6rem;color:var(--oranje)}
.pgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:18px}
@media(max-width:900px){.pgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.pgrid{grid-template-columns:1fr}}
.pk{background:var(--nacht);border:1px solid rgba(240,138,60,.35);border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:10px;overflow:hidden}
.pk img{width:100%;height:210px;object-fit:contain;background:#fff;border-radius:12px}
.pk b{line-height:1.3}
.pk .btn{margin:auto 0 0;text-align:center;padding:10px 18px}
.kc{font-size:.9rem;color:var(--zacht)}
.overig{margin-top:30px;padding:26px 28px;background:var(--nacht);border:2px solid var(--oranje);border-radius:20px}
.overig h3{font-size:1.5rem;color:var(--oranje);margin:0 0 .15em}
.overig .klein{margin:0 0 16px}
.overig ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:4px 28px}
.overig li{position:relative;padding:9px 0 9px 26px;font-size:1.15rem;line-height:1.4;border-bottom:1px solid rgba(240,138,60,.2)}
.overig li::before{content:"";position:absolute;left:4px;top:1.05em;width:10px;height:10px;border-radius:50%;background:var(--oranje)}
.klein{color:var(--zacht);font-size:.9rem}
.voortgang{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:18px}
.balk{flex:1;min-width:180px;height:14px;background:var(--nacht);border-radius:99px;overflow:hidden}
.balk i{display:block;height:100%;width:0;background:var(--oranje);transition:width .25s}
.lijst{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:26px}
.cat{background:var(--nacht);border-radius:20px;padding:22px 24px}
.cat h2,.cat h3{font-size:1.25rem;color:var(--oranje)}
.cat label{display:flex;gap:12px;align-items:flex-start;padding:5px 0;cursor:pointer}
.cat input{accent-color:var(--oranje);width:20px;height:20px;margin-top:3px;flex:none}
.cat input:checked+span{text-decoration:line-through;opacity:.55}
.ukop{margin-top:56px;padding-top:36px;border-top:2px dashed rgba(240,138,60,.4)}
.uk{background:var(--den);border:2px solid rgba(240,138,60,.5);border-radius:18px;padding:18px 20px;margin:14px 0}
.uk summary{cursor:pointer;list-style:none}.uk summary::-webkit-details-marker{display:none}
.uk summary b{display:block;font:700 1.3rem Fredoka,sans-serif}.uk summary small{color:var(--zacht)}
.uk[open] summary{margin-bottom:6px}
.deel{background:var(--nacht);padding:22px 0;text-align:center;border-top:1px solid rgba(246,236,214,.12)}
.deel p{margin:0 0 10px;font-family:Fredoka,sans-serif;font-size:1.05rem}
.deel .dk{display:inline-block;margin:4px;padding:10px 18px;border-radius:999px;border:2px solid var(--oranje);background:var(--mos);color:var(--room);font:700 .95rem Nunito,sans-serif;text-decoration:none;cursor:pointer}
.deel .dk:hover,.deel .dk:focus-visible{background:var(--oranje);color:#1a0f05}`;

const COOKIEJS = `var CKEY='dennenappeltjes-cookies';function ckRead(){try{var r=localStorage.getItem(CKEY)||sessionStorage.getItem(CKEY);return r?JSON.parse(r):null}catch(e){return null}}function ckSave(o){try{var j=JSON.stringify(o);if(o.stat||o.vid){localStorage.setItem(CKEY,j);sessionStorage.removeItem(CKEY)}else{sessionStorage.setItem(CKEY,j);localStorage.removeItem(CKEY)}}catch(e){}}function ckOk(k){var c=ckRead();return !!(c&&c[k])}
var GC_CODE='dennenappeltjes';
window.goatcounter={no_onload:true};
function gcCount(p,t,e){try{if(GC_CODE&&ckOk('stat')&&window.goatcounter&&goatcounter.count)goatcounter.count({path:p,title:t||p,event:!!e})}catch(x){}}
function gcPage(){gcCount(location.pathname,document.title)}
window.startGC=function(){if(window.__gcs)return;window.__gcs=1;var h=location.hostname;if(!GC_CODE||h==='localhost'||h==='127.0.0.1'||!h)return;
var s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.setAttribute('data-goatcounter','https://'+GC_CODE+'.goatcounter.com/count');s.onload=gcPage;document.head.appendChild(s);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-gcn]');if(a)gcCount('/klik/'+a.getAttribute('data-gcn'),'Klik: '+a.getAttribute('data-gcn'),1)})};
(function(){
var b=document.createElement('div');b.className='ck-bar';b.setAttribute('role','dialog');b.setAttribute('aria-label','Cookies');b.hidden=true;
b.innerHTML='<h2>Deze cookies zijn niet voor bij de koffie en laten ook geen kruimels achter in de caravan. 🍪</h2>'
+'<details><summary>Benieuwd wat er gebeurt? <u>Lees hier</u>.</summary><p><b>Alles accepteren:</b> GoatCounter wordt gestart om bezoekstatistieken bij te houden. YouTube-video’s worden pas ingeladen wanneer je daarvoor kiest; YouTube kan daarbij gegevens ontvangen en eventueel cookies of vergelijkbare technieken gebruiken. <b>Alleen noodzakelijk:</b> GoatCounter wordt niet gestart en ingesloten YouTube-video’s blijven uit. Als je bij een video op afspelen drukt, wordt YouTube alsnog geladen. Kies je dit, dan vragen we het bij je volgende bezoek opnieuw. <b>Paklijst:</b> je paklijst wordt lokaal op je eigen toestel bewaard, zodat die blijft werken zonder optionele onderdelen. De website gebruikt ook externe Google Fonts; je browser kan daarvoor verbinding maken met Google wanneer de pagina wordt geladen. Je kunt je keuze later aanpassen via Cookie-instellingen onderaan de pagina. Lees ook onze <a href="../cookieverklaring.html">cookieverklaring</a> en <a href="../privacyverklaring.html">privacyverklaring</a>.</p></details>'
+'<div class="ck-knoppen"><button type="button" class="ck-knop ja" data-ck="ja">Alles accepteren</button><button type="button" class="ck-knop nee" data-ck="nodig">Alleen noodzakelijk</button></div>';
document.body.appendChild(b);
function kies(c){ckSave(c);b.hidden=true;if(c.stat&&window.startGC)startGC()}
document.addEventListener('click',function(e){
var t=e.target.closest?e.target:e.target.parentNode;if(!t||!t.closest)return;
if(t.closest('[data-ck="ja"]')){kies({stat:1,vid:1});return}
if(t.closest('[data-ck="nodig"]')){kies({stat:0,vid:0});return}
if(t.closest('[data-ckopen]')){b.hidden=false;return}
var k=t.closest('[data-kc]');if(k){var c=k.getAttribute('data-kc'),d=function(){k.textContent='Gekopieerd'};gcCount('/code/'+c,'Code gekopieerd: '+c,1);try{navigator.clipboard.writeText(c).then(d,d)}catch(x){d()}}
});
var c0=ckRead();if(!c0)b.hidden=false;else if(c0.stat&&window.startGC)startGC();
})();`;

function pagina({ titel, beschrijving, pad, afbeelding, body, jsonld, actief, achter = '', script = '' }) {
  const volledig = `${titel} | ${SITE}`;
  const link = (h, t, k) => `<a href="${h}"${actief === k ? ' class="on"' : ''}>${t}</a>`;
  return `<!DOCTYPE html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(volledig)}</title>
<meta name="description" content="${esc(beschrijving)}">
<link rel="canonical" href="${BASE}/${pad}">
<link rel="icon" type="image/png" href="/favicon.png">
<meta property="og:type" content="article"><meta property="og:site_name" content="${esc(SITE)}">
<meta property="og:title" content="${esc(volledig)}"><meta property="og:description" content="${esc(beschrijving)}">
<meta property="og:url" content="${BASE}/${pad}"><meta property="og:image" content="${esc(abs(afbeelding))}">
<meta name="twitter:card" content="summary_large_image">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Nunito:wght@400;700&display=swap">
<style>${CSS}</style></head><body class="${achter}">
<nav><div class="wrap"><a href="../index.html" style="display:flex"><img src="../img/logo.png" alt="Home"></a><b>d'n Dennenappeltjes</b><button class="menuknop" id="mk" aria-expanded="false" aria-controls="lk">Menu</button><div class="links" id="lk">${link('../index.html', 'Home', 'home')}${link('../over-ons/', 'Over ons', 'over')}${link('../paklijst/', 'Wat neem je mee', 'paklijst')}${link('../uitrusting/', 'Uitrusting', 'uitrusting')}${link('../campings/', 'Campings', 'campings')}${link('../verhalen/', 'Verhalen', 'verhalen')}${link('../tips/', 'Tips', 'tips')}${link('../index.html#fotos', "Foto's", 'fotos')}${link('../index.html#videos', "Video's", 'videos')}${link('../index.html#contact', 'Contact', 'contact')}</div></div></nav>
<main><div class="wrap">
${body}
</div></main>
<div class="ruit"></div>
<div class="deel"><div class="wrap"><p>Deel deze pagina met andere kampeerders</p><a class="dk" id="dwa" target="_blank" rel="noopener">WhatsApp</a><button type="button" class="dk" id="dsh" hidden>Delen</button><button type="button" class="dk" id="dkp">Link kopi\u00ebren</button></div></div>
<footer><div class="wrap"><img src="../img/logo.png" alt="${esc(SITE)}"><p>Kamperen met d'n Dennenappeltjes. Samen op pad, in elk seizoen.</p><p>${VERSIE}<button type="button" class="ck-link" data-ckopen>Cookie-instellingen</button> &middot; <a href="../privacyverklaring.html">Privacyverklaring</a> &middot; <a href="../cookieverklaring.html">Cookieverklaring</a></p></div></footer>
<script>${COOKIEJS}</script>
<script>var mk=document.getElementById('mk'),lk=document.getElementById('lk');mk.onclick=function(){var o=lk.classList.toggle('open');mk.setAttribute('aria-expanded',o)};(function(){var a=document.getElementById('dwa'),sh=document.getElementById('dsh'),kp=document.getElementById('dkp');if(!a)return;a.href='https://wa.me/?text='+encodeURIComponent(document.title+' '+location.href);if(navigator.share){sh.hidden=false;sh.onclick=function(){navigator.share({title:document.title,url:location.href}).catch(function(){})}}kp.onclick=function(){var t=kp.textContent;function ok(){kp.textContent='Gekopieerd!';setTimeout(function(){kp.textContent=t},1800)}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(location.href).then(ok,function(){})}else{var i=document.createElement('input');i.value=location.href;document.body.appendChild(i);i.select();try{document.execCommand('copy');ok()}catch(e){}i.remove()}}})();${script}</script>
</body></html>
`;
}

const NAARBOVEN = `<p style="margin-top:32px"><a class="btn s" href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false">Terug naar boven</a></p>`;
// Versienummer overnemen uit index.html (dezelfde plek als in de footer van de home page)
let VERSIE = '';
try { const m = fs.readFileSync('index.html', 'utf8').match(/<small>\s*(versie\s*[\w.]+)\s*<\/small>/i); if (m) VERSIE = `<small>${m[1]}</small><br>`; } catch (e) {}
const lijst = a => Array.isArray(a) && a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';

const MAPPEN = ['campings', 'verhalen', 'uitrusting', 'paklijst', 'tips', 'over-ons'];
for (const dir of MAPPEN) { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); }
const urls = [['', 1.0], ['campings/', 0.8], ['verhalen/', 0.7], ['uitrusting/', 0.8], ['paklijst/', 0.8], ['tips/', 0.7], ['over-ons/', 0.6], ['privacyverklaring.html', 0.2], ['cookieverklaring.html', 0.2]];

// ---- campings
for (const c of CAMPINGS) {
  if (!c.id) continue;
  const feiten = [['Plaatsnummer', c.plaatsnr], ['Stroom', c.stroom ? c.stroom + ' A' : ''], ['Oppervlakte', c.opp ? c.opp + ' m\u00b2' : ''], ['Water op de plaats', c.water], ['Afvoer op de plaats', c.afvoer]].filter(x => x[1]).concat(Object.entries(c.info || {})).filter(x => x[1]);
  const naamPlaats = c.plaats && !String(c.naam).toLowerCase().includes(String(c.plaats).split(',')[0].toLowerCase()) ? `${c.naam} in ${c.plaats}` : c.naam;
  const plaatsKort = c.plaats ? c.plaats.split(',')[0] : '';
  const titel = `${c.naam} | onze ervaring${plaatsKort && !String(c.naam).toLowerCase().includes(plaatsKort.toLowerCase()) ? ' in ' + plaatsKort : ''}`;
  const beschrijving = kort(`${c.naam}${c.plaats ? ' (' + c.plaats + ')' : ''}: ${c.tekst || ''}`, 158);
  const body = `<a class="terug" href="./">Terug naar alle campings</a>
<h1>${esc(c.naam)}</h1>
${c.foto ? `<img class="foto" src="${esc(rel(c.foto))}" alt="${esc(naamPlaats)}">` : ''}
<p class="lead">${esc([c.plaats, c.type, c.cijfer ? 'Ons cijfer: ' + c.cijfer : ''].filter(Boolean).join(' \u00b7 '))}</p>
<p class="lead">${esc(c.tekst || '')}</p>
${c.url ? `<p><a class="btn" href="${esc(c.url)}" target="_blank" rel="noopener nofollow">Naar de website</a></p>` : ''}
${feiten.length ? `<div class="feiten">${feiten.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
${(c.plus && c.plus.length) || (c.min && c.min.length) ? `<div class="pm"><div class="vlak"><h3>Dit vonden we fijn</h3>${lijst(c.plus)}</div><div class="vlak"><h3>Dit kan beter</h3>${lijst(c.min)}</div></div>` : ''}
<p><a class="btn s" href="./">Alle campings</a></p>`;
  const jsonld = c.cijfer ? {
    '@context': 'https://schema.org', '@type': 'Review',
    itemReviewed: { '@type': 'Campground', name: c.naam, ...(c.plaats ? { address: c.plaats } : {}), ...(c.url ? { url: c.url } : {}) },
    reviewRating: { '@type': 'Rating', ratingValue: c.cijfer, bestRating: 10, worstRating: 1 },
    author: { '@type': 'Organization', name: SITE }, reviewBody: schoon(c.tekst)
  } : null;
  fs.writeFileSync(`campings/${c.id}.html`, pagina({ titel, beschrijving, pad: `campings/${c.id}.html`, afbeelding: c.foto, body, jsonld, actief: 'campings' }));
  urls.push([`campings/${c.id}.html`, 0.7]);
}
fs.writeFileSync('campings/index.html', pagina({
  titel: 'Onze campings: ervaringen en cijfers',
  beschrijving: `Alle ${CAMPINGS.length} campings en vakantieparken waar wij met ons gezin en de caravan zijn geweest, met ons cijfer en wat wel en niet beviel.`,
  pad: 'campings/', afbeelding: (CAMPINGS[0] || {}).foto, actief: 'campings',
  body: `<h1>${esc(tx('campings.h2', 'Onze campings'))}</h1>
<p class="lead">${esc(tx('campings.lead', 'Dit zijn de campings en vakantieparken waar wij met ons gezin en de caravan zijn geweest. Bij elke camping lees je ons cijfer, wat wij fijn vonden en wat beter kon.'))}</p>
<div style="margin-top:22px">${CAMPINGS.filter(c => c.id).map(c => `<a class="camp" href="${esc(c.id)}.html">${c.foto ? `<img src="${esc(rel(c.foto))}" alt="" loading="lazy">` : ''}<div class="cijfer">${esc(c.cijfer || '\u2013')}</div><div><h3>${esc(c.naam)} <small>${esc(c.plaats || '')}</small></h3><p>${esc(kort(c.tekst, 160))}</p></div></a>`).join('')}</div>
${NAARBOVEN}`
}));

// ---- verhalen (zelfde opbouw als op de website: kaarten, en bij een uitgebreid verhaal blokken met foto's)
const par = t => String(t || '').split('\n').map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('');
const heeftLang = v => !!(v.lang && String(v.lang).trim());
function verhaalBlokken(v) {
  const fo = Array.isArray(v.fotos) ? v.fotos : [], used = {}, B = [], nb = () => ({ kop: '', p: [], f: null, rows: [] });
  let c = nb();
  const push = () => { if (c.kop || c.p.length || c.f != null || c.rows.length) B.push(c); c = nb(); };
  const take = g => {
    const r = [], add = n => { if (n >= 0 && fo[n] && fo[n].src && !used[n]) { used[n] = 1; r.push(n); } };
    g.replace(/\s*[-\u2013]\s*/g, '-').split(/[\s,;]+/).forEach(t => {
      let m;
      if (m = t.match(/^(\d+)-(\d+)$/)) {
        let a = +m[1], b = +m[2];
        if (a <= b) { b = Math.min(b, fo.length); for (let n = a; n <= b; n++) add(n - 1); }
        else { a = Math.min(a, fo.length); for (let n = a; n >= b; n--) add(n - 1); }
      } else if (/^\d+$/.test(t)) add(t - 1);
    });
    return r;
  };
  String(v.lang || '').split('\n').map(x => x.trim()).filter(Boolean).forEach(x => {
    let m;
    if (m = x.match(/^\[(foto|fotos|rij)\s*([\d\s,;\-\u2013]+)\]$/i)) {
      const k = m[1].toLowerCase(), g = m[2].trim();
      if (k == 'foto' && /^\d+$/.test(g)) { const n = g - 1; if (fo[n] && fo[n].src && !used[n]) { used[n] = 1; if (c.f != null) push(); c.f = n; } }
      else {
        const r = take(g);
        if (r.length) {
          if (k == 'rij') { let kop = ''; if (c.kop && !c.p.length && c.f == null && !c.rows.length) { kop = c.kop; c = nb(); } else push(); B.push({ car: r, kop }); }
          else if (c.kop || c.p.length || c.f != null || c.rows.length) c.rows.push(r);
          else B.push({ car: r, kop: '' });
        }
      }
    }
    else if (/^\[naast\]$/i.test(x)) { push(); if (B.length && !B[B.length - 1].car) B[B.length - 1].duo = 1; }
    else if (m = x.match(/^##(?:\s+(.*))?$/)) { push(); c.kop = (m[1] || '').trim(); }
    else c.p.push(x);
  });
  push();
  const im = n => `<img src="${esc(rel(fo[n].src))}" alt="${esc(fo[n].tekst || v.titel)}" loading="lazy">`;
  const cap = n => fo[n].tekst ? `<figcaption>${esc(fo[n].tekst)}</figcaption>` : '';
  const carH = (r, kop) => `<div class="car">${kop ? `<h2 class="ckop">${esc(kop)}</h2>` : ''}<div class="cw"><button type="button" class="pijl p" aria-label="Vorige">\u2039</button><div class="rij">${r.map(n => `<figure>${im(n)}${cap(n)}</figure>`).join('')}</div><button type="button" class="pijl n" aria-label="Volgende">\u203a</button></div></div>`;
  let t = 0, side = 0, o = '', open = 0;
  B.forEach(b => {
    if (b.car) { if (open) { o += '</div>'; open = 0; } o += carH(b.car, b.kop); return; }
    if (b.f != null && !b.kop && !b.p.length && !b.rows.length) { if (open) { o += '</div>'; open = 0; } o += `<figure class="vfoto2">${im(b.f)}${cap(b.f)}</figure>`; return; }
    const vol = t++ % 2 == 0, hf = b.f != null, inDuo = open || b.duo, r = !inDuo && hf && (side++ % 2 == 1);
    if (!open && b.duo) { o += '<div class="duo">'; open = 1; }
    o += `<article class="blok ${hf ? (inDuo ? 'kop' : 'met') : ''} ${r ? 'r' : ''} ${vol ? 'vol' : ''}">${hf ? `<figure class="ft">${im(b.f)}${cap(b.f)}</figure>` : ''}<div class="tk">${b.kop ? `<h2>${esc(b.kop)}</h2>` : ''}${b.p.map(x => `<p>${esc(x)}</p>`).join('')}</div>${b.rows.length ? `<div class="brij">${b.rows.map(r => carH(r, '')).join('')}</div>` : ''}</article>`;
    if (open && !b.duo) { o += '</div>'; open = 0; }
  });
  if (open) o += '</div>';
  return o;
}
const VERHAALSCRIPT = `function pijlen(){[].forEach.call(document.querySelectorAll('.car'),function(c){var r=c.querySelector('.rij');c.querySelector('.p').onclick=function(){r.scrollBy({left:-r.clientWidth,behavior:'smooth'})};c.querySelector('.n').onclick=function(){r.scrollBy({left:r.clientWidth,behavior:'smooth'})};c.classList.toggle('scroll',r.scrollWidth>r.clientWidth+4)})}
pijlen();addEventListener('resize',pijlen);setTimeout(pijlen,300);`;
const gebruikt = [];
VERHALEN.forEach(v => {
  const b = slug(v.titel); let id = b, n = 2;
  while (gebruikt.includes(id)) id = b + '-' + n++;
  gebruikt.push(id);
  const kop = `<article class="blok kop vol">${v.foto ? `<figure class="ft"><img src="${esc(rel(v.foto))}" alt="${esc(v.titel)}"></figure>` : ''}<div class="tk"><h1>${esc(v.titel)}</h1>${par(v.tekst)}</div></article>`;
  const body = `<a class="terug" href="./">Terug naar alle verhalen</a>
${kop}
${heeftLang(v) ? verhaalBlokken(v) : ''}
<p><a class="btn s" href="./">Alle verhalen</a></p>`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'Article', headline: schoon(v.titel), description: kort(v.tekst, 200), image: abs(v.foto), author: { '@type': 'Organization', name: SITE }, mainEntityOfPage: `${BASE}/verhalen/${id}.html` };
  fs.writeFileSync(`verhalen/${id}.html`, pagina({ titel: schoon(v.titel), beschrijving: kort(v.tekst, 158) || `Een verhaal van ${SITE}.`, pad: `verhalen/${id}.html`, afbeelding: v.foto, body, jsonld, actief: 'verhalen', achter: 'mos', script: heeftLang(v) ? VERHAALSCRIPT : '' }));
  urls.push([`verhalen/${id}.html`, 0.6]);
});
fs.writeFileSync('verhalen/index.html', pagina({
  titel: 'Verhalen van onze kampeertrips',
  beschrijving: 'Korte verslagen van onze kampeertrips en uitjes met de caravan.',
  pad: 'verhalen/', afbeelding: (VERHALEN[0] || {}).foto, actief: 'verhalen', achter: 'mos',
  body: `<h1>${esc(tx('verhalen.h2', 'Verhalen van onze avonturen'))}</h1><p class="lead">${esc(tx('verhalen.lead', 'Korte verslagen van onze trips en uitjes.'))}</p>
<div class="grid">${VERHALEN.map((v, i) => `<article class="kaart">${v.foto ? `<img src="${esc(rel(v.foto))}" alt="${esc(v.titel)}" loading="lazy">` : ''}<div><h3><a href="${gebruikt[i]}.html">${esc(v.titel)}</a></h3>${par(v.tekst)}${heeftLang(v) ? `<a class="btn" href="${gebruikt[i]}.html">Lees meer</a>` : ''}</div></article>`).join('')}</div>
`
}));

// ---- uitrusting (een pagina per categorie)
const cap = s => { s = schoon(s); return s.charAt(0).toUpperCase() + s.slice(1); };
const opschonen = u => {
  try {
    const x = new URL(u);
    [...x.searchParams.keys()].forEach(k => { if (/^(utm_|gad_|gclid$|gclsrc$|gbraid$|wbraid$|fbclid$|_gl$|referrer$)/i.test(k)) x.searchParams.delete(k); });
    return x.toString();
  } catch (e) { return u; }
};
const uniekId = (b, gebruiktLijst) => { let id = b, n = 2; while (gebruiktLijst.includes(id)) id = b + '-' + n++; gebruiktLijst.push(id); return id; };
const product = q => `<div class="pk">${q.foto ? `<img src="${esc(rel(q.foto))}" alt="${esc(q.n)}" loading="lazy">` : ''}<b>${esc(q.n)}</b>${q.code ? `<div class="kc">Kortingscode: <b>${esc(q.code)}</b> <button type="button" data-kc="${esc(q.code)}">Kopieer</button></div>` : ''}${/^https?:\/\//.test(q.url || '') ? `<a class="btn" href="${esc(opschonen(q.url))}" target="_blank" rel="noopener noreferrer sponsored" data-gcn="${esc(q.n)}">Bekijk / koop</a>` : ''}</div>`;

const catIds = [];
const UITCATS = [];
for (const [catNaam, subs] of Object.entries(UIT || {})) {
  const subLijst = [];
  const subIds = [];
  for (const [subNaam, v] of Object.entries(subs || {})) {
    const t = typeof v === 'string' ? v : (v && v.t) || '';
    const p = ((v && v.p) || []).filter(q => q && q.n);
    const ov = String(t).split(/\s*(?:,(?!\d)|\n)\s*/).map(schoon).filter(Boolean);
    if (!p.length && !ov.length) continue;
    subLijst.push({ naam: cap(subNaam), id: uniekId(slug(subNaam, 'onderdeel'), subIds), p, ov });
  }
  if (!subLijst.length) continue;
  UITCATS.push({ naam: catNaam, id: uniekId(slug(catNaam, 'uitrusting'), catIds), subs: subLijst });
}

// Toont per uitrustingspagina maar één onderdeel tegelijk (Koken of Servies, niet allebei onder elkaar)
const SUBTABS = "var ss=[].slice.call(document.querySelectorAll('section.sub')),cs=[].slice.call(document.querySelectorAll('.chips a'));function toon(){var h=decodeURIComponent((location.hash||'').slice(1)),f=ss.filter(function(x){return x.id==h})[0]||ss[0];ss.forEach(function(x){x.hidden=x!==f});cs.forEach(function(x){x.classList.toggle('on',x.getAttribute('href')=='#'+f.id)})}if(ss.length>1){window.addEventListener('hashchange',toon);toon()}";

for (const c of UITCATS) {
  const aantal = c.subs.reduce((n, s) => n + s.p.length + s.ov.length, 0);
  const foto = (c.subs.flatMap(s => s.p).find(q => q.foto) || {}).foto;
  const namen = c.subs.map(s => s.naam.toLowerCase()).join(', ');
  const beschrijving = kort(`${c.naam}: onze uitrusting voor de caravan en voortent. Dit gebruiken wij: ${namen}. Met foto's en links.`, 158);
  const secties = c.subs.map(s => `<section class="sub" id="${s.id}">
<h2>${esc(s.naam)}</h2>
${s.p.length ? `<div class="pgrid">${s.p.map(product).join('')}</div>` : ''}
${s.ov.length ? `<div class="overig"><h3>Overige spullen</h3><p class="klein">${s.p.length ? 'Hier hebben we geen afbeelding of link van, maar dit gebruiken we ook.' : 'Dit gebruiken wij hiervoor.'}</p><ul>${s.ov.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
</section>`).join('\n');
  const body = `<a class="terug" href="./">Terug naar alle uitrusting</a>
<h1>${esc(c.naam)}: onze uitrusting</h1>
<p class="lead">Dit is onze uitrusting in de categorie ${esc(c.naam.toLowerCase())}, zoals wij die gebruiken als we met de caravan op pad gaan. De links gaan naar webshops van andere partijen.</p>
${c.subs.length > 1 ? `<div class="chips">${c.subs.map(s => `<a href="#${s.id}">${esc(s.naam)}</a>`).join('')}</div>` : ''}
${secties}
${NAARBOVEN}`;
  const items = c.subs.flatMap(s => s.p).map((q, i) => ({ '@type': 'ListItem', position: i + 1, name: schoon(q.n) }));
  const jsonld = items.length ? { '@context': 'https://schema.org', '@type': 'ItemList', name: `${c.naam}: onze uitrusting`, itemListElement: items } : null;
  fs.writeFileSync(`uitrusting/${c.id}.html`, pagina({ titel: `${c.naam}: onze uitrusting voor de caravan`, beschrijving, pad: `uitrusting/${c.id}.html`, afbeelding: foto, body, jsonld, actief: 'uitrusting', achter: 'nacht', script: SUBTABS }));
  urls.push([`uitrusting/${c.id}.html`, 0.7]);
}
fs.writeFileSync('uitrusting/index.html', pagina({
  titel: 'Onze uitrusting voor caravan en voortent',
  beschrijving: kort(`Wat er bij ons in de caravan en de voortent zit, per onderdeel: ${UITCATS.map(c => c.naam.toLowerCase()).join(', ')}.`, 158),
  pad: 'uitrusting/', afbeelding: ((UITCATS[0] || { subs: [] }).subs.flatMap(s => s.p).find(q => q.foto) || {}).foto, actief: 'uitrusting', achter: 'nacht',
  body: `<h1>${esc(tx('uitrusting.h2', 'Onze uitrusting'))}</h1>
<p class="lead">${esc(tx('uitrusting.lead', 'Wat er bij ons in de caravan en de voortent zit, per onderdeel. Zo zie je welke uitrusting voor kamperen met het gezin bij ons in de praktijk werkt.') + ' ' + tx('uitrusting.lead2', 'Dit is wat wij zelf gebruiken. De links gaan naar webshops van andere partijen.'))}</p>
<div style="margin-top:22px">${UITCATS.map(c => { const f = (c.subs.flatMap(s => s.p).find(q => q.foto) || {}).foto; return `<a class="camp" href="${c.id}.html">${f ? `<img src="${esc(rel(f))}" alt="" loading="lazy">` : ''}<div><h3>${esc(c.naam)}</h3><p>${esc(kort(c.subs.map(s => s.naam).join(', '), 160))}</p></div></a>`; }).join('')}</div>
`
}));

// ---- paklijst (zelfde vinkjes als op de website: opslag 'pak' en 'pakx')
const PAKCATS = Object.entries(PAK || {}).map(([k, a]) => [schoon(k), (Array.isArray(a) ? a : []).filter(x => schoon(x))]).filter(([, a]) => a.length);
const PAKAANTAL = PAKCATS.reduce((n, [, a]) => n + a.length, 0);
const CHKLIJST = (Array.isArray(CHK) ? CHK : []).filter(c => c && c.id && Array.isArray(c.cats));
const vink = (attr, waarde, tekst) => `<label><input type="checkbox" ${attr}="${esc(waarde)}"><span>${esc(tekst)}</span></label>`;
const voortgang = (n, wis) => `<div class="voortgang"><div class="balk"><i></i></div><b class="tel">0 van ${n} ingepakt</b><button class="btn" type="button" style="border:0;cursor:pointer;font:inherit;font-weight:700">${wis}</button></div>`;
const PAKSCRIPT = `function maak(box,sleutel,attr,vol){var bx=[].slice.call(box.querySelectorAll('input')),balk=box.querySelector('.balk i'),tel=box.querySelector('.tel'),wis=box.querySelector('button.btn'),st={};
try{st=JSON.parse(localStorage.getItem(sleutel)||'{}')}catch(e){}
function upd(){var n=0;bx.forEach(function(b){var k=b.getAttribute(attr);if(b.checked)n++;if(vol)st[k]=b.checked;else if(b.checked)st[k]=true;else delete st[k]});
balk.style.width=(bx.length?100*n/bx.length:0)+'%';tel.textContent=n+' van '+bx.length+' ingepakt';try{localStorage.setItem(sleutel,JSON.stringify(st))}catch(e){}}
bx.forEach(function(b){b.checked=!!st[b.getAttribute(attr)];b.onchange=upd});wis.onclick=function(){bx.forEach(function(b){b.checked=false});upd()};upd()}
maak(document.getElementById('pakbox'),'pak','data-k',true);
[].forEach.call(document.querySelectorAll('.uk'),function(d){maak(d,'pakx','data-xk',false)});`;
fs.writeFileSync('paklijst/index.html', pagina({
  titel: 'Paklijst voor de caravan: wat neem je mee?',
  beschrijving: kort(`Onze paklijst voor kamperen met de caravan: ${PAKAANTAL} dingen in ${PAKCATS.length} onderdelen, van vertrek en slapen tot koken en kinderen${CHKLIJST.length ? ', plus uitgebreide checklists per seizoen' : ''}. Zo vergeet je niets.`, 158),
  pad: 'paklijst/', afbeelding: '', actief: 'paklijst', achter: 'mos', script: PAKSCRIPT,
  body: `<h1>${esc(tx('meenemen.h2', 'Wat neem je mee'))}</h1>
<p class="lead">${esc(tx('meenemen.lead', 'Onze paklijst voor een kampeertrip met de caravan. Vink af wat al in de auto of caravan ligt. Jouw vinkjes blijven bewaard in deze browser.'))}</p>
<div id="pakbox">${voortgang(PAKAANTAL, 'Alles wissen')}
<div class="lijst">${PAKCATS.map(([k, a]) => `<div class="cat"><h2>${esc(k)}</h2>${a.map(x => vink('data-k', x, x)).join('')}</div>`).join('')}</div></div>
${CHKLIJST.length ? `<div class="ukop"><h2>Uitgebreide checklists</h2><p class="lead">Wil je het nog uitgebreider? Kies een lijst, bijvoorbeeld voor een bepaald seizoen. Elke lijst heeft zijn eigen vinkjes.</p>
${CHKLIJST.map(c => { const n = c.cats.reduce((s, t) => s + (t.i || []).length, 0); return `<details class="uk" id="${esc(c.id)}"><summary><b>${esc(c.naam)}</b><small>${esc(c.tekst || 'Uitgebreide checklist')}</small></summary>
${voortgang(n, 'Deze lijst wissen')}
<div class="lijst">${c.cats.map(t => `<div class="cat"><h3>${esc(t.n)}</h3>${(t.i || []).map(x => vink('data-xk', c.id + '|' + t.n + '|' + x, x)).join('')}</div>`).join('')}</div></details>`; }).join('\n')}</div>` : ''}
<p style="margin-top:32px"><a class="btn s" href="../uitrusting/">Onze uitrusting</a></p>`
}));

// ---- tips
const TIPLIJST = (Array.isArray(TIPS) ? TIPS : []).filter(t => t && t.titel);
fs.writeFileSync('tips/index.html', pagina({
  titel: 'Kampeertips voor het hele gezin, uit eigen ervaring',
  beschrijving: kort(`${TIPLIJST.length} praktische tips voor kamperen met de caravan: ${TIPLIJST.map(t => schoon(t.titel).toLowerCase()).join(', ')}.`, 158),
  pad: 'tips/', afbeelding: '', actief: 'tips', achter: 'nacht',
  jsonld: TIPLIJST.length ? { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Kampeertips voor het hele gezin', itemListElement: TIPLIJST.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: schoon(t.titel), description: schoon(t.tekst) })) } : null,
  body: `<h1>${esc(tx('tips.h2', 'Kampeertips voor het hele gezin'))}</h1>
<p class="lead">${esc(tx('tips.lead', 'Dit hebben wij onderweg geleerd. Kleine dingen die het kamperen met de caravan makkelijker en gezelliger maken.'))}</p>
<div class="pm" style="margin-top:22px">${TIPLIJST.map(t => `<div class="vlak"><h2>${esc(schoon(t.titel))}</h2><p>${esc(schoon(t.tekst))}</p></div>`).join('')}</div>
<p><a class="btn" href="../paklijst/">Onze paklijst</a></p>`
}));

// ---- over ons
if (OVER && OVER.kop) {
  const alinea = (Array.isArray(OVER.tekst) ? OVER.tekst : [OVER.tekst]).map(schoon).filter(Boolean);
  const fotos = [[OVER.foto, OVER.alt], [OVER.foto2, OVER.alt2]].filter(f => f[0]);
  fs.writeFileSync('over-ons/index.html', pagina({
    titel: "Over ons: het kampeergezin achter d'n Dennenappeltjes",
    beschrijving: kort(alinea[0] || `Maak kennis met ${SITE}.`, 158),
    pad: 'over-ons/', afbeelding: OVER.foto, actief: 'over',
    jsonld: { '@context': 'https://schema.org', '@type': 'AboutPage', name: schoon(OVER.kop), mainEntity: { '@type': 'Organization', name: SITE, url: BASE, sameAs: ['https://youtube.com/@kamperenmetdndennenappeltjes'] } },
    body: `<div class="twee"><div><h1>${esc(OVER.kop)}</h1>
${alinea.map(t => `<p class="lead">${esc(t)}</p>`).join('\n')}
<a class="btn" href="https://youtube.com/@kamperenmetdndennenappeltjes" target="_blank" rel="noopener">Kijk op YouTube</a></div>
${fotos.length ? `<div class="fotos">${fotos.map(f => `<img class="foto" src="${esc(rel(f[0]))}" alt="${esc(f[1] || OVER.kop)}" loading="lazy">`).join('')}</div>` : ''}</div>`
  }));
}

// ---- sitemap en robots
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, pr]) => `  <url><loc>${BASE}/${p}</loc><lastmod>${vandaag}</lastmod><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`Klaar: ${CAMPINGS.length} campings, ${VERHALEN.length} verhalen, ${UITCATS.length} uitrustingspagina's, paklijst, ${TIPLIJST.length} tips, over ons, ${urls.length} adressen in de sitemap.`);
