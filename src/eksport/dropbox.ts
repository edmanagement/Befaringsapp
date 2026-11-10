// Direkte opplasting til Dropbox. Innlogging med OAuth 2 + PKCE (ingen server, ingen hemmelig nøkkel i appen).
// Tokenet lagres bare på telefonen.
import { db } from '../db/db';

/** App-nøkkel fra Dropbox-appen «Scandic Befaring» (offentlig verdi, ikke en hemmelighet). */
export const DROPBOX_APP_KEY = 'jxq8r6gxl0luapq';
/** Mappen befaringene lagres i. */
export const DROPBOX_ROT = '/Scandic Markiser/Befaringer';

const AUTH_URL = 'https://www.dropbox.com/oauth2/authorize';
const TOKEN_URL = 'https://api.dropboxapi.com/oauth2/token';
const API = 'https://api.dropboxapi.com/2';
const CONTENT = 'https://content.dropboxapi.com/2';
const VERIFIER_KEY = 'dropbox-pkce-verifier';

interface Tokens {
  refresh_token: string;
  access_token: string;
  utloper: number;
  konto?: string;
}

export const redirectUri = (): string => location.origin + location.pathname;

async function hentTokens(): Promise<Tokens | null> {
  const r = await db.meta.get('dropbox');
  return (r?.verdi as Tokens) ?? null;
}
async function lagreTokens(t: Tokens | null): Promise<void> {
  if (t) await db.meta.put({ nokkel: 'dropbox', verdi: t });
  else await db.meta.delete('dropbox');
}

export async function erTilkoblet(): Promise<{ tilkoblet: boolean; konto?: string }> {
  const t = await hentTokens();
  return { tilkoblet: !!t, konto: t?.konto };
}

export async function kobleFra(): Promise<void> {
  const t = await hentTokens();
  if (t) {
    try {
      await fetch(`${API}/auth/token/revoke`, { method: 'POST', headers: { Authorization: `Bearer ${t.access_token}` } });
    } catch { /* ignorer */ }
  }
  await lagreTokens(null);
}

// ---------- PKCE ----------

function base64url(bytes: Uint8Array): string {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function startInnlogging(): Promise<void> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  localStorage.setItem(VERIFIER_KEY, verifier);
  const q = new URLSearchParams({
    client_id: DROPBOX_APP_KEY,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    token_access_type: 'offline',
    redirect_uri: redirectUri(),
  });
  location.href = `${AUTH_URL}?${q}`;
}

/** Kalles ved oppstart. Fullfører innloggingen hvis Dropbox sendte oss tilbake med ?code=. */
export async function fullforInnloggingFraUrl(): Promise<'ok' | 'feil' | null> {
  const q = new URLSearchParams(location.search);
  const code = q.get('code');
  const feil = q.get('error');
  if (!code && !feil) return null;
  history.replaceState(null, '', redirectUri() + '#/innstillinger');
  if (feil || !code) return 'feil';
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) return 'feil';
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    body: new URLSearchParams({
      code, grant_type: 'authorization_code', code_verifier: verifier, client_id: DROPBOX_APP_KEY, redirect_uri: redirectUri(),
    }),
  });
  localStorage.removeItem(VERIFIER_KEY);
  if (!r.ok) return 'feil';
  const d = await r.json();
  const t: Tokens = { refresh_token: d.refresh_token, access_token: d.access_token, utloper: Date.now() + d.expires_in * 1000 };
  try {
    const k = await fetch(`${API}/users/get_current_account`, { method: 'POST', headers: { Authorization: `Bearer ${t.access_token}` } });
    if (k.ok) t.konto = (await k.json()).email;
  } catch { /* ikke viktig */ }
  await lagreTokens(t);
  return 'ok';
}

async function accessToken(): Promise<string> {
  const t = await hentTokens();
  if (!t) throw new DropboxFeil('Ikke koblet til Dropbox', 'ikke_tilkoblet');
  if (t.utloper - 60_000 > Date.now()) return t.access_token;
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: t.refresh_token, client_id: DROPBOX_APP_KEY }),
  });
  if (r.status === 400 || r.status === 401) {
    await lagreTokens(null);
    throw new DropboxFeil('Dropbox-innloggingen er utløpt. Koble til på nytt i innstillinger.', 'ikke_tilkoblet');
  }
  if (!r.ok) throw new DropboxFeil(`Dropbox svarte ${r.status}`, 'annet');
  const d = await r.json();
  const ny = { ...t, access_token: d.access_token, utloper: Date.now() + d.expires_in * 1000 };
  await lagreTokens(ny);
  return ny.access_token;
}

// ---------- Filer ----------

export class DropboxFeil extends Error {
  constructor(melding: string, public type: 'ikke_tilkoblet' | 'nett' | 'annet') {
    super(melding);
  }
}

/** Dropbox-API-Arg må være ren ASCII: æøå o.l. skrives som \uXXXX. */
export function apiArg(o: unknown): string {
  return JSON.stringify(o).replace(/[\u007f-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}

async function kall(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new DropboxFeil('Ingen kontakt med Dropbox (uten nett?)', 'nett');
  }
}

export async function lastOpp(sti: string, innhold: Blob | string): Promise<void> {
  const token = await accessToken();
  const r = await kall(`${CONTENT}/files/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': apiArg({ path: sti, mode: 'overwrite', autorename: false, mute: true }),
    },
    body: typeof innhold === 'string' ? new Blob([innhold], { type: 'text/plain;charset=utf-8' }) : innhold,
  });
  if (!r.ok) throw new DropboxFeil(`Opplasting av ${sti.split('/').pop()} feilet (${r.status}): ${await r.text()}`, 'annet');
}

/** Sletter en mappe (havner i Dropbox «Slettede filer»). Ignorerer at den ikke finnes. */
export async function slettMappe(sti: string): Promise<void> {
  const token = await accessToken();
  const r = await kall(`${API}/files/delete_v2`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: sti }),
  });
  if (r.ok) return;
  const t = await r.text();
  if (r.status === 409 && t.includes('not_found')) return;
  throw new DropboxFeil(`Kunne ikke rydde gamle bilder (${r.status}): ${t}`, 'annet');
}
