'use client';

export const ENTRY_OWNER_READY_TIMEOUT_MS = 1200;

function isElementOnScreen(el: HTMLElement, visibleThreshold = 0.4): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  if (visibleHeight <= 0) return false;

  return visibleHeight >= rect.height * visibleThreshold;
}

export async function scrollEntrySectionIntoView(entryIndex: number): Promise<void> {
  if (typeof window === 'undefined') return;

  const section = document.querySelector<HTMLElement>(
    `[data-rmg-entry-owner="${entryIndex}"]`
  );

  if (!section) return;
  if (isElementOnScreen(section, 0.5)) return;

  const rect = section.getBoundingClientRect();
  const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight || rect.height;
  const targetTop = rect.top + currentScroll - (viewportHeight - rect.height) / 2;

  window.scrollTo({
    top: targetTop,
    behavior: 'instant',
  });
}

export function isEntryOwnerReady(entryIndex: number): boolean {
  const section = document.querySelector<HTMLElement>(
    `[data-rmg-entry-owner="${entryIndex}"]`
  );
  if (!section) return false;

  return (
    section.getAttribute('data-rmg-entry-mounted') === '1' &&
    section.getAttribute('data-rmg-entry-ready') === '1'
  );
}

export async function waitForEntryOwnerReady(
  entryIndex: number,
  timeoutMs = ENTRY_OWNER_READY_TIMEOUT_MS
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isEntryOwnerReady(entryIndex)) return true;

  return new Promise((resolve) => {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const tick = () => {
      if (isEntryOwnerReady(entryIndex)) {
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
