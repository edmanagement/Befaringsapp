import { useCallback, useEffect, useState } from 'react';
import { hentSisteRute, settSisteRute } from './db/db';
import { Liste } from './sider/Liste';
import { BefaringSkjema } from './sider/BefaringSkjema';
import { BefaringSide } from './sider/BefaringSide';
import { PostVeiviser } from './sider/PostVeiviser';
import { Innstillinger } from './sider/Innstillinger';

export type Rute =
  | { side: 'liste' }
  | { side: 'ny' }
  | { side: 'innstillinger' }
  | { side: 'befaring'; id: string }
  | { side: 'rediger'; id: string }
  | { side: 'post'; id: string; postId: string };

export type Gaa = (r: Rute) => void;

export function ruteTilHash(r: Rute): string {
  switch (r.side) {
    case 'liste': return '#/';
    case 'ny': return '#/ny';
    case 'innstillinger': return '#/innstillinger';
    case 'befaring': return `#/befaring/${r.id}`;
    case 'rediger': return `#/befaring/${r.id}/rediger`;
    case 'post': return `#/befaring/${r.id}/post/${r.postId}`;
  }
}

export function hashTilRute(h: string): Rute {
  const d = h.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (d[0] === 'ny') return { side: 'ny' };
  if (d[0] === 'innstillinger') return { side: 'innstillinger' };
  if (d[0] === 'befaring' && d[1]) {
    if (d[2] === 'rediger') return { side: 'rediger', id: d[1] };
    if (d[2] === 'post' && d[3]) return { side: 'post', id: d[1], postId: d[3] };
    return { side: 'befaring', id: d[1] };
  }
  return { side: 'liste' };
}

export function App() {
  const [rute, setRute] = useState<Rute | null>(null);

  useEffect(() => {
    (async () => {
      if (location.hash && location.hash !== '#/') return setRute(hashTilRute(location.hash));
      const siste = await hentSisteRute();
      setRute(siste ? hashTilRute(siste) : { side: 'liste' });
    })();
    const vedEndring = () => setRute(hashTilRute(location.hash));
    window.addEventListener('hashchange', vedEndring);
    return () => window.removeEventListener('hashchange', vedEndring);
  }, []);

  useEffect(() => {
    if (!rute) return;
    const h = ruteTilHash(rute);
    if (location.hash !== h) history.replaceState(null, '', h);
    settSisteRute(h);
    window.scrollTo(0, 0);
  }, [rute]);

  const gaa = useCallback<Gaa>((r) => setRute(r), []);

  if (!rute) return null;
  switch (rute.side) {
    case 'liste': return <Liste gaa={gaa} />;
    case 'ny': return <BefaringSkjema gaa={gaa} />;
    case 'rediger': return <BefaringSkjema gaa={gaa} id={rute.id} />;
    case 'innstillinger': return <Innstillinger gaa={gaa} />;
    case 'befaring': return <BefaringSide gaa={gaa} id={rute.id} />;
    case 'post': return <PostVeiviser key={rute.postId} gaa={gaa} befaringId={rute.id} postId={rute.postId} />;
  }
}
