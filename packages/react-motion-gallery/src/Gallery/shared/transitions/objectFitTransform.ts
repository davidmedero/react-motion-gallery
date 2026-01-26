export function coverTransformForRect(
    natW: number,
    natH: number,
    cropRect: DOMRect,
    objPos: { x: number; y: number } | null
  ) {
    const cropW = Math.max(1, cropRect.width);
    const cropH = Math.max(1, cropRect.height);

    const s = Math.max(cropW / Math.max(1, natW), cropH / Math.max(1, natH));

    const scaledW = natW * s;
    const scaledH = natH * s;

    const ox = objPos?.x ?? 0.5;
    const oy = objPos?.y ?? 0.5;

    const overflowX = Math.max(0, scaledW - cropW);
    const overflowY = Math.max(0, scaledH - cropH);

    const dx = (0.5 - ox) * overflowX;
    const dy = (0.5 - oy) * overflowY;

    const cx = cropRect.left + cropW / 2 + dx;
    const cy = cropRect.top + cropH / 2 + dy;

    return { cx, cy, scale: s };
  }

  export function containTransformForRect(
    natW: number,
    natH: number,
    cropRect: DOMRect,
    objPos: { x: number; y: number } | null
  ) {
    const cropW = Math.max(1, cropRect.width);
    const cropH = Math.max(1, cropRect.height);

    const s = Math.min(cropW / Math.max(1, natW), cropH / Math.max(1, natH));

    const scaledW = natW * s;
    const scaledH = natH * s;

    const ox = objPos?.x ?? 0.5;
    const oy = objPos?.y ?? 0.5;

    const extraX = Math.max(0, cropW - scaledW);
    const extraY = Math.max(0, cropH - scaledH);

    const left = cropRect.left + extraX * ox;
    const top  = cropRect.top  + extraY * oy;

    const cx = left + scaledW / 2;
    const cy = top  + scaledH / 2;

    return { cx, cy, scale: s };
  }

  export function objectFitContentRect(
    natW: number,
    natH: number,
    box: DOMRect,
    fit: 'contain' | 'cover',
    objPos: { x: number; y: number }
  ) {
    const scale =
      fit === 'contain'
        ? Math.min(box.width / natW, box.height / natH)
        : Math.max(box.width / natW, box.height / natH);

    const w = natW * scale;
    const h = natH * scale;

    const left = box.left + (box.width - w) * objPos.x;
    const top  = box.top  + (box.height - h) * objPos.y;

    return new DOMRect(left, top, w, h);
  }