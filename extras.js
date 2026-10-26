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

  /* 2. Paklijst printen of als PDF opslaan */
  var host = d.getElementById('pakbox') || d.getElementById('algemeen');
  if (host) {
    var kop = el('div', 'printkop', '<b>Paklijst</b> &middot; Kamperen met d\u2019n Dennenappeltjes<br><small>' + new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) + ' &middot; dennenappeltjes.nl/paklijst/</small>');
    var balk = el('div', 'pakacties',
      '<button type="button" data-p="mijn">\uD83D\uDDA8\uFE0F Printen / PDF (met mijn vinkjes)</button>' +
      '<button type="button" data-p="leeg">\uD83D\uDCCB Lege lijst printen</button>' +
      '<small>Voor een PDF kies je bij printer \u201COpslaan als PDF\u201D. Open eerst een uitgebreide checklist als je die ook wilt meenemen.</small>');
    var eerste = host.querySelector('.voortgang');
    host.insertBefore(kop, host.firstChild);
    host.insertBefore(balk, eerste || kop.nextSibling);
    var klaar = function () { d.body.classList.remove('blanco'); };
    addEventListener('afterprint', klaar);
    balk.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-p]'); if (!b) return;
      if (b.getAttribute('data-p') === 'leeg') d.body.classList.add('blanco');
      setTimeout(function () { window.print(); }, 60);
    });
  }
})();
