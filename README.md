# Kamperen met d'n Dennenappeltjes

## Online zetten met GitHub Pages (eenmalig)
1. Op github.com: **New repository**, naam bijvoorbeeld `dennenappeltjes`, zet hem op **Public**.
2. Kies **uploading an existing file** en sleep alle bestanden en mappen uit deze zip erin (index.html, data, img). Klik **Commit changes**.
3. Ga naar **Settings > Pages**. Kies bij Source **Deploy from a branch**, branch **main**, map **/(root)**, en klik Save.
4. Na een minuut staat je site op `https://JOUWNAAM.github.io/dennenappeltjes/`.

## Zelf aanpassen
Elke aanpassing: bestand openen op GitHub, potlood-icoon, wijzigen, **Commit changes**. Na ongeveer een minuut staat het online.
- `data/campings.js`: campings. Kopieer een blok `{...}` en pas het aan. Met `"foto":"img/naam.jpg"` komt er een foto bij, met `"cijfer":8.5` een cijfer, met `"plus":["..."]` en `"min":["..."]` de punten.
- `data/uitrusting.js`: de uitrustingspagina, per categorie en onderdeel.
- `data/paklijst.js`: de paklijst "Wat nemen we mee".
- `data/videos.js`: de tegels op de videopagina.
- Foto's: map `img`, dan **Add file > Upload files**. Houd ze onder ca. 500 KB (verklein ze eerst) voor een snelle site.
- Let op: haakjes, aanhalingstekens en komma's tussen de blokken moeten kloppen. Verandert er iets raars, kies dan **History** op GitHub en ga terug naar de vorige versie.

## Eigen webadres (later)
Koop een domein, vul dat bij Settings > Pages onder Custom domain in en volg de DNS-aanwijzingen van GitHub.

## Beheren vanaf je telefoon (beheer.html)
Na het online zetten kun je op `https://JOUWNAAM.github.io/dennenappeltjes/beheer.html` campings, uitrusting en paklijst aanpassen en foto's kiezen, zonder GitHub zelf te openen.
Eenmalig een token maken (gebeurt alleen in je eigen browser, deel hem met niemand, ook niet met Claude):
1. GitHub > je profielfoto > **Settings** > **Developer settings** > **Personal access tokens** > **Fine-grained tokens** > **Generate new token**.
2. Naam: `beheer`. Kies een verloopdatum. Bij **Repository access**: **Only select repositories** en kies je site-repository.
3. Bij **Permissions** > **Repository permissions**: zet **Contents** op **Read and write**. Klik Generate token en kopieer hem.
4. Open `beheer.html` op je telefoon, vul je gebruikersnaam, de naam van de repository en het token in. Daarna kun je beheren. Zet de pagina op je beginscherm voor snelle toegang.
Elke keer **Opslaan en publiceren** kiezen. Na ongeveer een minuut staat de wijziging op de site.
