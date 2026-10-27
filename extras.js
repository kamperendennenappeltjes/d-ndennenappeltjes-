/* extras.js: terug-naar-boven en printbare paklijst */
(function () {
  'use strict';
  var d = document;


  function el(tag, cls, html) { var e = d.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* 1. Terug naar boven */
  var up = el('button', 'totop', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>');
  up.type = 'button'; up.setAttribute('aria-label', 'Terug naar boven'); up.title = 'Terug naar boven';
  up.onclick = function () {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };
  d.body.appendChild(up);
  var tick = false;
  function toon() { tick = false; up.classList.toggle('zie', (window.pageYOffset || d.documentElement.scrollTop) > 700); }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(toon); } }, { passive: true });
  toon();

  /* 2. Paklijst en uitgebreide checklists printen of als PDF opslaan */
  var DATUM = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  var TIP = 'Voor een PDF kies je bij printer \u201COpslaan als PDF\u201D.';
  function knoppen(attr, mijn, leeg) {
    return el('div', 'pakacties', '<button type="button" ' + attr + '="mijn">\uD83D\uDDA8\uFE0F ' + mijn + '</button><button type="button" ' + attr + '="leeg">\uD83D\uDCCB ' + leeg + '</button><small>' + TIP + '</small>');
  }

  /* modus: 'print-pak' = alleen de algemene lijst, 'print-ck' = alleen de checklist in doel */
  function druk(modus, doel, leeg) {
    var b = d.body, kop = null, was = null;
    b.classList.add(modus); if (leeg) b.classList.add('blanco');
    if (modus === 'print-ck') {
      doel.classList.add('print-doel');
      if (doel.tagName === 'DETAILS') { was = doel.open; doel.open = true; }
      var t = ((doel.querySelector('summary b') || doel.querySelector('h2') || {}).textContent || 'Checklist');
      kop = el('div', 'printkop', '<b></b> &middot; Kamperen met d\u2019n Dennenappeltjes<br><small>' + DATUM + '</small>');
      kop.firstChild.textContent = t;
      var sm = doel.querySelector('summary');
      doel.insertBefore(kop, sm ? sm.nextSibling : doel.firstChild);
    }
    function klaar() {
      removeEventListener('afterprint', klaar);
      b.classList.remove(modus, 'blanco');
      if (kop) kop.remove();
      if (doel) { doel.classList.remove('print-doel'); if (was === false) doel.open = false; }
    }
    addEventListener('afterprint', klaar);
    setTimeout(function () { window.print(); }, 60);
  }

  /* algemene paklijst */
  var host = d.getElementById('pakbox') || d.getElementById('algemeen');
  if (host) {
    var kop0 = el('div', 'printkop', '<b>Paklijst</b> &middot; Kamperen met d\u2019n Dennenappeltjes<br><small>' + DATUM + ' &middot; dennenappeltjes.nl/paklijst/</small>');
    var balk = knoppen('data-p', 'Printen / PDF (met mijn vinkjes)', 'Lege lijst printen');
    host.insertBefore(kop0, host.firstChild);
    host.insertBefore(balk, host.querySelector('.voortgang') || kop0.nextSibling);
  }

  /* uitgebreide checklists: elk zijn eigen knoppen (op de aparte pagina en op de homepage) */
  function ckKnoppen() {
    [].forEach.call(d.querySelectorAll('details.uk'), function (dt) {
      if (dt.querySelector('.pakacties')) return;
      var v = dt.querySelector('.voortgang'); if (!v) return;
      v.parentNode.insertBefore(knoppen('data-ck', 'Deze lijst printen / PDF', 'Lege lijst printen'), v);
    });
    var cb = d.getElementById('ckbody');
    if (cb && cb.querySelector('.voortgang') && !cb.querySelector('.pakacties'))
      cb.insertBefore(knoppen('data-ck', 'Deze lijst printen / PDF', 'Lege lijst printen'), cb.querySelector('.voortgang'));
  }
  ckKnoppen();
  var ub = d.getElementById('uitgebreid');
  if (ub && window.MutationObserver) new MutationObserver(ckKnoppen).observe(ub, { childList: true, subtree: true });

  d.addEventListener('click', function (e) {
    var p = e.target.closest && e.target.closest('button[data-p],button[data-ck]'); if (!p) return;
    var leeg = (p.getAttribute('data-p') || p.getAttribute('data-ck')) === 'leeg';
    if (p.hasAttribute('data-p')) return druk('print-pak', null, leeg);
    var doel = p.closest('details.uk') || d.getElementById('uitgebreid');
    if (doel) druk('print-ck', doel, leeg);
  });
})();
