// Klikker gjennom hele flyten i mobilstørrelse. Kjør: node tests/e2e.mjs  (med «npx vite preview --port 4173» i gang)
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const APP_URL = process.env.URL ?? 'http://localhost:4173/';
const UT = '/tmp/e2e';
const BILDE = `${UT}/bilde.jpg`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], acceptDownloads: true });
const page = await ctx.newPage();
const feil = [];
page.on('pageerror', (e) => feil.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().includes('409') && feil.push(m.text()));
page.on('dialog', (d) => d.accept());

// --- Falsk Dropbox (ekte innlogging testes på live-siden)
const opplastet = [];
let slettet = [];
await ctx.route('https://www.dropbox.com/oauth2/authorize**', (r) => {
  const u = new URL(r.request().url());
  r.fulfill({ status: 302, headers: { Location: u.searchParams.get('redirect_uri') + '?code=testkode' } });
});
await ctx.route('https://api.dropboxapi.com/oauth2/token', async (r) => {
  const body = new URLSearchParams(r.request().postData());
  if (body.get('grant_type') === 'authorization_code' && body.get('code') === 'testkode' && body.get('code_verifier'))
    return r.fulfill({ json: { access_token: 'tok', refresh_token: 'ref', expires_in: 14400 } });
  r.fulfill({ status: 400, body: 'feil' });
});
await ctx.route('https://api.dropboxapi.com/2/users/get_current_account', (r) => r.fulfill({ json: { email: 'espen@eksempel.no' } }));
await ctx.route('https://api.dropboxapi.com/2/files/delete_v2', (r) => {
  slettet.push(JSON.parse(r.request().postData()).path);
  r.fulfill({ status: 409, json: { error_summary: 'path_lookup/not_found/' } });
});
await ctx.route('https://content.dropboxapi.com/2/files/upload', (r) => {
  const arg = r.request().headers()['dropbox-api-arg'];
  opplastet.push({ arg, ascii: /^[\x00-\x7f]*$/.test(arg), sti: JSON.parse(arg).path, auth: r.request().headers()['authorization'], body: r.request().postDataBuffer() });
  r.fulfill({ json: { name: 'ok' } });
});

let n = 0;
const bilde = async (navn) => page.screenshot({ path: `${UT}/${String(++n).padStart(2, '0')}-${navn}.png`, fullPage: true });
const knapp = (navn, exact = true) => page.getByRole('button', { name: navn, exact });
const trykk = async (navn, exact = true) => { await knapp(navn, exact).first().click(); await page.waitForTimeout(80); };
const neste = async () => trykk(/^Neste/, false);
const overskrift = async (t) => {
  await page.getByRole('heading', { name: t, exact: true }).waitFor({ timeout: 3000 });
};
const skriv = async (t) => { await page.locator('input.inn').first().fill(t); };
const sjekk = (ok, tekst) => { if (!ok) throw new Error('FEIL: ' + tekst); console.log('✓', tekst); };

await page.goto(APP_URL);
await bilde('tom-liste');

// --- Ny befaring
await trykk('+ Ny befaring');
await page.fill('#navn', 'ola nordmann');
await page.fill('#tlf', '900 00 000');
await page.fill('#adr', 'Kongens gate 1, 7011 Trondheim');
await page.fill('#epost', 'ola@eksempel.no');
await trykk('Zipscreen');
await trykk('Interiørgardin');
await bilde('ny-befaring');
await trykk('Opprett befaring');
await page.getByRole('heading', { name: 'Ola Nordmann' }).waitFor();
sjekk(true, 'Kundenavn lagret med stor forbokstav');
sjekk(await page.locator('a[href^="tel:"]').count() === 1, 'Telefon er en ringelenke');
sjekk((await page.locator('a[href*="maps.apple.com"]').count()) === 1, 'Adresse åpner kart');

// --- Post 1: Honeycell
await trykk('+ Legg til post');
await overskrift('Kategori');
await trykk('Interiør');
await overskrift('Produkt');
await bilde('produktliste');
await trykk(/^Honeycell/, false);
await overskrift('Navn på post');
await trykk('Stue vest');
await neste();
await overskrift('Bilde');
await page.getByTestId('kamera').setInputFiles(BILDE);
await page.locator('.bilder img').first().waitFor();
await bilde('bilde-tatt');
await neste();
await overskrift('Type');
await bilde('type-standard');
sjekk((await page.locator('.valg button').allInnerTexts()).includes('Skråvindu – Honeycell'), 'Type har skråvindu-valg');
await neste(); // Honeycell standard
await overskrift('Bredde');
await skriv('120,4');
await bilde('maal-bredde');
const res = await page.locator('.resultat').innerText();
sjekk(res.includes('120,0') && res.includes('−0,4'), 'Honeycell bredde: 120,4 → 120,0 (−0,4)');
await neste();
await overskrift('Høyde');
await trykk('mm');
await skriv('1500');
sjekk((await page.locator('.resultat').innerText()).includes('150,0'), 'mm-bryter: 1500 mm → 150,0 cm');
await neste();
await overskrift('Plissetype');
await bilde('plissetype');
const typer = await page.locator('.valg button').allInnerTexts();
sjekk(typer.includes('P1600') && !typer.includes('P1740'), `Plissetyper for 120 × 150: ${typer.join(' ')}`);
await trykk('P1710');
await overskrift('Duktype');
const kolleksjoner = await page.locator('.valg button').count();
await page.locator('.sjekk', { hasText: 'lystette' }).click();
await bilde('duk-kolleksjon');
const bo = await page.locator('.valg button').allInnerTexts();
sjekk(bo.length < kolleksjoner && bo.every((t) => /\bBO\b/.test(t)), `Lystett-filter: ${kolleksjoner} → ${bo.length} kolleksjoner`);
await page.locator('.sjekk', { hasText: 'lystette' }).click();
await trykk('MISTRAL · gr. 1');
await bilde('duk-nummer');
await trykk('7410');
await overskrift('Profilfarge');
await trykk('HVIT');
await overskrift('Regulering');
await trykk('Venstre');
await overskrift('Feste');
await trykk('Vegg');
await overskrift('Underlag');
await trykk('Mur');
await overskrift('Standardvalg');
await bilde('standardvalg-honeycell');
const std = await page.locator('.liste-linje').allInnerTexts();
sjekk(std.some((t) => t.includes('Prisgruppe') && t.includes('1')), 'Prisgruppe 1 satt fra duken');
await page.locator('.liste-linje', { hasText: 'Antall' }).click();
await overskrift('Antall');
await skriv('2');
await neste();
await overskrift('Standardvalg');
sjekk(std.some((t) => t.includes('Benthin (Ny)')) && std.some((t) => t.includes('210')) && std.some((t) => t.includes('Standard')), 'Standardvalg: Benthin (Ny), 210, Standard');
// endre en standardlinje og kom tilbake
await page.locator('.liste-linje', { hasText: 'Monteringshøyde' }).click();
await overskrift('Monteringshøyde');
await skriv('230');
await neste();
await overskrift('Standardvalg');
sjekk((await page.locator('.liste-linje', { hasText: 'Monteringshøyde' }).innerText()).includes('230'), 'Endret standardvalg og returnerte til Standardvalg');
await trykk('Godkjenn alle');
await overskrift('Kommentar til posten');
await page.fill('textarea', 'Vindu mot vest, venstre');
await neste();
await overskrift('Posten er klar');
await bilde('ferdig');
await trykk('Kopier denne til nytt vindu');

// --- Post 2: kopi
await overskrift('Navn på post');
await skriv('Soverom 2');
await neste();
await overskrift('Bilde');
await trykk('Hopp over bilde');
await overskrift('Bredde');
sjekk((await page.locator('input.inn').first().inputValue()) === '', 'Kopi: målet er tømt');
await skriv('80');
await neste();
await overskrift('Høyde');
await skriv('100');
await neste();
await overskrift('Standardvalg');
await trykk('Godkjenn alle');
await overskrift('Kommentar til posten');
sjekk((await page.locator('textarea').inputValue()) === '', 'Kopi: kommentaren er tømt');
await trykk('Hopp over');
await overskrift('Posten er klar');
await trykk('Ny post');

// --- Post 3: Screen
await overskrift('Kategori');
await trykk('Eksteriør');
await trykk(/^Screen/, false);
await overskrift('Navn på post');
await trykk('Terrasse');
await neste();
await trykk('Hopp over bilde');
await overskrift('Størrelse');
await bilde('screen-storrelse');
await trykk('V550 M');
await overskrift('Bredde');
await skriv('315');
await page.locator('.sjekk', { hasText: 'sideskinner' }).click();
await bilde('screen-bredde');
sjekk((await page.locator('.resultat').innerText()).includes('323,2'), 'Screen bredde: 315 + sideskinner = 323,2');
sjekk((await page.locator('.varsel').allInnerTexts()).some((t) => t.includes('Large')), 'Varsel om Large bunnlist vises');

// --- Fortsetter der jeg slapp etter omstart
await page.reload();
await overskrift('Bredde');
sjekk((await page.locator('input.inn').first().inputValue()) === '315,0', 'Etter omstart: tilbake på Bredde med 315,0');
await neste();
await overskrift('Høyde');
await skriv('200');
await page.locator('.sjekk', { hasText: 'kassett' }).click();
sjekk((await page.locator('.resultat').innerText()).includes('216,0'), 'Screen høyde: 200 + kassett M 14 + stor bunnlist 2 = 216,0');
await neste();
await overskrift('Bunnlist');
await bilde('bunnlist-tvunget');
sjekk(await knapp('Small').isDisabled(), 'Small er sperret når bredden er over 300');
await neste();
await overskrift('Screenduk');
await trykk('3%');
await trykk('19.1106');
await overskrift('Kassettfarge');
await trykk('Hvit');
await overskrift('Betjening (motor)');
await bilde('motor');
await trykk('iMove solar sort panel');
await overskrift('Bryter / fjernkontroll');
const fk = await page.locator('.valg button').allInnerTexts();
sjekk(fk.join('|') === 'Ingen fjernkontroll|iMove fjernkontroll|iMove 15 kanalers fjernkontroll', 'imove gir egne fjernkontrollvalg');
await trykk('iMove fjernkontroll');
await overskrift('Regulering (side)');
await trykk('Høyre');
await overskrift('Utbygging'); // imove: strømkabel, kabellengde og støpsel hoppes over
sjekk(true, 'imove hopper over strømkabel, kabellengde og støpsel');
// test «Skriv selv»
await trykk('✎ Skriv selv');
await skriv('Hylser 15 mm');
await trykk('OK');
await overskrift('Utbygging – avstand');
await page.locator('.topp button').first().click(); // Tilbake
await overskrift('Utbygging');
await trykk('Hylser');
await overskrift('Utbygging – avstand');
await skriv('3');
await neste();
await overskrift('Utbygging fra eget lager?');
await trykk('Ja');
await overskrift('Feste');
await trykk('Vegg');
await overskrift('Underlag');
await trykk('Mur');
await overskrift('Etasje');
await trykk('2');
await overskrift('Lift');
await trykk('Nei');
await overskrift('Standardvalg');
await bilde('standardvalg-screen');
sjekk((await page.locator('.liste-linje', { hasText: 'Kassett type' }).innerText()).includes('Rett'), 'imove gir Rett kassett');
await trykk('Godkjenn alle');
await page.fill('textarea', 'Husk stige');
await neste();
await overskrift('Posten er klar');
await trykk('Ferdig');

// --- Befaringsside og eksport
await page.getByRole('heading', { name: 'Ola Nordmann' }).waitFor();
await page.fill('textarea', 'Kunden vil ha tilbud innen fredag.');
await page.locator('h3').first().click(); // blur → lagre
await bilde('befaring-med-poster');
const titler = await page.locator('.postkort .tittel').allInnerTexts();
sjekk(titler.length === 3 && titler[0] === 'Stue vest – Honeycell / Plissé – 2 stk', 'Postliste: ' + titler.join(' | '));
sjekk(await knapp('Koble til Dropbox for å lagre').isVisible(), 'Uten Dropbox: knapp for å koble til');

// --- Zip (reserve)
const [dl] = await Promise.all([page.waitForEvent('download'), trykk('Last ned som zip (reserve)')]);
const zip = `${UT}/${dl.suggestedFilename()}`;
await dl.saveAs(zip);
sjekk(fs.existsSync(zip), 'Zip lastet ned: ' + dl.suggestedFilename());

// --- Koble til Dropbox
await trykk('Koble til Dropbox for å lagre');
await trykk('Koble til Dropbox');
await page.getByText('Dropbox er koblet til.').waitFor();
sjekk((await page.locator('.info').allInnerTexts()).some((t) => t.includes('espen@eksempel.no')), 'Innlogging fullført, viser konto');
await bilde('dropbox-tilkoblet');
await page.locator('.topp button').first().click();
await trykk(/^Gjennomført/, false);
await page.locator('.kort', { hasText: 'Ola Nordmann' }).click();

// --- Uten nett: settes i kø
await ctx.setOffline(true);
await trykk('Lagre i Dropbox på nytt');
await page.getByText('Uten nett nå').waitFor();
sjekk(opplastet.length === 0, 'Uten nett: ingenting lastet opp, venter i kø');
await bilde('dropbox-venter');
// --- Nett tilbake: lastes opp automatisk
await ctx.setOffline(false);
await page.evaluate(() => window.dispatchEvent(new Event('online')));
for (let i = 0; i < 50 && !(await page.locator('.kunde .merke').innerText()).includes('eksportert'); i++) await page.waitForTimeout(100);
sjekk((await page.locator('.kunde .merke').innerText()) === 'eksportert', 'Nett tilbake: lastet opp automatisk, status eksportert');
const stier = opplastet.map((o) => o.sti);
console.log('   ' + stier.join('\n   '));
const mappe = '/Scandic Markiser/Befaringer/' + dl.suggestedFilename().replace('.zip', '');
sjekk(stier.includes(mappe + '/befaring.json') && stier.includes(mappe + '/oppsummering.md') && stier.includes(mappe + '/bilder/01-stue-vest-1.jpg'), 'Riktige filer i riktig Dropbox-mappe');
sjekk(opplastet.every((o) => o.ascii && o.auth === 'Bearer tok'), 'Dropbox-API-Arg er ASCII og token sendes');
sjekk(slettet.includes(mappe + '/bilder'), 'Gamle bilder ryddes før opplasting');
const json = JSON.parse(opplastet.find((o) => o.sti.endsWith('befaring.json')).body.toString('utf8'));
sjekk(json.poster.length === 3 && json.befaring.kunde.navn === 'Ola Nordmann', 'befaring.json i Dropbox har 3 poster');
const md = opplastet.find((o) => o.sti.endsWith('oppsummering.md')).body.toString('utf8');
sjekk(md.includes('Høyde') && md.includes('Ø') === md.includes('Ø'), 'oppsummering.md er UTF-8 (æøå bevart)');

// --- Rediger en ferdig post
await page.locator('.postkort').first().getByRole('button', { name: 'Rediger' }).click();
await page.getByRole('heading', { name: /Stue vest/ }).waitFor();
await bilde('rediger-oversikt');
await page.locator('.liste-linje', { hasText: 'Profilfarge' }).click();
await trykk('SORT');
await page.getByRole('heading', { name: /Stue vest/ }).waitFor();
sjekk((await page.locator('.liste-linje', { hasText: 'Profilfarge' }).innerText()).includes('SORT'), 'Rediger: endret profilfarge til Sort');
await trykk('Ferdig');
await page.getByRole('heading', { name: 'Ola Nordmann' }).waitFor();
sjekk((await page.locator('.kunde .merke').innerText()) === 'endret etter eksport', 'Status viser «endret etter eksport»');

// --- Liste
await page.locator('.topp button').first().click();
await trykk(/^Gjennomført/, false);
await bilde('liste-gjennomfort');

sjekk(feil.length === 0, 'Ingen feil i konsollen' + (feil.length ? ': ' + feil.join('; ') : ''));
await browser.close();
