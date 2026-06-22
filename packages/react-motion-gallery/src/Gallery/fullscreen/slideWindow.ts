export const DEFAULT_FULLSCREEN_SLIDE_WINDOW_RADIUS = 1;
export const DEFAULT_FULLSCREEN_SLIDE_WINDOW_MIN_ITEMS = 4;

export type FullscreenCellRecord = {
  element: HTMLElement;
  index: number;
};

export type FullscreenCellStore = {
  current: FullscreenCellRecord[];
};

function isWrappedItems(itemsLength: number, canonicalLength: number) {
  return canonicalLength > 1 && itemsLength === canonicalLength + 2;
}

function normalizeIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((Math.trunc(index) % length) + length) % length;
}

function circularDistance(a: number, b: number, length: number) {
  const direct = Math.abs(a - b);
  return Math.min(direct, Math.max(0, length - direct));
}

function toCanonicalIndex(
  renderedIndex: number,
  itemsLength: number,
  canonicalLength: number
) {
  if (!isWrappedItems(itemsLength, canonicalLength)) {
    return normalizeIndex(renderedIndex, canonicalLength || itemsLength || 1);
  }

  if (renderedIndex === 0) return canonicalLength - 1;
  if (renderedIndex === itemsLength - 1) return 0;
  return renderedIndex - 1;
}

export function shouldHydrateFullscreenSlide(args: {
  renderedIndex: number;
  itemsLength: number;
  canonicalLength: number;
  activeCanonicalIndex?: number | null;
  renderMode?: "track" | "crossfade";
  radius?: number;
  minItems?: number;
}) {
  const {
    renderedIndex,
    itemsLength,
    canonicalLength,
    activeCanonicalIndex,
    renderMode = "track",
    radius = DEFAULT_FULLSCREEN_SLIDE_WINDOW_RADIUS,
    minItems = DEFAULT_FULLSCREEN_SLIDE_WINDOW_MIN_ITEMS,
  } = args;

  if (renderMode === "crossfade") return true;
  if (itemsLength <= 0 || canonicalLength <= 0) return true;
  if (Math.min(itemsLength, canonicalLength) < minItems) return true;
  if (activeCanonicalIndex == null || !Number.isFinite(activeCanonicalIndex)) {
    return true;
  }

  const resolvedRadius = Math.max(0, Math.trunc(radius));
  const activeCanonical = normalizeIndex(activeCanonicalIndex, canonicalLength);

  if (isWrappedItems(itemsLength, canonicalLength)) {
    const renderedCanonical = toCanonicalIndex(
      renderedIndex,
      itemsLength,
      canonicalLength
    );

    return (
      circularDistance(renderedCanonical, activeCanonical, canonicalLength) <=
      resolvedRadius
    );
  }

  const activeRenderedIndex = normalizeIndex(activeCanonical, itemsLength);
  const normalizedRenderedIndex = normalizeIndex(renderedIndex, itemsLength);

  return Math.abs(normalizedRenderedIndex - activeRenderedIndex) <= resolvedRadius;
}

export function updateFullscreenCellRef(
  cells: FullscreenCellStore,
  renderedIndex: number,
  element: HTMLElement | null
) {
  const next = cells.current.filter(
    (cell) => cell.index !== renderedIndex && cell.element !== element
  );

  if (element) {
    next.push({
      element,
      index: renderedIndex,
    });
  }

  cells.current = next.sort((a, b) => a.index - b.index);
}
