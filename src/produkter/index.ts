// Produktkatalog. Rekkefølgen her er rekkefølgen i appen (mest solgt øverst).
import type { Kategori, Produkt } from '../motor/typer';
import { honeycell } from './honeycell';
import { screenV550 } from './screen-v550';
import { generelt } from './generelt';
import { insektsnetting, lamellgardin, persienne25, rullegardin } from './interior';
import {
  continent50Produkt, fasademarkise, scandic50Produkt, scandic80Produkt, standard50Produkt, terrassemarkise, vindusmarkise, zipscreenMini,
} from './eksterior';

export const produkter: Produkt[] = [
  // Interiør
  honeycell,
  persienne25,
  rullegardin,
  lamellgardin,
  insektsnetting,
  // Eksteriør
  screenV550,
  terrassemarkise,
  scandic80Produkt,
  scandic50Produkt,
  standard50Produkt,
  vindusmarkise,
  zipscreenMini,
  continent50Produkt,
  fasademarkise,
  generelt('dukskift', 'Dukskift', 'Eksteriør'),
  generelt('pergola', 'Pergola', 'Eksteriør'),
  generelt('levegg', 'Levegg', 'Eksteriør'),
  generelt('glasslosninger', 'Glassløsninger', 'Eksteriør'),
  // Garasjeporter
  generelt('garasjeport', 'Garasjeport', 'Garasjeporter'),
];

export const kategorier: Kategori[] = ['Interiør', 'Eksteriør', 'Garasjeporter'];

export const finnProdukt = (id: string | null): Produkt | null => produkter.find((p) => p.id === id) ?? null;
