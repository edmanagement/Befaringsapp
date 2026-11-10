// Honeycell- og plissé-duker per prisgruppe. Ordrett fra eBest (ebest-felt-og-valg.md, hentet 10.11.2026).
// Oppdater her når eBest endres. Format: kolleksjon → fargenumre.
import type { DukGruppe } from '../motor/typer';

const g = (navn: string, numre: string[]): DukGruppe => ({ navn, numre, navnIEbest: true });
const rekke = (fra: number, til: number, prefiks = '', pad = 0) =>
  Array.from({ length: til - fra + 1 }, (_, i) => prefiks + String(fra + i).padStart(pad, '0'));

export const honeycellDuker: Record<string, DukGruppe[]> = {
  '1': [
    g('IVREA BO', ['763-01', '763-04', '763-11', '763-13', '763-14']),
    g('MISTRAL', ['7410', '74102', '7412', '7415', '7416', '7417', '7420', '7421', '7422', '7423', '7425', '7427', '7428', '7429', '7430', '7434', '7439']),
    g('MISTRAL FULLTONE', rekke(74201, 74205)),
    g('MISTRAL (utgått)', ['7419']),
    g('MONSUN', ['7519', '7540', '7541']),
    g('PITTSBURGH', ['75007', '75009', '75010', '75011', '75012']),
    g('RIOJA', ['7720', '7725', '7727', '7728', '7729', '7730']),
    g('RIOJA FULLTONE', ['7720', '77803']),
  ],
  '2': [
    g('BURLINGTON', ['5541', '5542', '5543']),
    g('HALIFAX', rekke(5240, 5245)),
    g('MISTRAL BO', ['74703', '7460', '7462', '7465', '7466', '7467', '7469', '7470', '7471', '7472', '7473', '7475', '7477', '7478', '7479', '7480', '7484', '7489', '7491']),
    g('MISTRAL BO FULLTONE', ['74704', '74705', '75703', '75705']),
    g('RIOJA BO FULLTONE', ['77903']),
    g('WESTMOUNT FR', ['75501', '75510', '75511']),
  ],
  '3': [
    g('ATLANTA', ['7560', '7563', '7570', '7590']),
    g('BURLINGTON BO', ['5561', '5562', '5563', '5569']),
    g('DENVER', ['58502', '58503', '58505', '58506']),
    g('EDMONTON', ['5509', '5510', '5514', '5515']),
    g('HALIFAX', ['5240', '5243', '5247']),
    g('HALIFAX BO', rekke(5260, 5265)),
    g('MONSUN BO', ['7619', '7640', '7641']),
    g('RIOJA BO', ['7750', '7755', '7757', '7758', '7759', '7760']),
    g('WESTMOUNT BO FR', ['76514']),
  ],
  '4': [
    g('ATLANTA BO', ['7660', '7662', '7669', '7691']),
    g('HAMILTON', ['5360', '5363', '5364', '5367', '5368']),
    g('OXFORD', ['5220', '5221', '5225', '5226', '5227', '5228', '5229']),
  ],
  '5': [g('IVREA', rekke(1, 15, '753-', 2))],
};

// TODO: fyll inn fra eBest – fargenumre per plissé-kolleksjon. Til da skrives nummeret inn som fritekst.
const p = (navn: string): DukGruppe => ({
  navn,
  numre: [],
  navnIEbest: true,
  merknad: 'Fargenumre mangler i appen – skriv nummeret.',
});

export const plisseDuker: Record<string, DukGruppe[]> = {
  E: ['Basel', 'Petra'].map(p),
  '1': ['Amazon', 'Bari', 'Basel', 'Crush Pearl', 'Jaipur', 'Jakarta', 'Kaduna Pearl', 'Milano', 'Opera', 'Ordos', 'Oslo Pearl', 'Salerno', 'Sinai', 'Tigris Pearl', 'Tirari', 'Valencia', 'Venedig'].map(p),
  '2': ['Auckland', 'Frankfurt', 'Kenzo', 'Lund BO', 'Nevada', 'New York', 'Palermo', 'Seto'].map(p),
};

/** Plissetyper. P1740 og P1751 er med selv om de ikke dukket opp i eBest-listen for ett testmål. */
export const plissetyperHurtig = ['P1600', 'P1615', 'P1616', 'P1700', 'P1710', 'P1740', 'P1751'];
export const plissetyperFlere = ['P1610', 'P1636', 'P1705', 'P1715', 'P1800', 'P1805', 'P1900Z'];
