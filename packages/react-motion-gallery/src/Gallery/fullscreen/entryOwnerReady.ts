'use client';

export const ENTRY_OWNER_READY_TIMEOUT_MS = 1200;

function entryOwnerSelector(entryIndex: number) {
  return `[data-rmg-entry-owner="${entryIndex}"]`;
}

function findEntryOwner(
  entryIndex: number,
  root?: HTMLElement | null
): HTMLElement | null {
  const selector = entryOwnerSelector(entryIndex);

  if (root) {
    return root.querySelector<HTMLElement>(selector);
  }

  return document.querySelector<HTMLElement>(selector);
}

function isElementOnScreen(el: HTMLElement, visibleThreshold = 0.4): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  if (visibleHeight <= 0) return false;

  return visibleHeight >= rect.height * visibleThreshold;
}

function readScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function parsePx(value: string | null | undefined) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function virtualRowMeta(node: HTMLElement) {
  const index = Number.parseInt(
    node.getAttribute("data-rmg-entry-virtual-index") ?? "",
    10
  );
  const row = Number.parseInt(
    node.getAttribute("data-rmg-entry-virtual-row") ?? "",
    10
  );

  if (!Number.isFinite(index)) return null;

  return {
    node,
    index,
    row: Number.isFinite(row) ? row : index,
  };
}

function resolveVirtualStride(
  metas: Array<NonNullable<ReturnType<typeof virtualRowMeta>>>,
  fallbackNode: HTMLElement
) {
  const byRow = new Map<number, HTMLElement>();

  metas.forEach((meta) => {
    if (!byRow.has(meta.row)) byRow.set(meta.row, meta.node);
  });

  const rows = Array.from(byRow.entries())
    .map(([row, node]) => ({
      row,
      top: node.getBoundingClientRect().top,
      height: node.getBoundingClientRect().height,
    }))
    .sort((a, b) => a.row - b.row);

  for (let index = 1; index < rows.length; index += 1) {
    const prev = rows[index - 1];
    const next = rows[index];
    if (!prev || !next) continue;

    const rowDelta = next.row - prev.row;
    const topDelta = next.top - prev.top;
    if (rowDelta > 0 && topDelta > 0) return topDelta / rowDelta;
  }

  const rect = fallbackNode.getBoundingClientRect();
  const style = window.getComputedStyle(fallbackNode.parentElement ?? fallbackNode);
  const gap = parsePx(style.rowGap) || parsePx(style.gap);

  return Math.max(1, rect.height + gap);
}

function inferVirtualColumnCount(
  metas: Array<NonNullable<ReturnType<typeof virtualRowMeta>>>
) {
  const counts = new Map<number, number>();

  metas.forEach((meta) => {
    counts.set(meta.row, (counts.get(meta.row) ?? 0) + 1);
  });

  return Math.max(1, ...Array.from(counts.values()));
}

function scrollVirtualEntrySectionIntoView(
  entryIndex: number,
  root: HTMLElement
) {
  const metas = Array.from(
    root.querySelectorAll<HTMLElement>("[data-rmg-entry-virtual-index]")
  )
    .map(virtualRowMeta)
    .filter((meta): meta is NonNullable<ReturnType<typeof virtualRowMeta>> =>
      !!meta
    );

  if (!metas.length) return false;

  const layout = root.getAttribute("data-rmg-entries-layout");
  const columnCount = layout === "grid" ? inferVirtualColumnCount(metas) : 1;
  const targetRow =
    layout === "grid" ? Math.floor(entryIndex / columnCount) : entryIndex;
  const first = metas[0];
  if (!first) return false;

  const nearest = metas.reduce((best, meta) => {
    return Math.abs(meta.row - targetRow) < Math.abs(best.row - targetRow)
      ? meta
      : best;
  }, first);

  const nearestRect = nearest.node.getBoundingClientRect();
  const stride = resolveVirtualStride(metas, nearest.node);
  const scrollY = readScrollY();
  const viewportHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    nearestRect.height;
  const targetTop =
    nearestRect.top + scrollY + (targetRow - nearest.row) * stride;
  const targetScrollTop =
    targetTop - (viewportHeight - nearestRect.height) / 2;

  window.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: "instant",
  });

  return true;
}

export async function scrollEntrySectionIntoView(
  entryIndex: number,
  root?: HTMLElement | null
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const section = findEntryOwner(entryIndex, root);

  if (!section) {
    return root ? scrollVirtualEntrySectionIntoView(entryIndex, root) : false;
  }

  if (isElementOnScreen(section, 0.5)) return true;

  const rect = section.getBoundingClientRect();
  const currentScroll = readScrollY();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight || rect.height;
  const targetTop = rect.top + currentScroll - (viewportHeight - rect.height) / 2;

  window.scrollTo({
    top: targetTop,
    behavior: 'instant',
  });

  return true;
}

export function isEntryOwnerReady(
  entryIndex: number,
  root?: HTMLElement | null
): boolean {
  const section = findEntryOwner(entryIndex, root);
  if (!section) return false;

  return (
    section.getAttribute('data-rmg-entry-mounted') === '1' &&
    section.getAttribute('data-rmg-entry-ready') === '1'
  );
}

export async function waitForEntryOwnerReady(
  entryIndex: number,
  timeoutMs = ENTRY_OWNER_READY_TIMEOUT_MS,
  root?: HTMLElement | null
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isEntryOwnerReady(entryIndex, root)) return true;

  return new Promise((resolve) => {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const tick = () => {
      if (isEntryOwnerReady(entryIndex, root)) {
        resolve(true);
        return;
      }

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - start >= timeoutMs) {
        resolve(false);
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}
