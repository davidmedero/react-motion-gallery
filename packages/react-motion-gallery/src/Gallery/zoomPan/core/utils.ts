export function getCurrentTransform(slide: HTMLElement | null) {
  if (!slide) return { x: 0, y: 0 };
  const computedStyle = window.getComputedStyle(slide);
  const transform =
    computedStyle.transform && computedStyle.transform !== "none"
      ? computedStyle.transform
      : slide.style.transform;
  if (!transform || transform === "none") return { x: 0, y: 0 };

  const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/);
  if (matrix3dMatch) {
    const matrixValues = matrix3dMatch[1].split(",").map(parseFloat);
    return {
      x: matrixValues[12] || 0,
      y: matrixValues[13] || 0,
    };
  }

  const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
  if (matrixMatch) {
    const matrixValues = matrixMatch[1].split(",").map(parseFloat);
    return {
      x: matrixValues[4] || 0,
      y: matrixValues[5] || 0,
    };
  }

  const translateMatch = transform.match(
    /translate(?:3d)?\(\s*([-\d.]+)px(?:,\s*([-\d.]+)px)?/
  );
  if (translateMatch) {
    return {
      x: Number.parseFloat(translateMatch[1]) || 0,
      y: Number.parseFloat(translateMatch[2] ?? "0") || 0,
    };
  }

  return { x: 0, y: 0 };
}

export function baseFitSize(
  imgEl: HTMLImageElement,
  containerW: number,
  containerH: number
) {
  const natW = imgEl.naturalWidth || imgEl.width || containerW;
  const natH = imgEl.naturalHeight || imgEl.height || containerH;
  const fit = Math.min(containerW / natW, containerH / natH);
  return { baseW: natW * fit, baseH: natH * fit };
}

export function clampNum(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export type Point = { x: number; y: number };

export function midpoint(a: Touch, b: Touch): Point {
  if (!b) return { x: a.clientX, y: a.clientY };
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

export function distance(a: Touch, b: Touch): number {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}
