// Etappe 2: import, høydetrinn (Persienne 25, Scandic 50), markiseduk-søk (Terrassemarkise).
// Kjør: node tests/e2e-etappe2.mjs  (med «npx vite preview --port 4173» i gang)
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const APP_URL = process.env.URL ?? 'http://localhost:4173/';
const UT = '/tmp/e2e2';
fs.mkdirSync(UT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], acceptDownloads: true });
const page = await ctx.newPage();
const feil = [];
page.on('pageerror', (e) => feil.push(e.message));
page.on('console', (m) => m.type() === 'error' && feil.push(m.text()));
page.on('dialog', (d) => d.accept());

let n = 0;
const bilde = async (navn) => page.screenshot({ path: `${UT}/${String(++n).padStart(2, '0')}-${navn}.png`, fullPage: false });
const knapp = (navn, exact = true) => page.getByRole('button', { name: navn, exact });
const trykk = async (navn, exact = true) => { await knapp(navn, exact).first().click(); await page.waitForTimeout(80); };
const neste = async () => trykk(/^Neste/, false);
const overskrift = (t) => page.getByRole('heading', { name: t, exact: true }).waitFor({ timeout: 3000 });
const skriv = async (t) => { await page.locator('input.inn').first().fill(t); };
const sjekk = (ok, tekst) => { if (!ok) throw new Error('FEIL: ' + tekst); console.log('✓', tekst); };

await page.goto(APP_URL);

// --- Import
const imp = `${UT}/befaringer.json`;
fs.writeFileSync(imp, JSON.stringify([
  { navn: 'kari hansen', telefon: '912 34 567', adresse: 'Fjordgata 1, Trondheim', dato: '2030-05-12 10:00', produktinteresse: 'Utvendig persienne, Markise' },
  { navn: 'per pedersen', telefon: '98765432', dato: '2030-05-13T14:30', produktinteresse: ['Interiørgardin'] },
]));
await page.getByTestId('import').setInputFiles(imp);
await page.getByText('Importert 2 befaringer.').waitFor();
await page.getByTestId('import').setInputFiles(imp);
await page.getByText('Importert 0 befaringer. 2 fantes fra før.').waitFor();
sjekk(true, 'Import: 2 nye, andre gang 0 (ingen duplikater)');
const navn = await page.locator('.kort .navn').allInnerTexts();
sjekk(navn[0] === 'Kari Hansen' && navn[1] === 'Per Pedersen', 'Importerte står i rekkefølge med stor forbokstav: ' + navn.join(', '));
await bilde('import');

// --- Persienne 25 hos Per
await page.locator('.kort', { hasText: 'Per Pedersen' }).click();
await trykk('+ Legg til post');
await trykk('Interiør');
await trykk(/^Persienne 25/, false);
await trykk('Kjøkken'); await neste();
await trykk('Hopp over bilde');
await overskrift('Bredde'); await skriv('100');
sjekk((await page.locator('.resultat').innerText()).includes('99,6'), 'Persienne 25: 100 → 99,6');
await neste();
await overskrift('Høyde');
sjekk(await knapp(/^Neste/, false).isDisabled(), 'Høyde: Neste sperret til trinn er valgt');
await skriv('120,1');
await page.locator('.trinn.forslag').waitFor();
sjekk((await page.locator('.trinn.forslag').innerText()).includes('122,1'), 'Forslag nærmeste trinn over 120,1 = 122,1');
await bilde('persienne-trinn');
await page.locator('.trinn', { hasText: '124,3 cm' }).click();
await overskrift('Lamellfarge');
await trykk('Opl 0717 = 0717');
await overskrift('Betjening'); await neste(); // standard
await overskrift('Vendestav / fjernkontroll');
await trykk('Lengde vendestav, 40cm');
await trykk('Venstre');
await trykk('Vegg');
await trykk('Mur');
await overskrift('Standardvalg');
await trykk('Godkjenn alle');
await trykk('Hopp over');
await overskrift('Posten er klar');
await trykk('Ferdig');

// --- Scandic 50 + Terrassemarkise hos Kari
await page.locator('.topp button').first().click();
await page.locator('.kort', { hasText: 'Kari Hansen' }).click();
await trykk('+ Legg til post');
await trykk('Eksteriør');
await trykk('Scandic 50');
await trykk('Stue sør'); await neste();
await trykk('Hopp over bilde');
await overskrift('Bredde'); await skriv('118,5');
sjekk((await page.locator('.resultat').innerText()).includes('128,5'), 'Scandic 50 bredde: 118,5 → 128,5 (+10)');
await neste();
await overskrift('Høyde');
await skriv('85');
await page.locator('.trinn.forslag').waitFor();
sjekk((await page.locator('.trinn.forslag').innerText()).includes('101,0'), 'Scandic 50: målt 85 + dekkasse → forslag 101,0');
await page.locator('.sjekk', { hasText: 'dekkassehøyde' }).click();
await page.waitForTimeout(100);
sjekk((await page.locator('.trinn.forslag').innerText()).includes('88,4'), 'Uten dekkasse → forslag 88,4');
await page.locator('.sjekk', { hasText: 'dekkassehøyde' }).click();
await bilde('scandic50-trinn');
await page.locator('.trinn.forslag').click();
await trykk('7016');
await overskrift('Dekkasse'); await trykk('Ja');
await overskrift('Dekkassefarge'); await trykk('020 - Hvit');
await overskrift('Vannbrett'); await trykk('Under');
await trykk('1,6 - 3,5cm');
await overskrift('Betjening'); await trykk('Persiennemotor IO 10m²');
await overskrift('Lengde / bryter / fjernkontroll'); await trykk('Situo IO Pure fjernkontroll');
await overskrift('Kabel'); await trykk('10m hvit med koblet hirschmann');
await overskrift('Regulering');
sjekk((await page.locator('.valg button').allInnerTexts()).join('|') === 'Venstre|Midten|Høyre', 'Motor: regulering uten «Innfelt»');
await trykk('Høyre');
await trykk('Vegg'); await trykk('Mur'); await trykk('1'); await trykk('Nei');
await overskrift('Standardvalg');
await bilde('scandic50-standardvalg');
const std = await page.locator('.liste-linje').allInnerTexts();
sjekk(std.some((t) => t.includes('Nei, Frittstående')), 'Kobles standard «Nei, Frittstående»');
sjekk(!std.some((t) => t.includes('Braketter')), 'Braketter spørres ikke om');
await trykk('Godkjenn alle');
await trykk('Hopp over');
await overskrift('Posten er klar');
await trykk('Ny post');

await trykk('Eksteriør');
await trykk('Terrassemarkise');
await trykk('Terrasse'); await neste();
await trykk('Hopp over bilde');
await overskrift('Modell'); await trykk('Premium');
await overskrift('Stativfarge'); await trykk('Hvit (RAL 9010)');
await overskrift('Bredde'); await skriv('450'); await neste();
await overskrift('Utfall'); await trykk('300');
await overskrift('Duktype'); await neste(); // Standard
await overskrift('Dukfarge');
await page.getByLabel('Søk fargenummer').fill('5400/');
await bilde('markiseduk-sok');
const treff = await page.locator('.valg.to button').allInnerTexts();
sjekk(treff.length === 7 && treff.every((t) => t.startsWith('5400')), `Duksøk «5400/» gir ${treff.length} treff`);
await trykk('5400/24');
await trykk('Bølget');
await overskrift('Kantbånd'); await trykk('Ja');
await trykk('84');
await overskrift('Betjening'); await trykk('Somfy Sunilus io 30/17');
await overskrift('Sveiv / fjernkontroll / bryter'); await trykk('Smoove Origin IO fjernkontroll');
await overskrift('Kabel'); await trykk('Tillegg, 5m Sort');
await overskrift('Vindsikring'); await trykk('Ja, Eolis 3D sensor io');
await overskrift('Regulering (side)'); await trykk('Høyre');
await overskrift('Hev/Senk'); await trykk('Nei');
await overskrift('Feste'); await trykk('Vegg');
await trykk('Mur'); await trykk('1'); await trykk('Nei');
await overskrift('Standardvalg'); await trykk('Godkjenn alle');
await trykk('Hopp over');
await overskrift('Posten er klar');
await trykk('Ferdig');

// --- Eksport (zip) og sjekk innhold
const [dl] = await Promise.all([page.waitForEvent('download'), trykk('Last ned som zip (reserve)')]);
const zip = `${UT}/${dl.suggestedFilename()}`;
await dl.saveAs(zip);
execSync(`rm -rf ${UT}/ut && mkdir ${UT}/ut && cd ${UT}/ut && unzip -q "${zip}"`);
const mappe = fs.readdirSync(`${UT}/ut`)[0];
const e = JSON.parse(fs.readFileSync(`${UT}/ut/${mappe}/befaring.json`, 'utf8'));
const [sc, tm] = e.poster;
const h = sc.maal.find((m) => m.id === 'hoyde');
sjekk(h.hoydetrinn && h.maalt_cm === 85 && h.beregnet_cm === 101 && h.bestillingsmaal_cm === 101, 'Eksport: høydetrinn med målt, forslag og valgt trinn');
sjekk(sc.felt.find((f) => f.id === 'sammenkobling').kilde === 'standard', 'Eksport: sammenkobling merket som standard');
sjekk(tm.felt.find((f) => f.id === 'dukfarge').ebest_tekst === '5400/24', 'Eksport: markiseduk 5400/24');
sjekk(tm.felt.find((f) => f.id === 'vindsikring').ebest_tekst === 'Ja, Eolis 3D sensor io', 'Eksport: vindsikring Eolis');
sjekk(e.poster.every((p) => p.mangler.length === 0 && !p.produkt.enkelt_skjema), 'Eksport: ingen mangler, ingen enkle skjema');
console.log(fs.readFileSync(`${UT}/ut/${mappe}/oppsummering.md`, 'utf8').split('\n').slice(8, 22).join('\n'));

sjekk(feil.length === 0, 'Ingen feil i konsollen' + (feil.length ? ': ' + feil.join('; ') : ''));
await browser.close();
