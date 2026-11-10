// Produktkatalog. Rekkefølgen her er rekkefølgen i appen (mest solgt øverst).
import type { Kategori, Produkt } from '../motor/typer';
import { honeycell } from './honeycell';
import { screenV550 } from './screen-v550';
import { generelt } from './generelt';

export const produkter: Produkt[] = [
  // Interiør
  honeycell,
  generelt('persienne-25', 'Persienne 25 mm', 'Interiør'),
  generelt('rullegardin', 'Rullegardin', 'Interiør'),
  generelt('lamellgardin', 'Lamellgardin', 'Interiør'),
  generelt('insektsnetting', 'Insektsnetting', 'Interiør'),
  // Eksteriør
  screenV550,
  generelt('terrassemarkise', 'Terrassemarkise', 'Eksteriør'),
  generelt('scandic-80', 'Scandic 80', 'Eksteriør'),
  generelt('scandic-50', 'Scandic 50', 'Eksteriør'),
  generelt('standard-50', 'Standard 50', 'Eksteriør'),
  generelt('vindusmarkise', 'Vindusmarkise', 'Eksteriør'),
  generelt('zipscreen-mini', 'Zipscreen Mini', 'Eksteriør'),
  generelt('continent-50', 'Continent 50', 'Eksteriør'),
  generelt('fasademarkise', 'Fasademarkise', 'Eksteriør'),
  generelt('dukskift', 'Dukskift', 'Eksteriør'),
  generelt('pergola', 'Pergola', 'Eksteriør'),
  generelt('levegg', 'Levegg', 'Eksteriør'),
  generelt('glasslosninger', 'Glassløsninger', 'Eksteriør'),
  // Garasjeporter
  generelt('garasjeport', 'Garasjeport', 'Garasjeporter'),
];

export const kategorier: Kategori[] = ['Interiør', 'Eksteriør', 'Garasjeporter'];

export const finnProdukt = (id: string | null): Produkt | null => produkter.find((p) => p.id === id) ?? null;
