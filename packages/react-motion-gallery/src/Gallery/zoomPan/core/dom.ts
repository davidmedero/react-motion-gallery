export function getPrimaryImgEl(container: HTMLElement | null): HTMLImageElement | null {
  if (!container) return null;

  const child0 = container.children[0] as any;
  if (child0 && child0.tagName && String(child0.tagName).toLowerCase() === "img") {
    return child0 as HTMLImageElement;
  }

  return container.querySelector("img");
}

export function getFsMediaContainer(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  return el.closest?.('[data-rmg-fs-media="true"]') as HTMLElement | null;
}

export function getClientXY(evt: any): { clientX: number; clientY: number } {
  const clientX =
    evt?.touches?.[0]?.clientX ??
    evt?.changedTouches?.[0]?.clientX ??
    evt?.clientX ??
    0;

  const clientY =
    evt?.touches?.[0]?.clientY ??
    evt?.changedTouches?.[0]?.clientY ??
    evt?.clientY ??
    0;

  return { clientX, clientY };
}

export function findImgAtPoint(
  doc: Document,
  x: number,
  y: number
): HTMLImageElement | null {
  const el = doc.elementFromPoint(x, y) as HTMLElement | null;
  if (!el) return null;

  if (el.tagName?.toLowerCase() === "img") {
    const mediaContainer = getFsMediaContainer(el);
    return mediaContainer ? getPrimaryImgEl(mediaContainer) : (el as any);
  }

  const mediaContainer = getFsMediaContainer(el);
  if (mediaContainer) {
    return getPrimaryImgEl(mediaContainer);
  }

  const img = el.querySelector?.("img");
  return (img as HTMLImageElement) || null;
}

export function readDataIndex(el: HTMLElement | null): number | null {
  if (!el) return null;

  const v =
    el.dataset.index ??
    el.closest?.('[data-rmg-fs-slide="true"]')?.getAttribute("data-index") ??
    null;
  if (v == null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function gapAllEdges(
  containerRect: { width: number; height: number },
  imgEl: HTMLImageElement
): boolean {
  const cw = containerRect.width;
  const ch = containerRect.height;
  const iw = imgEl.offsetWidth;
  const ih = imgEl.offsetHeight;

  return cw > 0 && ch > 0 && iw > 0 && ih > 0 && iw < cw && ih < ch;
}
