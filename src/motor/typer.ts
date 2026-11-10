// Typer for skjemamotoren. Produktene beskrives som data (se src/produkter/),
// og motoren (motor.ts) leser dem. Ingen produktlogikk her.

/** Hvor verdien kommer fra. Brukes i eksporten. */
export type Kilde = 'valgt' | 'standard' | 'skriv_selv' | 'automatisk';

export interface DukVerdi {
  kolleksjon: string;
  nummer: string;
}

export type Verdi = string | number | boolean | DukVerdi | null;

export interface Svar {
  verdi: Verdi;
  kilde: Kilde;
}

export type Maaltype = 'netto' | 'brutto' | 'lysåpning' | 'bestillingsmål' | 'ikke angitt';

export interface MaalSvar {
  /** Målt verdi i cm, slik den ble tastet (mm omregnes til cm før lagring). */
  maalt_cm: number | null;
  /** Avkryssinger på målskjermen, f.eks. «Legg til sideskinner». */
  avkryssinger: Record<string, boolean>;
  /** Manuelt overstyrt bestillingsmål i cm. null = bruk beregnet. */
  manuelt_cm: number | null;
  /** Valgt høydetrinn i cm (bare for felt med høydetrinn). */
  trinn_cm?: number | null;
}

/** Lesetilgang til gjeldende verdier i en post. Sendes til regler, betingelser og varsler. */
export interface K {
  /** Gjeldende verdi for et felt (svar, tvunget verdi eller standard). */
  verdi(id: string): Verdi;
  /** Bestillingsmål i cm for et målfelt (overstyrt eller beregnet). */
  bestilt(id: string): number | null;
  /** Beregnet bestillingsmål i cm (uten manuell overstyring). */
  beregnet(id: string): number | null;
  maalt(id: string): number | null;
  avkrysset(maalId: string, avkryssingId: string): boolean;
}

export interface Valg {
  /** Teksten slik den står i eBest. Lagres som verdi. */
  tekst: string;
  /** Liten forklaring under knappen (vises bare i appen). */
  under?: string;
  /** Tekst i eBest når den er en annen enn knappeteksten. */
  ebest?: string;
}

export interface DukGruppe {
  /** Kolleksjon / gruppe, f.eks. «MISTRAL» eller «3 %». */
  navn: string;
  /** Fargenumre. Tom liste = nummer skrives inn som fritekst. */
  numre: string[];
  /** Om kolleksjonsnavnet skal stå foran nummeret i eBest-teksten. */
  navnIEbest: boolean;
  /** Mal for eksakt eBest-tekst. {k} = kolleksjon, {n} = nummer. F.eks. '{k} - {n}' eller '{n} - {k}'. */
  ebestMal?: string;
  /** Merknad, f.eks. TODO om at listen mangler. */
  merknad?: string;
  /** Prisgruppen duken hører til (når alle grupper vises samlet). */
  prisgruppe?: string;
}

export interface RegelResultat {
  bestilt_cm: number;
  /** Lesbar beskrivelse av regelen som ble brukt, f.eks. «−0,4 cm (4 mm)». */
  regel: string;
}

interface StegFelles {
  id: string;
  ledetekst: string;
  /** Feltnavn i eBest (ordrett). Mangler = feltet finnes ikke i eBest (appens eget). */
  ebestFelt?: string;
  /** Måleinfo / fast infotekst. Vises alltid på skjermen. */
  hjelp?: string;
  /** 'steg' = egen skjerm, 'standardvalg' = linje på Standardvalg-skjermen. */
  plassering?: 'steg' | 'standardvalg';
  /** Betinget felt. Mangler = alltid synlig. */
  vis?: (k: K) => boolean;
  /** Varsler som vises på skjermen og tas med i eksporten. */
  varsler?: (k: K) => string[];
  /** Kan stå tomt. */
  valgfri?: boolean;
  /** Feltet skal ikke bestilles (f.eks. «fra eget lager»). Bare til info i eksporten. */
  merknadEksport?: string;
}

export interface ValgSteg extends StegFelles {
  type: 'valg';
  valg: Valg[] | ((k: K) => Valg[]);
  /** Tekster som vises som store knapper. Resten havner under «Flere». Mangler = alle vises. */
  hurtig?: string[];
  standard?: string | ((k: K) => string | undefined);
  /** Tvungen verdi, f.eks. Large bunnlist ved bred screen. */
  tving?: (k: K) => { verdi: string; melding: string } | null;
  /** Ukjent valg som fortsatt er gyldig (f.eks. ikke i eBest-listen). Standard: «Skriv selv» alltid på. */
  skrivSelv?: boolean;
}

export interface TallSteg extends StegFelles {
  type: 'tall';
  enhet?: string;
  heltall?: boolean;
  standard?: number;
  min?: number;
  max?: number;
}

export interface TekstSteg extends StegFelles {
  type: 'tekst';
  standard?: string;
  hurtig?: string[];
}

export interface AvkryssingSteg extends StegFelles {
  type: 'avkryssing';
  standard?: boolean;
}

export interface DukSteg extends StegFelles {
  type: 'duk';
  grupper: (k: K) => DukGruppe[];
  gruppeLedetekst?: string;
  /** Avkryssing øverst som filtrerer kolleksjonene, f.eks. «Bare lystette duker». */
  filter?: { tekst: string; test: (g: DukGruppe) => boolean };
}

export interface Hoydetrinn {
  cm: number;
  /** Dekkassehøyde for dette trinnet (utvendige persienner). */
  dekkasse?: number;
}

export interface MaalSteg extends StegFelles {
  type: 'maal';
  maaltype: Maaltype | ((avkrysset: (id: string) => boolean) => Maaltype);
  /** Faste høydetrinn fra eBest. Da velger jeg trinnet selv; målt verdi er valgfri og brukes bare til å markere forslag. */
  trinn?: (k: K) => Hoydetrinn[];
  /** Avkryssing som legger trinnets dekkassehøyde til målt høyde før forslaget finnes. */
  trinnTilleggId?: string;
  avkryssinger?: { id: string; tekst: string; standard?: boolean; vis?: (k: K) => boolean }[];
  regel: (maalt_cm: number, k: K, avkrysset: (id: string) => boolean) => RegelResultat;
  min?: number;
  max?: number;
}

export type Steg = ValgSteg | TallSteg | TekstSteg | AvkryssingSteg | DukSteg | MaalSteg;

export interface Produkt {
  id: string;
  navn: string;
  kategori: Kategori;
  /** Skjemaversjon for produktdefinisjonen. Økes ved endringer som påvirker eksporten. */
  versjon: number;
  /** eBest-sti, til info. */
  ebestSti?: string;
  /** Kort infotekst øverst i posten. */
  info?: string;
  /** Feltet som holder antall. */
  antallFelt: string;
  steg: Steg[];
  /** Merknad om at produktet bruker det generelle skjemaet inntil videre. */
  enkelt?: boolean;
}

export type Kategori = 'Interiør' | 'Eksteriør' | 'Garasjeporter';

export type Status = 'planlagt' | 'påbegynt' | 'ferdig' | 'endret etter eksport' | 'eksportert';

export interface Befaring {
  id: string;
  navn: string;
  telefon: string;
  adresse: string;
  epost: string;
  /** Lokal tid, 'ÅÅÅÅ-MM-DDTHH:mm'. */
  dato: string;
  produktinteresse: string[];
  sluttkommentar: string;
  fullfort: boolean;
  opprettet: number;
  endret: number;
  eksportert: number | null;
  kilde: 'manuell' | 'import';
  /** Venter på nett for opplasting til Dropbox. */
  dropboxVenter?: boolean;
  /** Siste feil fra Dropbox-opplasting. */
  dropboxFeil?: string;
}

export type PostModus = 'ny' | 'kopi' | 'rediger';

export interface Post {
  id: string;
  befaringId: string;
  rekkefolge: number;
  kategori: Kategori | null;
  produktId: string | null;
  navn: string;
  bildeIder: string[];
  bildeHoppetOver: boolean;
  svar: Record<string, Svar>;
  maal: Record<string, MaalSvar>;
  kommentar: string;
  /** Skjermen jeg står på (for å fortsette der jeg slapp). */
  skjerm: string;
  historikk: string[];
  retur: string | null;
  modus: PostModus;
  ferdig: boolean;
  opprettet: number;
  endret: number;
}

export interface Bilde {
  id: string;
  postId: string;
  blob: Blob;
  bredde: number;
  hoyde: number;
  opprettet: number;
}
