// Komprimerer bilder til ca. 1600 px lengste side før de lagres.
export const MAKS_SIDE = 1600;

export async function komprimer(fil: Blob): Promise<{ blob: Blob; bredde: number; hoyde: number }> {
  const bilde = await lastBilde(fil);
  const skala = Math.min(1, MAKS_SIDE / Math.max(bilde.width, bilde.height));
  const b = Math.round(bilde.width * skala);
  const h = Math.round(bilde.height * skala);
  const canvas = document.createElement('canvas');
  canvas.width = b;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bilde.kilde, 0, 0, b, h);
  if ('close' in bilde.kilde) (bilde.kilde as ImageBitmap).close();
  const blob = await new Promise<Blob>((ok, feil) =>
    canvas.toBlob((x) => (x ? ok(x) : feil(new Error('Kunne ikke lage JPEG'))), 'image/jpeg', 0.82),
  );
  return { blob, bredde: b, hoyde: h };
}

async function lastBilde(fil: Blob): Promise<{ kilde: CanvasImageSource; width: number; height: number }> {
  if ('createImageBitmap' in window) {
    try {
      const bm = await createImageBitmap(fil, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      return { kilde: bm, width: bm.width, height: bm.height };
    } catch {
      /* faller tilbake til <img> */
    }
  }
  const url = URL.createObjectURL(fil);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { kilde: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}
