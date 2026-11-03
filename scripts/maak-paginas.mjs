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
const FOTOSDATA = laad('data/fotos.js', 'FOTOS', {});
const VIDDATA = laad('data/videos.js', 'VID', []);
// Aangepaste titels en teksten uit Beheer > Paginateksten. Is er niets aangepast, dan blijft de standaardtekst staan.
const TX = (INST && INST.teksten) || {};
const LOGO = (INST && INST.logo) || 'img/logo.png';
const DELEN = (INST && INST.delen) || 'img/delen-logo.jpg';
const tx = (k, std) => (TX[k] != null && String(TX[k]).trim() !== '') ? String(TX[k]).trim() : std;

const esc = x => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const schoon = x => String(x ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const kort = (x, n) => { x = schoon(x); return x.length > n ? x.slice(0, n - 1).replace(/\s+\S*$/, '') + '\u2026' : x; };
const slug = (t, terug = 'verhaal') => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || terug;
const abs = p => p ? (/^https?:/.test(p) ? p : `${BASE}/${String(p).replace(/^\//, '')}`) : `${BASE}/${DELEN}`;
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
.bk{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;font-size:.92rem;margin:0 0 14px;color:var(--zacht)}.bk a{color:var(--zacht);text-decoration:none;border-bottom:1px solid rgba(240,138,60,.5)}.bk a:hover,.bk a:focus-visible{color:var(--oranje)}.bk span[aria-current]{color:var(--room);font-weight:700}
.ytcta{margin-top:26px;border:2px solid var(--oranje)}
@media print{.bk,.ytcta{display:none!important}}
.lead{color:var(--zacht);max-width:62ch}
.foto{width:100%;max-height:380px;border-radius:18px;display:block;object-fit:cover;margin:0 0 18px}
.btn{display:inline-block;background:var(--oranje);color:#1a0f05;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;margin:6px 10px 0 0}
.btn.s{background:transparent;color:var(--room);border:2px solid var(--oranje);padding:10px 22px}
.feiten{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:20px 0}
.feiten div{background:var(--nacht);border-radius:14px;padding:14px 16px}.feiten small{display:block;color:var(--zacht)}
.pm{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin-bottom:18px}
.sec{margin:34px 0 12px;font-size:1.4rem}
.fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin:0 0 22px}
.fotos img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px;display:block}
.vlog{display:flex;align-items:center;gap:16px;padding:18px 22px;background:var(--den);border-radius:16px;color:var(--room);text-decoration:none;margin:0 0 18px;border:2px solid var(--oranje)}
.vlog:hover,.vlog:focus-visible{outline:2px solid var(--oranje)}
.vlog i{flex:none;width:56px;height:40px;border-radius:12px;background:var(--rood);display:grid;place-items:center}
.vlog i::after{content:"";border-left:14px solid #fff;border-top:8px solid transparent;border-bottom:8px solid transparent;margin-left:3px}
.btn.kl{padding:6px 16px;font-size:.9rem;margin-top:0}
.vlogs{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin:0 0 18px}.vlogs .vlog{margin:0}
.vlog b{display:block}.vlog small{color:var(--zacht)}
.vlog.vmet{flex-direction:column;align-items:stretch;gap:0;padding:0;overflow:hidden}
.vlog.vmet>span:last-child{padding:14px 18px 16px}
.vth{position:relative;display:block;aspect-ratio:16/9;background:var(--nacht);overflow:hidden}
.vth img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.vth i{position:absolute;left:50%;top:50%;margin:-20px 0 0 -28px}
@media(min-width:760px){.vlogs .vlog.vmet{flex-direction:row;align-items:center}.vlogs .vlog.vmet .vth{width:300px;flex:none}.vlogs .vlog.vmet>span:last-child{padding:18px 26px}}
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
.soc{display:flex;gap:14px;justify-content:center;margin:16px 0}.soc a{width:46px;height:46px;border-radius:50%;background:#fff;display:grid;place-items:center}.soc a:hover,.soc a:focus-visible{outline:3px solid var(--oranje);outline-offset:2px}.soc svg{width:26px;height:26px}
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
.twee .fotos{grid-template-columns:minmax(0,1fr);margin:0}.twee .fotos img{width:100%;height:auto;aspect-ratio:auto;max-height:420px;object-fit:contain}
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
.deel .dk:hover,.deel .dk:focus-visible{background:var(--oranje);color:#1a0f05}
.pk .opm{margin:0;font-size:.95rem;line-height:1.5;color:var(--zacht)}
.pk .badge{align-self:flex-start;background:var(--mos);color:var(--room);border:1px solid rgba(201,214,196,.5);border-radius:999px;padding:3px 12px;font-size:.82rem;font-weight:700}
.pk{scroll-margin-top:90px}.pk:target{outline:3px solid var(--oranje);outline-offset:3px}
.pk .nu{align-self:flex-start;background:var(--mos);color:var(--room);border:1px solid var(--oranje);border-radius:18px;padding:3px 12px;font-size:.82rem;font-weight:700;line-height:1.45;text-decoration:none}
.pk .nu:hover,.pk .nu:focus-visible{background:var(--oranje);color:#1a0f05}
.pk.oud{background:transparent;border:2px dashed rgba(201,214,196,.4)}
.pk.oud img{filter:grayscale(.85);opacity:.7}
.pk.oud b{color:var(--zacht)}
.eerder{margin-top:34px}.eerder>h3{font-size:1.4rem;color:var(--zacht);margin:0 0 .15em}.eerder .klein{margin:0 0 6px}
.filters button{font:inherit;font-weight:700;background:transparent;color:var(--room);border:2px solid var(--oranje);border-radius:999px;padding:7px 18px;cursor:pointer}
.filters button[aria-pressed=true]{background:var(--oranje);color:#1a0f05}
.filters{display:block;margin:22px 0}.fkop{display:flex;flex-wrap:wrap;gap:12px;align-items:center}.fkop #ftel{font-weight:700}
.filters .ftoggle{display:inline-flex;align-items:center;gap:8px;font-size:1.05rem;padding:9px 20px}.filters .ftoggle[aria-expanded=true]{background:var(--oranje);color:#1a0f05}.fbadge{background:var(--rood);color:#fff;border-radius:999px;min-width:22px;padding:0 7px;font-size:.85rem;line-height:22px;text-align:center}.fpijl{font-size:.7rem}
#fpanel{background:rgba(13,26,21,.55);border-radius:18px;padding:18px 18px 6px;margin-top:14px}#fpanel[hidden]{display:none}
#fbouw{display:flex;flex-wrap:wrap;gap:0 28px;align-items:flex-start}
.fgroep{margin:0 0 14px}.flabel{display:block;font-weight:800;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;color:var(--zacht);margin-bottom:6px}
.fchips{display:flex;flex-wrap:wrap;gap:8px}.filters button small{opacity:.75;font-weight:600}
.filters select{font:inherit;font-weight:700;color:var(--room);background:var(--nacht);border:2px solid var(--oranje);border-radius:12px;padding:9px 12px;max-width:100%;min-width:220px}
.filters button.fklein{padding:5px 14px;font-size:.9rem}
.fgroep.fvol{flex:0 0 100%}.fnoot{flex:0 0 100%;margin:0 0 14px;color:var(--zacht);font-size:.9rem}
.filters button:disabled{opacity:.35;cursor:not-allowed;border-style:dashed}.filters select option:disabled{color:#7c8a80}
.kaartvak{background:var(--nacht);border-radius:16px;padding:12px;margin:4px 0 14px}.kaartvraag{text-align:center;padding:22px}.kaartvraag p{margin:0 0 12px;max-width:560px;margin-left:auto;margin-right:auto}.kaartvraag button{font:inherit;font-weight:700;background:var(--oranje);color:#1a0f05;border:0;border-radius:999px;padding:10px 24px;cursor:pointer}
#lkaart{height:min(62vh,480px);border-radius:12px;position:relative;z-index:0;isolation:isolate;background:#1b2a24}
.kaartsvg{width:100%;height:auto;max-height:420px;display:block}.kp{cursor:pointer}.kp:focus{outline:none}.kp:hover circle:nth-child(2),.kp:focus circle:nth-child(2){stroke:#f6ecd6}.kaartnoot{margin:8px 0 0;color:var(--zacht);font-size:.9rem}
.lpin{background:transparent;border:0}.lpin span{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#f08a3c;border:3px solid #1a0f05;color:#1a0f05;font:700 14px Fredoka,sans-serif;box-shadow:0 0 0 4px rgba(240,138,60,.4)}
.lpop{font:15px/1.4 Nunito,system-ui,sans-serif;color:#1a0f05}.lpop div+div{margin-top:6px}.lpop a{color:#a33f00;font-weight:800}.lpop small{color:#555}
.camp[hidden]{display:none}`;

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
+'<details><summary>Benieuwd wat er gebeurt? <u>Lees hier</u>.</summary><p><b>Alles accepteren:</b> GoatCounter wordt gestart om bezoekstatistieken bij te houden. YouTube-video’s worden pas ingeladen wanneer je daarvoor kiest; YouTube kan daarbij gegevens ontvangen en eventueel cookies of vergelijkbare technieken gebruiken. Ook de kaart met campings (OpenStreetMap) wordt dan automatisch geladen; OpenStreetMap kan daarbij je IP-adres zien. <b>Alleen noodzakelijk:</b> GoatCounter wordt niet gestart en ingesloten YouTube-video’s blijven uit. De kaart met campings laden we dan pas nadat je daar zelf om vraagt. Als je bij een video op afspelen drukt, wordt YouTube alsnog geladen. Kies je dit, dan vragen we het bij je volgende bezoek opnieuw. <b>Paklijst:</b> je paklijst wordt lokaal op je eigen toestel bewaard, zodat die blijft werken zonder optionele onderdelen. Je kunt je keuze later aanpassen via Cookie-instellingen onderaan de pagina. Lees ook onze <a href="../cookieverklaring.html">cookieverklaring</a> en <a href="../privacyverklaring.html">privacyverklaring</a>.</p></details>'
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

// Extra tekstblok onderaan een overzichtspagina (extra.<pagina>.kop en .tekst in Beheer, leeg = niets tonen)
function extraBlok(id) {
  if (!id) return '';
  const kop = tx(`extra.${id}.kop`, ''), tekst = tx(`extra.${id}.tekst`, '');
  if (!kop && !tekst) return '';
  const alinea = tekst.split(/\n\s*\n/).filter(a => a.trim()).map(a => `<p class="lead">${esc(a.trim()).replace(/\n/g, '<br>')}</p>`).join('');
  return `<div class="ukop">${kop ? `<h2>${esc(kop)}</h2>` : ''}${alinea}</div>`;
}
// kruimels: [[naam, pad], ..., [naam]] zonder pad voor de huidige pagina
function pagina({ titel, beschrijving, pad, afbeelding, body, jsonld, actief, achter = '', script = '', kruimels = null, extra = '' }) {
  body = body + extraBlok(extra);
  if (kruimels && kruimels.length) {
    const lijstKr = [[tx('menu.home', 'Home'), ''], ...kruimels];
    const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: lijstKr.map(([n, pd], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: pd == null ? `${BASE}/${pad}` : `${BASE}/${pd}` })) };
    jsonld = jsonld ? [jsonld, ld] : ld;
    body = `<div role="navigation" aria-label="Broodkruimels" class="bk">${lijstKr.map(([n, pd], i) => (i === lijstKr.length - 1 ? `<span aria-current="page">${esc(n)}</span>` : `<a href="${pd === '' ? '../index.html' : '../' + pd}">${esc(n)}</a><span aria-hidden="true">\u203a</span>`)).join('')}</div>\n` + body;
  }
  const volledig = `${titel} | ${SITE}`;
  const link = (h, t, k) => `<a href="${h}"${actief === k ? ' class="on"' : ''}>${esc(tx('menu.' + k, t))}</a>`;
  return `<!DOCTYPE html>
<html lang="nl"><head><meta charset="utf-8"><meta http-equiv="content-language" content="nl"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(volledig)}</title>
<meta name="description" content="${esc(beschrijving)}">
<link rel="canonical" href="${BASE}/${pad}">
<link rel="icon" type="image/png" href="/favicon.png">
<meta property="og:type" content="article"><meta property="og:site_name" content="${esc(SITE)}">
<meta property="og:title" content="${esc(volledig)}"><meta property="og:description" content="${esc(beschrijving)}">
<meta property="og:url" content="${BASE}/${pad}"><meta property="og:image" content="${esc(abs(afbeelding))}">
<meta name="twitter:card" content="summary_large_image">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
<link rel="preload" href="../fonts/nunito-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../fonts/fredoka-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../fonts/fonts.css">
<style>${CSS}</style><link rel="stylesheet" href="../extras.css"></head><body class="${achter}">
<nav><div class="wrap"><a href="../index.html" style="display:flex"><img src="../${esc(LOGO)}" alt="Home"></a><b>${esc(tx('menu.naam', "d'n Dennenappeltjes"))}</b><button class="menuknop" id="mk" aria-expanded="false" aria-controls="lk">${esc(tx('menu.knop', 'Menu'))}</button><div class="links" id="lk">${link('../index.html', 'Home', 'home')}${link('../over-ons/', 'Over ons', 'over')}${link('../paklijst/', 'Wat neem je mee', 'paklijst')}${link('../uitrusting/', 'Uitrusting', 'uitrusting')}${link('../campings/', 'Campings', 'campings')}${link('../verhalen/', 'Verhalen', 'verhalen')}${link('../tips/', 'Tips', 'tips')}${link('../index.html#fotos', "Foto's", 'fotos')}${link('../index.html#videos', "Video's", 'videos')}${link('../index.html#contact', 'Contact', 'contact')}</div></div></nav>
<main><div class="wrap">
${body}
</div></main>
<div class="ruit"></div>
<div class="deel"><div class="wrap"><p>${esc(tx('alle.deel', 'Deel deze pagina met andere kampeerders'))}</p><a class="dk" id="dwa" target="_blank" rel="noopener">WhatsApp</a><button type="button" class="dk" id="dsh" hidden>${esc(tx('alle.delen', 'Delen'))}</button><button type="button" class="dk" id="dkp">${esc(tx('alle.kopieer', 'Link kopi\u00ebren'))}</button></div></div>
<footer><div class="wrap"><img src="../${esc(LOGO)}" alt="${esc(SITE)}"><p>${esc(tx('footer.tekst', 'Kamperen met d\'n Dennenappeltjes. Samen op pad, in elk seizoen.'))}</p>${SOC}<p>${MAIL}${VERSIE}<button type="button" class="ck-link" data-ckopen>Cookie-instellingen</button> &middot; <a href="../privacyverklaring.html">Privacyverklaring</a> &middot; <a href="../cookieverklaring.html">Cookieverklaring</a></p></div></footer>
<script>${COOKIEJS}</script>
<script>var mk=document.getElementById('mk'),lk=document.getElementById('lk');mk.onclick=function(){var o=lk.classList.toggle('open');mk.setAttribute('aria-expanded',o)};(function(){var a=document.getElementById('dwa'),sh=document.getElementById('dsh'),kp=document.getElementById('dkp');if(!a)return;a.href='https://wa.me/?text='+encodeURIComponent(document.title+' '+location.href);if(navigator.share){sh.hidden=false;sh.onclick=function(){navigator.share({title:document.title,url:location.href}).catch(function(){})}}kp.onclick=function(){var t=kp.textContent;function ok(){kp.textContent='Gekopieerd!';setTimeout(function(){kp.textContent=t},1800)}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(location.href).then(ok,function(){})}else{var i=document.createElement('input');i.value=location.href;document.body.appendChild(i);i.select();try{document.execCommand('copy');ok()}catch(e){}i.remove()}}})();${script}</script>
<script src="../extras.js" defer></script>
</body></html>
`;
}

const YTKANAAL = 'https://youtube.com/@kamperenmetdndennenappeltjes';
const ytcta = (kop, tekst) => `<a class="vlog ytcta" href="${YTKANAAL}" target="_blank" rel="noopener"><i aria-hidden="true"></i><span><b>${esc(kop)}</b><small>${esc(tekst)}</small></span></a>`;
const ytStd = () => ytcta(tx('yt.kop', 'Bekijk onze vlogs op ons YouTube-kanaal'), tx('yt.tekst', 'Abonneer je, dan mis je geen enkele kampeertrip.'));
const NAARBOVEN = `<p style="margin-top:32px"><a class="btn s" href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false">${esc(tx('alle.omhoog', 'Terug naar boven'))}</a></p>`;
// Versienummer overnemen uit index.html (dezelfde plek als in de footer van de home page)
let VERSIE = '', SOC = '', MAIL = '';
try { const h = fs.readFileSync('index.html', 'utf8'); const f = (h.match(/<footer[\s\S]*?<\/footer>/i) || [''])[0];
  const so = f.match(/<div class="soc">[\s\S]*?<\/div>/i); if (so) SOC = so[0];
  const ma = f.match(/<a href="mailto:[^"]+">[^<]+<\/a>/i); if (ma) MAIL = ma[0] + '<br>'; } catch (e) {}
try { const m = fs.readFileSync('index.html', 'utf8').match(/<small>\s*(versie\s*[\w.]+)\s*<\/small>/i); if (m) VERSIE = `<small>${m[1]}</small><br>`; } catch (e) {}
const lijst = a => Array.isArray(a) && a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';

const MAPPEN = ['campings', 'verhalen', 'uitrusting', 'paklijst', 'tips', 'over-ons'];
for (const dir of MAPPEN) { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); }
const urls = [['', 1.0], ['campings/', 0.8], ['verhalen/', 0.7], ['uitrusting/', 0.8], ['paklijst/', 0.8], ['tips/', 0.7], ['over-ons/', 0.6], ['privacyverklaring.html', 0.2], ['cookieverklaring.html', 0.2]];

// ---- Filter en kaart op de campingpagina (zelfde werking als in het voorbeeld)
const CK0 = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const LANDNAAM = { nl: 'Nederland', nederland: 'Nederland', holland: 'Nederland', be: 'Belgi\u00eb', belgie: 'Belgi\u00eb', de: 'Duitsland', duitsland: 'Duitsland', deutschland: 'Duitsland', fr: 'Frankrijk', frankrijk: 'Frankrijk', lu: 'Luxemburg', luxemburg: 'Luxemburg', at: 'Oostenrijk', oostenrijk: 'Oostenrijk', dk: 'Denemarken', denemarken: 'Denemarken', es: 'Spanje', spanje: 'Spanje', it: 'Itali\u00eb', italie: 'Itali\u00eb', ch: 'Zwitserland', zwitserland: 'Zwitserland' };
const landVan = c => { const t = String(c.land || '').trim(); return t ? (LANDNAAM[CK0(t)] || t) : 'Nederland'; };
const REGIOALIAS = { fryslan: 'Friesland', noordbrabant: 'Noord-Brabant', noordholland: 'Noord-Holland', zuidholland: 'Zuid-Holland' };
const regioVan = c => { const r = String(c.regio || '').trim(); return r ? (REGIOALIAS[CK0(r)] || r) : ''; };
const LANDPUNT = { Nederland: [52.2, 5.3], 'Belgi\u00eb': [50.6, 4.6], Duitsland: [51.2, 10.4], Frankrijk: [46.6, 2.4], Luxemburg: [49.8, 6.1], Oostenrijk: [47.6, 14.1], Denemarken: [56, 9.5], Spanje: [40.2, -3.7], 'Itali\u00eb': [42.5, 12.5], Zwitserland: [46.8, 8.2] };
const REGIOPUNT = { 'Nederland|groningen': [53.22, 6.74], 'Nederland|friesland': [53.1, 5.85], 'Nederland|drenthe': [52.85, 6.6], 'Nederland|overijssel': [52.45, 6.4], 'Nederland|flevoland': [52.5, 5.55], 'Nederland|gelderland': [52.05, 5.9], 'Nederland|utrecht': [52.08, 5.15], 'Nederland|noordholland': [52.6, 4.8], 'Nederland|zuidholland': [52, 4.5], 'Nederland|zeeland': [51.45, 3.8], 'Nederland|noordbrabant': [51.55, 5.1], 'Nederland|limburg': [51.2, 5.9],
  'Belgi\u00eb|antwerpen': [51.2, 4.6], 'Belgi\u00eb|limburg': [50.95, 5.4], 'Belgi\u00eb|oostvlaanderen': [51, 3.9], 'Belgi\u00eb|westvlaanderen': [51.05, 3.1], 'Belgi\u00eb|vlaamsbrabant': [50.9, 4.5], 'Belgi\u00eb|waalsbrabant': [50.65, 4.6], 'Belgi\u00eb|henegouwen': [50.45, 3.9], 'Belgi\u00eb|luik': [50.5, 5.6], 'Belgi\u00eb|luxemburg': [49.95, 5.45], 'Belgi\u00eb|luxemburgprovincie': [49.95, 5.45], 'Belgi\u00eb|namen': [50.35, 4.9], 'Belgi\u00eb|brussel': [50.85, 4.35] };
const punt = c => {
  if (c.lat != null && c.lon != null && c.lat !== '' && c.lon !== '' && isFinite(+c.lat) && isFinite(+c.lon)) return [+c.lat, +c.lon, 'exact'];
  const ln = landVan(c), r = regioVan(c), rp = r && REGIOPUNT[ln + '|' + CK0(r)];
  if (rp) return [rp[0], rp[1], 'regio'];
  const lp = LANDPUNT[ln]; return lp ? [lp[0], lp[1], 'land'] : null;
};
// Gegevens voor de extra filters (stroom, oppervlakte en voorzieningen). Ze komen uit de velden van de camping
// of uit "Info over het park" in Beheer (bijvoorbeeld de regel "Wifi: ja"). Wat niet is ingevuld, telt als onbekend.
const zoekWaarde = (c, exact, begin = []) => {
  const alles = [...Object.entries(c || {}), ...Object.entries((c && c.info) || {})];
  for (const [k, v] of alles) {
    if (v == null || typeof v === 'object' || String(v).trim() === '') continue;
    const sl = CK0(k);
    if (exact.includes(sl) || begin.some(b => sl.startsWith(b))) return v;
  }
  return undefined;
};
// Zoals zoekWaarde, maar geeft ALLE passende velden terug (bijvoorbeeld Zwembad binnen, Zwembad buiten en Zwemplas).
const zoekAlle = (c, exact, begin = [], niet = [], bevat = []) => {
  const alles = [...Object.entries(c || {}), ...Object.entries((c && c.info) || {})];
  const uit = [];
  for (const [k, v] of alles) {
    if (v == null || typeof v === 'object' || String(v).trim() === '') continue;
    const sl = CK0(k);
    if (niet.some(n => sl.includes(n))) continue;
    if (exact.includes(sl) || begin.some(b => sl.startsWith(b)) || bevat.some(b => sl.includes(b))) uit.push(v);
  }
  return uit;
};
const GETAL = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : null; };
const JANEE = v => {
  if (v === true) return true;
  if (v === false) return false;
  const t = String(v ?? '').trim().toLowerCase();
  if (!t) return null;
  if (t === 'n' || t === '-' || t === '\u2013' || t === '0') return false;
  return !/^(nee|no|geen|niet|nvt|n\.v\.t|false|verboden)(?![a-z])/.test(t);
};
const KENMERKEN = [
  { id: 'water', exact: ['water', 'wateropdeplaats', 'wateraansluiting'], begin: [] },
  { id: 'afvoer', exact: ['afvoer', 'afvoeropdeplaats', 'afvoeraansluiting'], begin: [] },
  { id: 'zwem', exact: [], begin: ['zwem'] },
  { id: 'wifi', exact: ['wifi', 'wlan', 'internet'], begin: ['wifi', 'wlan'] },
  { id: 'tv', exact: ['tv', 'televisie', 'tvontvangst'], begin: ['televisie', 'tvaansluiting', 'tvontvangst'] },
  { id: 'zwembinnen', exact: [], begin: ['zwembadbinnen', 'binnenzwembad', 'zwembadoverdekt', 'overdektzwembad'] },
  { id: 'zwembuiten', exact: [], begin: ['zwembadbuiten', 'buitenzwembad', 'zwembadopenlucht', 'openluchtzwembad'] },
  { id: 'zwemplas', exact: [], begin: ['zwemplas', 'zwemvijver', 'zwemmeer'] },
  { id: 'speeltuin', exact: [], begin: ['speel'], niet: ['binnen', 'overdekt'] },
  { id: 'speelbinnen', exact: [], begin: ['speeltuinbinnen', 'binnenspeeltuin', 'speelhal', 'speelruimtebinnen', 'speeltuinoverdekt'] },
  { id: 'huisdieren', exact: [], begin: ['huisdier', 'hond'], bevat: ['huisdier', 'hond'] }
];
const kenmerkenVan = c => KENMERKEN.filter(k => zoekAlle(c, k.exact, k.begin, k.niet || [], k.bevat || []).some(v => JANEE(v) === true)).map(k => k.id);
const stroomVan = c => GETAL(zoekWaarde(c, ['stroom', 'ampere', 'stroomampere']));
const oppVan = c => GETAL(zoekWaarde(c, ['opp', 'oppervlakte', 'oppervlaktevandeplaats']));
const FILTERJS = `(function(){
var C=window.CAMPDATA||[],f=document.getElementById('filters'),l=document.getElementById('lijst');
if(!f||!l||!C.length)return;
var S={land:[],regio:[],min:[],type:[],stroom:[],opp:[],kenm:[],sort:'volgorde',pick:null,open:false};
var OPPB=[80,90,100,120,150];
function ob(o){var b=0;OPPB.forEach(function(x){if(o>=x)b=x});return b}
function rk(c){return c.land+'|'+c.regio}
var MAPKLEUR='#c9d6c4';
var OMTREK={Nederland:[[6.9,53.45],[6.2,53.4],[5.4,53.17],[5.05,52.95],[4.75,52.96],[4.6,52.6],[4.55,52.46],[4.4,52.2],[4.1,51.98],[3.85,51.82],[3.55,51.55],[3.37,51.37],[3.9,51.2],[4.24,51.37],[4.75,51.5],[5.2,51.3],[5.55,51.2],[5.7,50.76],[6.05,50.85],[6.2,51.1],[6.2,51.4],[5.95,51.8],[6.7,51.9],[6.8,52.05],[6.7,52.45],[7.05,52.65],[7.2,53.0],[7.2,53.2],[7.0,53.3]],
'België':[[2.55,51.09],[3.37,51.37],[3.9,51.2],[4.24,51.37],[4.75,51.5],[5.2,51.3],[5.55,51.2],[5.7,50.76],[6.2,50.55],[6.4,50.32],[6.1,50.13],[5.8,49.55],[5.4,49.55],[4.85,50.15],[4.2,49.95],[3.6,50.35],[3.2,50.75],[2.6,50.8]]};
var eh=function(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};
var els={};[].slice.call(l.querySelectorAll('a.camp')).forEach(function(a){els[a.getAttribute('data-id')]=a});
var leeg=document.createElement('p');leeg.className='lead';leeg.hidden=true;leeg.textContent='Geen campings gevonden met deze keuze. Probeer een filter uit te zetten, of druk op Wis filters.';l.parentNode.insertBefore(leeg,l.nextSibling);
function sk(skip,k){return skip.indexOf(' '+k+' ')>=0}
function heeft(c,k){return !!c.k&&c.k.indexOf(k)>=0}
/* Past een camping bij alle gekozen filters? Met skip sla je een of meer filters over (om te tellen wat er nog mogelijk is). */
function pas(c,skip){
if(S.land.length&&!sk(skip,'land')&&S.land.indexOf(c.land)<0)return false;
if(S.regio.length&&!sk(skip,'regio')&&(!c.regio||S.regio.indexOf(rk(c))<0))return false;
if(S.type.length&&!sk(skip,'type')&&S.type.indexOf(c.type)<0)return false;
if(S.min.length&&!sk(skip,'min')&&(c.n==null||S.min.indexOf(c.n)<0))return false;
if(S.stroom.length&&!sk(skip,'stroom')&&(c.s==null||S.stroom.indexOf(c.s)<0))return false;
if(S.opp.length&&!sk(skip,'opp')&&(c.o==null||S.opp.indexOf(ob(c.o))<0))return false;
for(var i=0;i<S.kenm.length;i++){if(!sk(skip,'k:'+S.kenm[i])&&!heeft(c,S.kenm[i]))return false}
return true}
function passend(c){if(S.pick&&S.pick.indexOf(c.id)<0)return false;return pas(c,' ')}
function gesorteerd(a){var b=a.slice(),nl=function(x,y){return String(x).localeCompare(String(y),'nl')};
if(S.sort=='cijfer')b.sort(function(x,y){return ((y.n==null?-1:y.n)-(x.n==null?-1:x.n))||nl(x.naam,y.naam)});
else if(S.sort=='naam')b.sort(function(x,y){return nl(x.naam,y.naam)});
else if(S.sort=='regio')b.sort(function(x,y){return nl(x.land,y.land)||nl(x.regio,y.regio)||nl(x.naam,y.naam)});
return b}
function aantalActief(){return S.land.length+S.regio.length+S.min.length+S.type.length+S.stroom.length+S.opp.length+S.kenm.length+(S.pick?1:0)}
/* ---- Echte kaart (Leaflet + OpenStreetMap), pas na een klik van de bezoeker ---- */
var LJS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',LCSS='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
var LM=null,LLAAG=null,LFOUT=false,LBEZIG=false;
function kaartToegestaan(){try{if(typeof ckOk=='function'&&ckOk('stat')&&ckOk('vid'))return true;return sessionStorage.getItem('kaartok')=='1'}catch(e){return false}}
function laadLeaflet(){return new Promise(function(ok,nee){if(window.L&&L.map)return ok();if(!document.getElementById('lcss')){var c=document.createElement('link');c.id='lcss';c.rel='stylesheet';c.href=LCSS;document.head.appendChild(c)}var s=document.createElement('script');s.src=LJS;s.onload=function(){window.L&&L.map?ok():nee()};s.onerror=nee;document.head.appendChild(s)})}
function popupHtml(cs){return '<div class="lpop">'+cs.map(function(c){return '<div><a href="'+eh(c.id)+'.html">'+eh(c.naam)+'</a>'+(c.cijfer?' <span>cijfer '+eh(c.cijfer)+'</span>':'')+(c.p[2]!='exact'?'<br><small>Plek bij benadering</small>':'')+'</div>'}).join('')+'</div>'}
function leafBijwerken(vis){
LLAAG.clearLayers();var grp={};
vis.forEach(function(c){var p=c.p;if(!p)return;var key=p[0].toFixed(3)+'|'+p[1].toFixed(3);(grp[key]=grp[key]||{p:p,cs:[]}).cs.push(c)});
var pts=[];
Object.keys(grp).forEach(function(k){var g=grp[k],n=g.cs.length,ic=L.divIcon({className:'lpin',html:'<span>'+(n>1?n:'')+'</span>',iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-14]});
var t=n==1?g.cs[0].naam:n+' campings';
var mk=L.marker([g.p[0],g.p[1]],{icon:ic,title:t,alt:t,keyboard:true});mk.bindPopup(popupHtml(g.cs),{maxWidth:260});mk.addTo(LLAAG);pts.push([g.p[0],g.p[1]])});
LM.invalidateSize();
if(!pts.length)return;
var max=S.regio.length?11:9;
if(pts.length==1)LM.setView(pts[0],S.regio.length?11:S.land.length?9:8,{animate:true});
else LM.fitBounds(pts,{padding:[34,34],maxZoom:max,animate:true})}
function tekenLeaflet(v,vis){
var div=document.getElementById('lkaart');
if(!div||!LM){v.innerHTML='<div class="kaartvak"><div id="lkaart" role="region" aria-label="Kaart met onze campings"></div><p class="kaartnoot">Kaart: &copy; OpenStreetMap-bijdragers. Tik op een oranje stip om de camping te zien. Met twee vingers of de plus en min zoom je in en uit.</p></div>';div=document.getElementById('lkaart');
LM=L.map(div,{scrollWheelZoom:false,worldCopyJump:false,minZoom:3}).setView([50.5,6],5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).addTo(LM);
LLAAG=L.layerGroup().addTo(LM);
LM.on('focus',function(){LM.scrollWheelZoom.enable()});LM.on('blur',function(){LM.scrollWheelZoom.disable()})}
leafBijwerken(vis)}
function leafWeg(){if(LM){try{LM.remove()}catch(e){}LM=null;LLAAG=null}}
/* ---- Eenvoudige kaart zonder externe diensten (als de echte kaart niet laadt) ---- */
function kaartSvg(vis){
var W=600,pts=[];vis.forEach(function(c){if(c.p)pts.push({c:c,p:c.p})});
if(!pts.length)return'';
var la=pts.map(function(x){return x.p[0]}),lo=pts.map(function(x){return x.p[1]});
var la0=Math.min.apply(0,la),la1=Math.max.apply(0,la),lo0=Math.min.apply(0,lo),lo1=Math.max.apply(0,lo);
var midla=(la0+la1)/2,midlo=(lo0+lo1)/2,k=Math.cos(midla*Math.PI/180),pad=1.32;
var dla=Math.max(la1-la0,1.3)*pad,dlo=Math.max((lo1-lo0)*k,1.3*k)*pad;
var sc=Math.min(W/dlo,380/dla),H=Math.round(Math.min(380,Math.max(240,dla*sc)));sc=Math.min(W/dlo,H/dla);
var X=function(x){return W/2+(x-midlo)*k*sc},Y=function(y){return H/2-(y-midla)*sc};
var groepen={};pts.forEach(function(x){var key=x.p[0].toFixed(2)+'|'+x.p[1].toFixed(2);(groepen[key]=groepen[key]||{p:x.p,cs:[]}).cs.push(x.c)});
var svg='<svg class="kaartsvg" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Kaart met onze campings" xmlns="http://www.w3.org/2000/svg">';
Object.keys(OMTREK).forEach(function(n){svg+='<polygon points="'+OMTREK[n].map(function(q){return X(q[0]).toFixed(1)+','+Y(q[1]).toFixed(1)}).join(' ')+'" fill="'+MAPKLEUR+'" fill-opacity=".10" stroke="'+MAPKLEUR+'" stroke-opacity=".45" stroke-width="1.2" stroke-linejoin="round"><title>'+eh(n)+'</title></polygon>'});
Object.keys(groepen).forEach(function(key){var g=groepen[key],n=g.cs.length,r=9+4*Math.sqrt(n),cx=X(g.p[1]).toFixed(1),cy=Y(g.p[0]).toFixed(1),
act=S.pick&&g.cs.every(function(c){return S.pick.indexOf(c.id)>=0}),naam=n==1?g.cs[0].naam:n+' campings';
svg+='<g class="kp" tabindex="0" role="button" data-ids="'+eh(g.cs.map(function(c){return c.id}).join(','))+'" aria-label="'+eh(naam)+'"><circle cx="'+cx+'" cy="'+cy+'" r="'+(r+4).toFixed(1)+'" fill="#f08a3c" fill-opacity=".22"/><circle cx="'+cx+'" cy="'+cy+'" r="'+r.toFixed(1)+'" fill="#f08a3c" stroke="'+(act?'#f6ecd6':'#1a0f05')+'" stroke-width="'+(act?3:2)+'"/>'+(n>1?'<text x="'+cx+'" y="'+(+cy+5).toFixed(1)+'" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="15" fill="#1a0f05">'+n+'</text>':'')+'<title>'+eh(naam)+'</title></g>'});
return svg+'</svg>'}
function tekenSvg(v,vis,uitleg){var svg=kaartSvg(vis);
v.innerHTML=svg?'<div class="kaartvak">'+svg+'<p class="kaartnoot">'+(uitleg||'')+'Elke oranje stip is een camping of een groep campings. Tik op een stip om alleen die te zien.'+(S.pick?' <button type="button" class="fklein" id="fpickwis">Toon weer alles</button>':'')+'</p></div>':'';
[].slice.call(v.querySelectorAll('.kp')).forEach(function(g){var go=function(){var ids=g.getAttribute('data-ids').split(',');if(ids.length==1){location.href=ids[0]+'.html';return}S.pick=ids;teken()};g.onclick=go;g.onkeydown=function(e){if(e.key=='Enter'||e.key==' '){e.preventDefault();go()}}});
var pw=document.getElementById('fpickwis');if(pw)pw.onclick=function(){S.pick=null;teken()}}
function tekenKaart(vis){var v=document.getElementById('fkaartvak');if(!v||!S.open)return;
if(!C.some(function(c){return c.p})){v.innerHTML='';return}
if(window.KAART_ZONDER_TEGELS||LFOUT){leafWeg();tekenSvg(v,vis,LFOUT?'De gedetailleerde kaart kon niet laden, dit is een eenvoudige kaart. ':'');return}
if(!kaartToegestaan()){leafWeg();v.innerHTML='<div class="kaartvak kaartvraag"><p><b>Kaart van onze campings</b></p><p>Voor een kaart waarop je goed kunt zien waar we zijn geweest, gebruiken we OpenStreetMap. Als je de kaart laadt, krijgt OpenStreetMap je IP-adres te zien. Je kunt ook gewoon de lijst hieronder gebruiken.</p><button type="button" id="fkaartlaad">Kaart laden</button></div>';document.getElementById('fkaartlaad').onclick=function(){try{sessionStorage.setItem('kaartok','1')}catch(e){}teken()};return}
if(window.L&&L.map){tekenLeaflet(v,vis);return}
if(LBEZIG)return;LBEZIG=true;v.innerHTML='<div class="kaartvak"><p class="kaartnoot">Kaart laden...</p></div>';
laadLeaflet().then(function(){LBEZIG=false;teken(true)}).catch(function(){LBEZIG=false;LFOUT=true;teken(true)})}
/* ---- Filterbalk en lijst ---- */
function bouwFilters(){
var landen=[],types=[];C.forEach(function(c){if(landen.indexOf(c.land)<0)landen.push(c.land);if(c.type&&types.indexOf(c.type)<0)types.push(c.type)});
var regios=[],rseen={};C.forEach(function(c){if((!S.land.length||S.land.indexOf(c.land)>=0)&&c.regio&&!rseen[rk(c)]){rseen[rk(c)]=1;regios.push({k:rk(c),n:c.regio,l:c.land})}});regios.sort(function(a,b){return a.l.localeCompare(b.l,'nl')||a.n.localeCompare(b.n,'nl')});
var dubbel={};regios.forEach(function(r){dubbel[r.n]=(dubbel[r.n]||0)+1});
S.regio=S.regio.filter(function(k){return regios.some(function(r){return r.k==k})});
var aant=function(skip,fn){var r=0;C.forEach(function(c){if(pas(c,skip)&&fn(c))r++});return r};
var optie=function(w,t,skip,fn,cur,metTal){var a=aant(skip,fn);return [w,t,metTal?a:null,a==0&&String(w)!=String(cur)]};
var optieM=function(w,t,skip,fn,cur){var a=aant(skip,fn);return [w,t,a,a==0&&cur.indexOf(w)<0]};
var alle=function(w,t,tal){return [w,t,tal,false]};
var chips=function(naam,items,cur,sleutel){return '<div class=\"fgroep\"><span class=\"flabel\">'+naam+'</span><div class=\"fchips\">'+items.map(function(it){return '<button type=\"button\" data-f=\"'+sleutel+'\" data-w=\"'+eh(it[0])+'\" aria-pressed=\"'+(String(it[0])===String(cur))+'\"'+(it[3]?' disabled':'')+'>'+eh(it[1])+(it[2]!=null?' <small>'+it[2]+'</small>':'')+'</button>'}).join('')+'</div></div>'};
var mchips=function(naam,items,cur,sleutel,vol){return '<div class=\"fgroep'+(vol?' fvol':'')+'\"><span class=\"flabel\">'+naam+'</span><div class=\"fchips\">'+items.map(function(it){var aan=it[0]===''?cur.length==0:cur.indexOf(it[0])>=0;return '<button type=\"button\" data-f=\"'+sleutel+'\" data-w=\"'+eh(it[0])+'\" aria-pressed=\"'+aan+'\"'+(it[3]?' disabled':'')+'>'+(aan&&it[0]!==''?'\u2713 ':'')+eh(it[1])+(it[2]!=null?' <small>'+it[2]+'</small>':'')+'</button>'}).join('')+'</div></div>'};
var h='';
if(landen.length>1)h+=mchips('Land',[alle('','Alle landen',aant(' land regio ',function(){return true}))].concat(landen.map(function(x){return optieM(x,x,' land regio ',function(c){return c.land==x},S.land)})),S.land,'land');
if(regios.length)h+=mchips('Provincie of regio',[alle('','Alle'+(S.land.length==1?' in '+S.land[0]:''),aant(' regio ',function(){return true}))].concat(regios.map(function(r){return optieM(r.k,r.n+(dubbel[r.n]>1?' ('+r.l+')':''),' regio ',function(c){return rk(c)==r.k},S.regio)})),S.regio,'regio',true);
var cw=[];C.forEach(function(c){if(c.n!=null&&cw.indexOf(c.n)<0)cw.push(c.n)});cw.sort(function(x,y){return x-y});
if(cw.length)h+=mchips('Ons cijfer',[alle('','Alle',null)].concat(cw.map(function(m){return optieM(m,String(m).replace('.',','),' min ',function(c){return c.n===m},S.min)})),S.min,'min');
if(types.length>1)h+=mchips('Soort',[alle('','Alle',null)].concat(types.map(function(t){return optieM(t,t,' type ',function(c){return c.type==t},S.type)})),S.type,'type');
var sw=[];C.forEach(function(c){if(c.s!=null&&sw.indexOf(c.s)<0)sw.push(c.s)});sw.sort(function(x,y){return x-y});
if(sw.length)h+=mchips('Stroom',[alle('','Alle',null)].concat(sw.map(function(m){return optieM(m,m+' A',' stroom ',function(c){return c.s===m},S.stroom)})),S.stroom,'stroom');
var ow=OPPB.concat([0]).sort(function(x,y){return x-y}).filter(function(m){return C.some(function(c){return c.o!=null&&ob(c.o)==m})});
var olab=function(m){var i=OPPB.indexOf(m);return m==0?'Minder dan '+OPPB[0]+' m\u00b2':i==OPPB.length-1?m+' m\u00b2 of meer':m+'\u2013'+(OPPB[i+1]-1)+' m\u00b2'};
if(ow.length)h+=mchips('Oppervlakte',[alle('','Alle',null)].concat(ow.map(function(m){return optieM(m,olab(m),' opp ',function(c){return c.o!=null&&ob(c.o)==m},S.opp)})),S.opp,'opp');
var KN=[['water','Water op de plaats'],['afvoer','Afvoer op de plaats'],['zwem','Zwemmogelijkheid'],['zwembinnen','Zwembad binnen'],['zwembuiten','Zwembad buiten'],['zwemplas','Zwemplas'],['wifi','Wifi'],['tv','TV-ontvangst'],['speeltuin','Speeltuin'],['speelbinnen','Speeltuin binnen'],['huisdieren','Huisdieren toegestaan']];
h+='<div class="fgroep fvol"><span class="flabel">Voorzieningen</span><div class="fchips">'+KN.map(function(x){var aan=S.kenm.indexOf(x[0])>=0,a=aant(' k:'+x[0]+' ',function(c){return heeft(c,x[0])});return '<button type="button" data-f="k" data-w="'+x[0]+'" aria-pressed="'+aan+'"'+(a==0&&!aan?' disabled':'')+'>'+(aan?'✓ ':'')+eh(x[1])+' <small>'+a+'</small></button>'}).join('')+'</div></div>';
if(S.stroom.length||S.opp.length||S.kenm.length)h+='<p class="fnoot">Campings waarvan we dit nog niet hebben ingevuld, vallen af zodra je hierop filtert.</p>';
var o=function(w,t){return '<option value="'+w+'"'+(S.sort==w?' selected':'')+'>'+t+'</option>'};
h+='<div class="fgroep"><label class="flabel" for="fsort">Sorteren</label><select id="fsort">'+o('volgorde','Zoals wij ze op een rij zetten')+o('cijfer','Hoogste cijfer eerst')+o('naam','Naam, van A tot Z')+o('regio','Per land en provincie')+'</select></div>';
var fb=document.getElementById('fbouw');fb.innerHTML=h;
[].slice.call(fb.querySelectorAll('[data-f]')).forEach(function(b){b.onclick=function(){var k=b.getAttribute('data-f'),w=b.getAttribute('data-w');
if(k=='land'||k=='regio'||k=='stroom'||k=='opp'||k=='min'||k=='type'){if(w==='')S[k]=[];else{var v=(k=='stroom'||k=='opp'||k=='min')?+w:w,ix=S[k].indexOf(v);if(ix>=0)S[k].splice(ix,1);else S[k].push(v)}
if(k=='land')S.regio=S.regio.filter(function(r){return !S.land.length||S.land.indexOf(r.split('|')[0])>=0})}
else if(k=='k'){var ix2=S.kenm.indexOf(w);if(ix2>=0)S.kenm.splice(ix2,1);else S.kenm.push(w)}
else S[k]=w;
S.pick=null;teken()}});
document.getElementById('fsort').onchange=function(e){S.sort=e.target.value;teken(true)}}
function kopBijwerken(vis){var a=aantalActief(),kop=document.getElementById('fkop');
kop.innerHTML='<button type="button" id="ftoggle" class="ftoggle" aria-expanded="'+S.open+'" aria-controls="fpanel"><span aria-hidden="true">&#9776;</span> Filteren'+(a?' <span class="fbadge">'+a+'</span>':'')+' <span class="fpijl" aria-hidden="true">'+(S.open?'&#9650;':'&#9660;')+'</span></button><span id="ftel" aria-live="polite">'+(vis.length==C.length?'Alle '+vis.length+' campings':vis.length+' van de '+C.length+' campings')+'</span>'+(a?'<button type="button" id="fwis" class="fklein">Wis filters</button>':'');
document.getElementById('ftoggle').onclick=function(){S.open=!S.open;document.getElementById('fpanel').hidden=!S.open;kopBijwerken(vis);if(S.open)teken(true)};
var w=document.getElementById('fwis');if(w)w.onclick=function(){S.land=[];S.regio=[];S.stroom=[];S.opp=[];S.type=[];S.min=[];S.kenm=[];S.pick=null;teken()}}
function bouwSkelet(){f.innerHTML='<div class="fkop" id="fkop"></div><div id="fpanel" hidden><div id="fbouw"></div><div id="fkaartvak"></div></div>'}
function teken(alleenLijst){
if(!document.getElementById('fkop'))bouwSkelet();
var vis=gesorteerd(C.filter(passend));
if(!alleenLijst)bouwFilters();
kopBijwerken(vis);
tekenKaart(vis);
var zicht={};vis.forEach(function(c){zicht[c.id]=1});
C.forEach(function(c){if(els[c.id])els[c.id].hidden=!zicht[c.id]});
vis.forEach(function(c){if(els[c.id])l.appendChild(els[c.id])});
leeg.hidden=vis.length>0}
document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-ck]'):null;if(t)setTimeout(function(){teken(true)},0)});
teken();
})();
`;

// ---- thumbnails voor vlogknoppen: eenmalig ophalen en lokaal bewaren (geen verbinding met YouTube voor bezoekers)
const ytIdVan = u => { const r = String(u || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/); return r ? r[1] : ''; };
const haalThumb = async id => {
  if (!id) return '';
  const pad = `img/thumbs/${id}.jpg`;
  try { const b0 = fs.readFileSync(pad); if (b0.length > 2000 && b0[0] === 0xFF && b0[1] === 0xD8) return pad; } catch (e) { /* nog niet aanwezig */ }
  for (const naam of ['maxresdefault', 'hqdefault']) {
    try {
      const r = await fetch(`https://i.ytimg.com/vi/${id}/${naam}.jpg`);
      if (!r.ok) continue;
      const b = Buffer.from(await r.arrayBuffer());
      if (b.length < 2000 || b[0] !== 0xFF || b[1] !== 0xD8) continue;
      fs.mkdirSync('img/thumbs', { recursive: true });
      fs.writeFileSync(pad, b);
      return pad;
    } catch (e) { /* geen internet: val terug op het logo */ }
  }
  console.warn(`Thumbnail van ${id} niet gevonden, het YouTube-logo blijft staan.`);
  return '';
};

// ---- campings
for (const c of CAMPINGS) {
  if (!c.id) continue;
  // Alleen foto's die je in Beheer bij deze camping hebt gekozen
  const plekFotos = Array.isArray(c.fotos) ? c.fotos.filter(x => x && x.src) : [];
  // Video's: alleen wat je in Beheer bij deze camping hebt gekozen
  const geldig = u => /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(String(u || '').trim());
  const handmatig = [...(Array.isArray(c.vlogs) ? c.vlogs : []), ...(typeof c.vlog === 'string' ? c.vlog.split('\n') : [])].filter(Boolean).map(r => { if (typeof r === 'object') return { titel: schoon(r.titel), url: String(r.url || '').trim() }; const i = String(r).indexOf('|'); return i > 0 ? { titel: schoon(String(r).slice(0, i)), url: String(r).slice(i + 1).trim() } : { titel: '', url: String(r).trim() }; });
  const vloggen = handmatig.filter(v => geldig(v.url)).filter((v, i, A) => A.findIndex(x => x.url === v.url) === i);
  for (const v of vloggen) v.thumb = await haalThumb(ytIdVan(v.url));
  const feiten = [['Plaatsnummer', c.plaatsnr], ['Stroom', c.stroom ? c.stroom + ' A' : ''], ['Oppervlakte', c.opp ? c.opp + ' m\u00b2' : ''], ['Water op de plaats', c.water], ['Afvoer op de plaats', c.afvoer]].filter(x => x[1]).concat(Object.entries(c.info || {})).filter(x => x[1]);
  const naamPlaats = c.plaats && !String(c.naam).toLowerCase().includes(String(c.plaats).split(',')[0].toLowerCase()) ? `${c.naam} in ${c.plaats}` : c.naam;
  const plaatsKort = c.plaats ? c.plaats.split(',')[0] : '';
  const titel = `${c.naam} | onze ervaring${plaatsKort && !String(c.naam).toLowerCase().includes(plaatsKort.toLowerCase()) ? ' in ' + plaatsKort : ''}`;
  const beschrijving = kort(`${c.naam}${c.plaats ? ' (' + c.plaats + ')' : ''}: ${c.tekst || ''}`, 158);
  const body = `<h1>${esc(c.naam)}</h1>
${c.foto ? `<img class="foto" src="${esc(rel(c.foto))}" alt="${esc(naamPlaats)}">` : ''}
<p class="lead">${esc([c.plaats, c.regio, c.land, c.type, c.cijfer ? tx('campings.cijfer', 'Ons cijfer') + ': ' + c.cijfer : ''].filter(Boolean).join(' \u00b7 '))}</p>
<p class="lead">${esc(c.tekst || '')}</p>
${c.url ? `<p><a class="btn" href="${esc(c.url)}" target="_blank" rel="noopener nofollow">${esc(tx('campings.web', 'Naar de website'))}</a></p>` : ''}
${feiten.length ? `<h2 class="sec">${esc(tx('campings.info', 'Info over het park'))}</h2><div class="feiten">${feiten.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
${plekFotos.length ? `<h2 class="sec">${esc(tx('campings.fotos', 'Onze foto’s van deze plek'))}</h2><div class="fotos">${plekFotos.map(x => `<a href="${esc(rel(x.src))}" target="_blank" rel="noopener"><img src="${esc(rel(x.src))}" alt="${esc(schoon(x.tekst) || naamPlaats)}" loading="lazy"></a>`).join('')}</div><p><a class="btn s kl" href="../index.html#fotos">${esc(tx('campings.alle', 'Bekijk hier alle foto’s'))}</a></p>` : ''}
${(c.plus && c.plus.length) || (c.min && c.min.length) ? `<div class="pm"><div class="vlak"><h3>${esc(tx('campings.plus', 'Dit vonden we fijn'))}</h3>${lijst(c.plus)}</div><div class="vlak"><h3>${esc(tx('campings.min', 'Dit kan beter'))}</h3>${lijst(c.min)}</div></div>` : ''}
${vloggen.length ? `<h2 class="sec">${vloggen.length > 1 ? esc(tx('campings.vlog.kopmeer', 'Onze video\u2019s')) : esc(tx('campings.vlog.kop', 'Onze vlog'))}</h2><div class="vlogs">${vloggen.map((v, i) => `<a class="vlog${v.thumb ? ' vmet' : ''}" href="${esc(v.url)}" target="_blank" rel="noopener">${v.thumb ? `<span class="vth"><img src="${esc(rel(v.thumb))}" alt="" loading="lazy" onerror="this.closest('a').classList.remove('vmet');this.parentNode.replaceWith(document.createElement('i'))"><i aria-hidden="true"></i></span>` : '<i aria-hidden="true"></i>'}<span><b>${esc(v.titel || (vloggen.length > 1 ? tx('campings.vlog.titelmeer', 'Video {nr} van {naam}') : tx('campings.vlog.titel', 'Bekijk onze video van {naam}')).replace('{nr}', i + 1).replace('{naam}', c.naam))}</b><small>${esc(tx('campings.vlog.sub', 'Opent YouTube in een nieuw tabblad'))}</small></span></a>`).join('')}</div>` : ''}
${vloggen.length ? '' : ytStd()}
<p><a class="btn s" href="./">${esc(tx('campings.alle.knop', 'Alle campings'))}</a></p>`;
  const jsonld = c.cijfer ? {
    '@context': 'https://schema.org', '@type': 'Review',
    itemReviewed: { '@type': 'Campground', name: c.naam, ...(c.plaats ? { address: [c.plaats, c.regio, c.land].filter(Boolean).join(', ') } : {}), ...(c.lat && c.lon ? { geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lon } } : {}), ...(c.url ? { url: c.url } : {}) },
    reviewRating: { '@type': 'Rating', ratingValue: c.cijfer, bestRating: 10, worstRating: 1 },
    author: { '@type': 'Organization', name: SITE }, reviewBody: schoon(c.tekst)
  } : null;
  fs.writeFileSync(`campings/${c.id}.html`, pagina({ titel, beschrijving, pad: `campings/${c.id}.html`, afbeelding: c.foto, body, jsonld, actief: 'campings', kruimels: [[tx('menu.campings', 'Campings'), 'campings/'], [schoon(c.naam)]] }));
  urls.push([`campings/${c.id}.html`, 0.7]);
}
fs.writeFileSync('campings/index.html', pagina({ extra: 'campings', kruimels: [[tx('menu.campings', 'Campings')]],
  titel: 'Onze campings: ervaringen en cijfers',
  beschrijving: `Alle ${CAMPINGS.length} campings en vakantieparken waar wij met ons gezin en de caravan zijn geweest, met ons cijfer en wat wel en niet beviel.`,
  pad: 'campings/', afbeelding: (CAMPINGS[0] || {}).foto, actief: 'campings',
  script: `window.CAMPDATA=${JSON.stringify(CAMPINGS.filter(c => c.id).map(c => { const n = parseFloat(String(c.cijfer).replace(',', '.')); return { id: c.id, naam: schoon(c.naam), cijfer: c.cijfer ? String(c.cijfer) : '', n: isFinite(n) ? n : null, land: landVan(c), regio: regioVan(c), type: c.type || '', s: stroomVan(c), o: oppVan(c), k: kenmerkenVan(c), p: punt(c) }; })).replace(/</g, '\\u003c')};` + FILTERJS,
  body: `<h1>${esc(tx('campings.h2', 'Onze campings'))}</h1>
<p class="lead">${esc(tx('campings.lead', 'Dit zijn de campings en vakantieparken waar wij met ons gezin en de caravan zijn geweest. Bij elke camping lees je ons cijfer, wat wij fijn vonden en wat beter kon.'))}</p>
<div class="filters" id="filters"></div>
<div id="lijst" style="margin-top:22px">${CAMPINGS.filter(c => c.id).map(c => `<a class="camp" data-id="${esc(c.id)}" href="${esc(c.id)}.html">${c.foto ? `<img src="${esc(rel(c.foto))}" alt="" loading="lazy">` : ''}<div class="cijfer">${esc(c.cijfer || '\u2013')}</div><div><h3>${esc(c.naam)} <small>${esc([c.plaats, c.regio, c.land].filter(Boolean).join(' \u00b7 '))}</small></h3><p>${esc(kort(c.tekst, 160))}</p></div></a>`).join('')}</div>
${ytStd()}
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
  const body = `${kop}
${heeftLang(v) ? verhaalBlokken(v) : ''}
${ytStd()}
<p><a class="btn s" href="./">${esc(tx('verhalen.alle.knop', 'Alle verhalen'))}</a></p>`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'Article', headline: schoon(v.titel), description: kort(v.tekst, 200), image: abs(v.foto), author: { '@type': 'Organization', name: SITE }, mainEntityOfPage: `${BASE}/verhalen/${id}.html` };
  fs.writeFileSync(`verhalen/${id}.html`, pagina({ titel: schoon(v.titel), beschrijving: kort(v.tekst, 158) || `Een verhaal van ${SITE}.`, pad: `verhalen/${id}.html`, afbeelding: v.foto, body, jsonld, actief: 'verhalen', achter: 'mos', script: heeftLang(v) ? VERHAALSCRIPT : '', kruimels: [[tx('menu.verhalen', 'Verhalen'), 'verhalen/'], [schoon(v.titel)]] }));
  urls.push([`verhalen/${id}.html`, 0.6]);
});
fs.writeFileSync('verhalen/index.html', pagina({ extra: 'verhalen', kruimels: [[tx('menu.verhalen', 'Verhalen')]],
  titel: 'Verhalen van onze kampeertrips',
  beschrijving: 'Korte verslagen van onze kampeertrips en uitjes met de caravan.',
  pad: 'verhalen/', afbeelding: (VERHALEN[0] || {}).foto, actief: 'verhalen', achter: 'mos',
  body: `<h1>${esc(tx('verhalen.h2', 'Verhalen van onze avonturen'))}</h1><p class="lead">${esc(tx('verhalen.lead', 'Korte verslagen van onze trips en uitjes.'))}</p>
<div class="grid">${VERHALEN.map((v, i) => `<article class="kaart">${v.foto ? `<img src="${esc(rel(v.foto))}" alt="${esc(v.titel)}" loading="lazy">` : ''}<div><h3><a href="${gebruikt[i]}.html">${esc(v.titel)}</a></h3>${par(v.tekst)}${heeftLang(v) ? `<a class="btn" href="${gebruikt[i]}.html">${esc(tx('verhalen.meer', 'Lees meer'))}</a>` : ''}</div></article>`).join('')}</div>
${ytStd()}
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
const product = (q, s) => { const oud = !!q.oud, opm = schoon(q.opm);
  // Bij een product dat niet meer in gebruik is: knop naar het product dat we nu gebruiken (zelfde onderdeel)
  const nu = oud && q.vv && s ? s.p.find(z => z.n === q.vv && z.pid) : null;
  return `<div class="pk${oud ? ' oud' : ''}"${q.pid ? ` id="${esc(q.pid)}"` : ''}>${oud ? `<span class="badge">${esc(tx('uitrusting.niet', 'Niet meer in gebruik'))}</span>` : ''}${nu ? `<a class="nu" href="#${esc(nu.pid)}">Dit gebruiken we nu: ${esc(nu.n)} \u203a</a>` : ''}${q.foto ? `<img src="${esc(rel(q.foto))}" alt="${esc(q.n)}" loading="lazy">` : ''}<b>${esc(q.n)}</b>${opm ? `<p class="opm">${esc(opm)}</p>` : ''}${!oud && q.code ? `<div class="kc">${esc(tx('uitrusting.code', 'Kortingscode:'))} <b>${esc(q.code)}</b> <button type="button" data-kc="${esc(q.code)}">${esc(tx('uitrusting.kopieer', 'Kopieer'))}</button></div>` : ''}${/^https?:\/\//.test(q.url || '') ? `<a class="btn${oud ? ' s' : ''}" href="${esc(opschonen(q.url))}" target="_blank" rel="noopener noreferrer sponsored" data-gcn="${esc(q.n)}">${esc(oud ? tx('uitrusting.bekijk', 'Bekijk') : tx('uitrusting.koop', 'Bekijk / koop'))}</a>` : ''}</div>`; };

const catIds = [];
const UITCATS = [];
for (const [catNaam, subs] of Object.entries(UIT || {})) {
  const subLijst = [];
  const subIds = [];
  for (const [subNaam, v] of Object.entries(subs || {})) {
    const t = typeof v === 'string' ? v : (v && v.t) || '';
    const alle = ((v && v.p) || []).filter(q => q && q.n);
    const p = alle.filter(q => !q.oud), oud = alle.filter(q => q.oud);
    const ov = String(t).split(/\s*(?:,(?!\d)|\n)\s*/).map(schoon).filter(Boolean);
    if (!p.length && !oud.length && !ov.length) continue;
    const sid = uniekId(slug(subNaam, 'onderdeel'), subIds);
    [...p, ...oud].forEach(q => { q.pid = uniekId('p-' + slug(q.n, 'product'), subIds); });
    subLijst.push({ naam: cap(subNaam), id: sid, p, oud, ov });
  }
  if (!subLijst.length) continue;
  UITCATS.push({ naam: catNaam, id: uniekId(slug(catNaam, 'uitrusting'), catIds), subs: subLijst });
}

// Toont per uitrustingspagina maar één onderdeel tegelijk (Koken of Servies, niet allebei onder elkaar)
const SUBTABS = "var ss=[].slice.call(document.querySelectorAll('section.sub')),cs=[].slice.call(document.querySelectorAll('.chips a'));function toon(){var h=decodeURIComponent((location.hash||'').slice(1)),el=h?document.getElementById(h):null,f=(el&&el.closest('section.sub'))||ss.filter(function(x){return x.id==h})[0]||ss[0];ss.forEach(function(x){x.hidden=x!==f});cs.forEach(function(x){x.classList.toggle('on',x.getAttribute('href')=='#'+f.id)});if(el&&el!==f&&f.contains(el))setTimeout(function(){el.scrollIntoView({block:'start'})},0)}if(ss.length>1){window.addEventListener('hashchange',toon);toon()}";

const catFoto = c => (c.subs.flatMap(s => s.p).find(q => q.foto) || c.subs.flatMap(s => s.oud).find(q => q.foto) || {}).foto;
for (const c of UITCATS) {
  const foto = catFoto(c);
  const namen = c.subs.map(s => s.naam.toLowerCase()).join(', ');
  const beschrijving = kort(`${c.naam}: onze uitrusting voor de caravan en voortent. Dit gebruiken wij: ${namen}. Met foto's en links.`, 158);
  const secties = c.subs.map(s => `<section class="sub" id="${s.id}">
<h2>${esc(s.naam)}</h2>
${s.p.length ? `<div class="pgrid">${s.p.map(q => product(q, s)).join('')}</div>` : ''}
${s.ov.length ? `<div class="overig"><h3>${esc(tx('uitrusting.overig', 'Overige spullen'))}</h3><p class="klein">${esc(s.p.length || s.oud.length ? tx('uitrusting.overig.lead', 'Hier hebben we geen afbeelding of link van, maar dit gebruiken we ook.') : tx('uitrusting.overig.lead2', 'Dit gebruiken wij hiervoor.'))}</p><ul>${s.ov.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
${s.oud.length ? `<div class="eerder"><h3>${esc(tx('uitrusting.eerder', 'Eerder gebruikt'))}</h3><p class="klein">${esc(tx('uitrusting.eerder.lead', 'Dit hebben we eerder gebruikt, maar nu niet meer. Zo zie je wat er bij ons is veranderd.'))}</p><div class="pgrid">${s.oud.map(q => product(q, s)).join('')}</div></div>` : ''}
</section>`).join('\n');
  const body = `<h1>${esc(c.naam)}: onze uitrusting</h1>
<p class="lead">${esc(tx('uitrusting.cat.lead', 'Dit is onze uitrusting in de categorie {categorie}, zoals wij die gebruiken als we met de caravan op pad gaan. De links gaan naar webshops van andere partijen.').split('{categorie}').join(c.naam.toLowerCase()))}</p>
${c.subs.length > 1 ? `<div class="chips">${c.subs.map(s => `<a href="#${s.id}">${esc(s.naam)}</a>`).join('')}</div>` : ''}
${secties}
${NAARBOVEN}`;
  const items = c.subs.flatMap(s => s.p).map((q, i) => ({ '@type': 'ListItem', position: i + 1, name: schoon(q.n) }));
  const jsonld = items.length ? { '@context': 'https://schema.org', '@type': 'ItemList', name: `${c.naam}: onze uitrusting`, itemListElement: items } : null;
  fs.writeFileSync(`uitrusting/${c.id}.html`, pagina({ titel: `${c.naam}: onze uitrusting voor de caravan`, beschrijving, pad: `uitrusting/${c.id}.html`, afbeelding: foto, body, jsonld, actief: 'uitrusting', achter: 'nacht', script: SUBTABS, kruimels: [[tx('menu.uitrusting', 'Uitrusting'), 'uitrusting/'], [schoon(c.naam)]] }));
  urls.push([`uitrusting/${c.id}.html`, 0.7]);
}
fs.writeFileSync('uitrusting/index.html', pagina({ extra: 'uitrusting', kruimels: [[tx('menu.uitrusting', 'Uitrusting')]],
  titel: 'Onze uitrusting voor caravan en voortent',
  beschrijving: kort(`Wat er bij ons in de caravan en de voortent zit, per onderdeel: ${UITCATS.map(c => c.naam.toLowerCase()).join(', ')}.`, 158),
  pad: 'uitrusting/', afbeelding: UITCATS[0] ? catFoto(UITCATS[0]) : '', actief: 'uitrusting', achter: 'nacht',
  body: `<h1>${esc(tx('uitrusting.h2', 'Onze uitrusting'))}</h1>
<p class="lead">${esc(tx('uitrusting.lead', 'Wat er bij ons in de caravan en de voortent zit, per onderdeel. Zo zie je welke uitrusting voor kamperen met het gezin bij ons in de praktijk werkt.') + ' ' + tx('uitrusting.lead2', 'Dit is wat wij zelf gebruiken. De links gaan naar webshops van andere partijen.'))}</p>
<div style="margin-top:22px">${UITCATS.map(c => { const f = catFoto(c); return `<a class="camp" href="${c.id}.html">${f ? `<img src="${esc(rel(f))}" alt="" loading="lazy">` : ''}<div><h3>${esc(c.naam)}</h3><p>${esc(kort(c.subs.map(s => s.naam).join(', '), 160))}</p></div></a>`; }).join('')}</div>
`
}));

// ---- paklijst (zelfde vinkjes als op de website: opslag 'pak' en 'pakx')
const PAKCATS = Object.entries(PAK || {}).map(([k, a]) => [schoon(k), (Array.isArray(a) ? a : []).filter(x => schoon(x))]).filter(([, a]) => a.length);
const PAKAANTAL = PAKCATS.reduce((n, [, a]) => n + a.length, 0);
const CHKLIJST = (Array.isArray(CHK) ? CHK : []).filter(c => c && c.id && Array.isArray(c.cats));
const chkAantal = c => c.cats.reduce((n, t) => n + (t.i || []).length, 0);
const vink = (attr, waarde, tekst) => `<label><input type="checkbox" ${attr}="${esc(waarde)}"><span>${esc(tekst)}</span></label>`;
const voortgang = (n, wis) => `<div class="voortgang"><div class="balk"><i></i></div><b class="tel">0 van ${n} ingepakt</b><button class="btn" type="button" style="border:0;cursor:pointer;font:inherit;font-weight:700">${wis}</button></div>`;
const MAAKFN = `function maak(box,sleutel,attr,vol){var bx=[].slice.call(box.querySelectorAll('input')),balk=box.querySelector('.balk i'),tel=box.querySelector('.tel'),wis=box.querySelector('button.btn'),st={};
try{st=JSON.parse(localStorage.getItem(sleutel)||'{}')}catch(e){}
function upd(){var n=0;bx.forEach(function(b){var k=b.getAttribute(attr);if(b.checked)n++;if(vol)st[k]=b.checked;else if(b.checked)st[k]=true;else delete st[k]});
balk.style.width=(bx.length?100*n/bx.length:0)+'%';tel.textContent=n+' van '+bx.length+' ingepakt';try{localStorage.setItem(sleutel,JSON.stringify(st))}catch(e){}}
bx.forEach(function(b){b.checked=!!st[b.getAttribute(attr)];b.onchange=upd});wis.onclick=function(){bx.forEach(function(b){b.checked=false});upd()};upd()}`;
const PAKSCRIPT = MAAKFN + `
maak(document.getElementById('pakbox'),'pak','data-k',true);`;
const CHKSCRIPT = MAAKFN + `
maak(document.getElementById('chkbox'),'pakx','data-xk',false);`;
// Oude links zoals /paklijst/#zomer sturen door naar de eigen pagina
const CHKREDIR = ids => `var h=decodeURIComponent((location.hash||'').slice(1));if(h&&${JSON.stringify(ids)}.indexOf(h)>-1)location.replace(h+'.html');`;
// ---- losse checklistpagina's (een eigen adres per lijst, zodat Google ze apart vindt)
for (const c of CHKLIJST) {
  const n = chkAantal(c), naam = schoon(c.naam), laag = naam.toLowerCase();
  const titel = schoon(c.seoTitel) || `Checklist ${laag} kamperen met de caravan`;
  const beschrijving = kort(schoon(c.seoBeschrijving) || `${schoon(c.tekst) || 'Uitgebreide checklist'}: ${n} dingen in ${c.cats.length} onderdelen, zoals ${c.cats.slice(0, 4).map(t => schoon(t.n).toLowerCase()).join(', ')}. Vink af wat al is ingepakt.`, 158);
  const anderen = CHKLIJST.filter(x => x !== c);
  fs.writeFileSync(`paklijst/${c.id}.html`, pagina({
    titel, beschrijving, pad: `paklijst/${c.id}.html`, afbeelding: '', actief: 'paklijst', achter: 'mos', script: CHKSCRIPT,
    jsonld: { '@context': 'https://schema.org', '@type': 'ItemList', name: `${naam}: checklist kamperen met de caravan`, itemListElement: c.cats.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: schoon(t.n) })) },
    kruimels: [[tx('menu.paklijst', 'Wat neem je mee'), 'paklijst/'], [naam]],
    body: `<h1>${esc(schoon(c.tekst) || `Checklist ${laag}`)}</h1>
<p class="lead">${esc(`Onze uitgebreide checklist voor kamperen met de caravan: ${n} dingen in ${c.cats.length} onderdelen. Vink af wat al in de auto of caravan ligt. Jouw vinkjes blijven bewaard in deze browser.`)}</p>
<div id="chkbox">${voortgang(n, 'Deze lijst wissen')}
<div class="lijst">${c.cats.map(t => `<div class="cat"><h2>${esc(t.n)}</h2>${(t.i || []).map(x => vink('data-xk', c.id + '|' + t.n + '|' + x, x)).join('')}</div>`).join('')}</div></div>
<p style="margin-top:32px"><a class="btn" href="../paklijst/">${esc(tx('checklist.alg', 'Algemene paklijst'))}</a>${anderen.map(x => `<a class="btn s" href="${esc(x.id)}.html">${esc(x.naam)}</a>`).join('')}</p>
${NAARBOVEN}`
  }));
  urls.push([`paklijst/${c.id}.html`, 0.8]);
}
fs.writeFileSync('paklijst/index.html', pagina({ extra: 'paklijst', kruimels: [[tx('menu.paklijst', 'Wat neem je mee')]],
  titel: 'Paklijst voor de caravan: wat neem je mee?',
  beschrijving: kort(`Onze paklijst voor kamperen met de caravan: ${PAKAANTAL} dingen in ${PAKCATS.length} onderdelen, van vertrek en slapen tot koken en kinderen${CHKLIJST.length ? ', plus uitgebreide checklists per seizoen' : ''}. Zo vergeet je niets.`, 158),
  pad: 'paklijst/', afbeelding: '', actief: 'paklijst', achter: 'mos', script: (CHKLIJST.length ? CHKREDIR(CHKLIJST.map(c => c.id)) : '') + PAKSCRIPT,
  body: `<h1>${esc(tx('meenemen.h2', 'Wat neem je mee'))}</h1>
<p class="lead">${esc(tx('meenemen.lead', 'Onze paklijst voor een kampeertrip met de caravan. Vink af wat al in de auto of caravan ligt. Jouw vinkjes blijven bewaard in deze browser.'))}</p>
<div id="pakbox">${voortgang(PAKAANTAL, 'Alles wissen')}
<div class="lijst">${PAKCATS.map(([k, a]) => `<div class="cat"><h2>${esc(k)}</h2>${a.map(x => vink('data-k', x, x)).join('')}</div>`).join('')}</div></div>
${CHKLIJST.length ? `<div class="ukop"><h2>${esc(tx('paklijst.chk', 'Uitgebreide checklists'))}</h2><p class="lead">${esc(tx('paklijst.chk.lead', 'Wil je het nog uitgebreider? Kies een lijst, bijvoorbeeld voor een bepaald seizoen. Elke lijst heeft zijn eigen pagina en zijn eigen vinkjes.'))}</p>
<div style="margin-top:22px">${CHKLIJST.map(c => `<a class="camp" href="${esc(c.id)}.html"><div><h3>${esc(c.naam)}<small>${esc(c.tekst || 'Uitgebreide checklist')}</small></h3><p>${esc(kort(c.cats.map(t => t.n).join(', '), 160))}</p></div></a>`).join('')}</div></div>` : ''}
<p style="margin-top:32px"><a class="btn s" href="../uitrusting/">${esc(tx('checklist.uitr', 'Onze uitrusting'))}</a></p>`
}));

// ---- tips
const TIPLIJST = (Array.isArray(TIPS) ? TIPS : []).filter(t => t && t.titel);
fs.writeFileSync('tips/index.html', pagina({ extra: 'tips', kruimels: [[tx('menu.tips', 'Tips')]],
  titel: 'Kampeertips voor het hele gezin, uit eigen ervaring',
  beschrijving: kort(`${TIPLIJST.length} praktische tips voor kamperen met de caravan: ${TIPLIJST.map(t => schoon(t.titel).toLowerCase()).join(', ')}.`, 158),
  pad: 'tips/', afbeelding: '', actief: 'tips', achter: 'nacht',
  jsonld: TIPLIJST.length ? { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Kampeertips voor het hele gezin', itemListElement: TIPLIJST.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: schoon(t.titel), description: schoon(t.tekst) })) } : null,
  body: `<h1>${esc(tx('tips.h2', 'Kampeertips voor het hele gezin'))}</h1>
<p class="lead">${esc(tx('tips.lead', 'Dit hebben wij onderweg geleerd. Kleine dingen die het kamperen met de caravan makkelijker en gezelliger maken.'))}</p>
<div class="pm" style="margin-top:22px">${TIPLIJST.map(t => `<div class="vlak"><h2>${esc(schoon(t.titel))}</h2><p>${esc(schoon(t.tekst))}</p></div>`).join('')}</div>
<p><a class="btn" href="../paklijst/">${esc(tx('tips.knop', 'Onze paklijst'))}</a></p>
${ytStd()}`
}));

// ---- over ons
if (OVER && OVER.kop) {
  const alinea = (Array.isArray(OVER.tekst) ? OVER.tekst : [OVER.tekst]).map(schoon).filter(Boolean);
  const fotos = [[OVER.foto, OVER.alt], [OVER.foto2, OVER.alt2]].filter(f => f[0]);
  fs.writeFileSync('over-ons/index.html', pagina({ extra: 'over', kruimels: [[tx('menu.over', 'Over ons')]],
    titel: "Over ons: het kampeergezin achter d'n Dennenappeltjes",
    beschrijving: kort(alinea[0] || `Maak kennis met ${SITE}.`, 158),
    pad: 'over-ons/', afbeelding: OVER.foto, actief: 'over',
    jsonld: { '@context': 'https://schema.org', '@type': 'AboutPage', name: schoon(OVER.kop), mainEntity: { '@type': 'Organization', name: SITE, url: BASE, sameAs: ['https://youtube.com/@kamperenmetdndennenappeltjes'] } },
    body: `<div class="twee"><div><h1>${esc(OVER.kop)}</h1>
${alinea.map(t => `<p class="lead">${esc(t)}</p>`).join('\n')}
<a class="btn" href="https://youtube.com/@kamperenmetdndennenappeltjes" target="_blank" rel="noopener">${esc(tx('over.youtube', 'Kijk op YouTube'))}</a></div>
${fotos.length ? `<div class="fotos">${fotos.map(f => `<img class="foto" src="${esc(rel(f[0]))}" alt="${esc(f[1] || OVER.kop)}" loading="lazy">`).join('')}</div>` : ''}</div>`
  }));
}

// ---- sitemap en robots
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, pr]) => `  <url><loc>${BASE}/${p}</loc><lastmod>${vandaag}</lastmod><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`Klaar: ${CAMPINGS.length} campings, ${VERHALEN.length} verhalen, ${UITCATS.length} uitrustingspagina's, paklijst, ${TIPLIJST.length} tips, over ons, ${urls.length} adressen in de sitemap.`);
