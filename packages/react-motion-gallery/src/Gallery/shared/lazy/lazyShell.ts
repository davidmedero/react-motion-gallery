import {
  waitForImageDecode,
  isTrackableImage,
  nextFrame,
  findPrimaryTrackableImage,
} from "./imageLifecycle";

export const RMG_BLANK =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
export const LAZY_ATTR = "data-rmg-lazy-src";
export const LAZY_HOST_ATTR = "data-rmg-lazyload";
export const LAZY_LOADING_ATTR = "data-rmg-lazyloading";
export const LAZY_LOADED_ATTR = "data-rmg-lazyloaded";
export const LAZY_NESTED_IMAGE_ATTR = "data-rmg-lazy-nested-image";
export const SPINNER_HIDE_TIMER_ATTR = "data-rmg-spinner-hide-timer";
export const LAZY_SPINNER_FADE_MS = 180;

const spinnerHideTimers = new WeakMap<HTMLElement, ReturnType<typeof globalThis.setTimeout>>();
let spinnerHideTokenSeq = 0;

function hideSpinnerImmediately(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;
  clearSpinnerHideTimer(spinnerEl);
  spinnerEl.style.setProperty("opacity", "0", "important");
  spinnerEl.style.setProperty("visibility", "hidden", "important");
  spinnerEl.style.setProperty("pointer-events", "none", "important");
}

export function clearSpinnerHideTimer(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;

  const timer = spinnerHideTimers.get(spinnerEl);
  if (timer != null) {
    globalThis.clearTimeout(timer);
    spinnerHideTimers.delete(spinnerEl);
  }

  spinnerEl.removeAttribute(SPINNER_HIDE_TIMER_ATTR);
}

export function showSpinnerEl(spinnerEl: HTMLElement | null) {
  if (!spinnerEl) return;
  clearSpinnerHideTimer(spinnerEl);
  spinnerEl.style.setProperty("opacity", "1", "important");
  spinnerEl.style.setProperty("visibility", "visible", "important");
  spinnerEl.style.setProperty("pointer-events", "none", "important");
}

export function hideSpinnerEl(spinnerEl: HTMLElement | null, onHidden?: () => void) {
  if (!spinnerEl) {
    onHidden?.();
    return;
  }

  clearSpinnerHideTimer(spinnerEl);
  spinnerEl.style.setProperty("opacity", "0", "important");
  spinnerEl.style.setProperty("pointer-events", "none", "important");

  const token = String(++spinnerHideTokenSeq);
  const timer = globalThis.setTimeout(() => {
    const activeToken = spinnerEl.getAttribute(SPINNER_HIDE_TIMER_ATTR);
    if (activeToken !== token) return;

    spinnerHideTimers.delete(spinnerEl);
    spinnerEl.removeAttribute(SPINNER_HIDE_TIMER_ATTR);
    spinnerEl.style.setProperty("visibility", "hidden", "important");
    onHidden?.();
  }, LAZY_SPINNER_FADE_MS);

  spinnerHideTimers.set(spinnerEl, timer);
  spinnerEl.setAttribute(SPINNER_HIDE_TIMER_ATTR, token);
}

function getLazyTargets(hostEl: HTMLElement) {
  return Array.from(hostEl.querySelectorAll<HTMLElement>(`[${LAZY_ATTR}]`));
}

function ensureLazyTargetHidden(target: HTMLElement) {
  if (target instanceof HTMLImageElement) {
    if (!target.getAttribute("src")) target.src = RMG_BLANK;
    target.style.opacity = "0";
    if (!target.style.transition) target.style.transition = "opacity 280ms ease";
    return;
  }

  if (target.hasAttribute(LAZY_NESTED_IMAGE_ATTR)) {
    const img = findPrimaryTrackableImage(target);
    if (img) {
      if (!img.getAttribute("src")) img.src = RMG_BLANK;
      img.style.opacity = "0";
      if (!img.style.transition) img.style.transition = "opacity 280ms ease";
    }
    return;
  }

  target.style.opacity = "0";
}

export function markLazyImageShell(hostEl: HTMLElement) {
  hostEl.setAttribute(LAZY_HOST_ATTR, "");
  hostEl.removeAttribute(LAZY_LOADED_ATTR);
  hostEl.setAttribute("aria-busy", "true");

  const images = Array.from(hostEl.querySelectorAll<HTMLImageElement>("img[src]")).filter(
    (img) => isTrackableImage(img) && !img.hasAttribute(LAZY_ATTR)
  );

  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (!src || src === RMG_BLANK) return;

    img.setAttribute(LAZY_ATTR, src);
    img.setAttribute("src", RMG_BLANK);

    img.style.opacity = "0";
    if (!img.style.transition) img.style.transition = "opacity 280ms ease";
  });

  getLazyTargets(hostEl).forEach(ensureLazyTargetHidden);
}

export function restoreLazyImageShell(hostEl: HTMLElement) {
  const targets = getLazyTargets(hostEl);
  for (const target of targets) {
    const src = target.getAttribute(LAZY_ATTR);
    if (!src) continue;

    if (target instanceof HTMLImageElement) {
      target.src = src;
      target.style.opacity = "1";
      target.style.transition = target.style.transition || "opacity 280ms ease";
    } else if (target.hasAttribute(LAZY_NESTED_IMAGE_ATTR)) {
      const img = findPrimaryTrackableImage(target);
      if (img) {
        img.src = src;
        img.style.opacity = "1";
        img.style.transition = img.style.transition || "opacity 280ms ease";
      }
    } else {
      (target.style as CSSStyleDeclaration & { backgroundImage: string }).backgroundImage =
        `url("${src}")`;
      target.style.opacity = "1";
    }

    target.removeAttribute(LAZY_ATTR);
    target.removeAttribute(LAZY_NESTED_IMAGE_ATTR);
  }

  hostEl.removeAttribute(LAZY_HOST_ATTR);
  hostEl.removeAttribute(LAZY_LOADING_ATTR);
  hostEl.removeAttribute(LAZY_LOADED_ATTR);
  hostEl.removeAttribute("aria-busy");
  hideSpinnerImmediately(hostEl.querySelector<HTMLElement>("[data-rmg-spinner]"));
}

export function hydrateLazyImageShell(
  hostEl: HTMLElement,
  options?: { onRevealed?: () => void }
) {
  hostEl.setAttribute(LAZY_HOST_ATTR, "");
  hostEl.setAttribute(LAZY_LOADED_ATTR, "true");
  hostEl.removeAttribute(LAZY_LOADING_ATTR);
  hostEl.removeAttribute("aria-busy");

  const targets = getLazyTargets(hostEl);
  for (const target of targets) {
    const src = target.getAttribute(LAZY_ATTR);
    if (!src) continue;

    if (target instanceof HTMLImageElement) {
      target.src = src;
      target.style.opacity = "1";
      target.style.transition = target.style.transition || "opacity 280ms ease";
    } else if (target.hasAttribute(LAZY_NESTED_IMAGE_ATTR)) {
      const img = findPrimaryTrackableImage(target);
      if (img) {
        img.src = src;
        img.style.opacity = "1";
        img.style.transition = img.style.transition || "opacity 280ms ease";
      }
    } else {
      (target.style as CSSStyleDeclaration & { backgroundImage: string }).backgroundImage =
        `url("${src}")`;
      target.style.opacity = "1";
    }

    target.removeAttribute(LAZY_ATTR);
    target.removeAttribute(LAZY_NESTED_IMAGE_ATTR);
  }

  hostEl.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    if (img.getAttribute("src") && img.getAttribute("src") !== RMG_BLANK) {
      img.style.opacity = "1";
      img.style.transition = img.style.transition || "opacity 280ms ease";
    }
  });

  hideSpinnerEl(hostEl.querySelector<HTMLElement>("[data-rmg-spinner]"));
  options?.onRevealed?.();
}

export async function revealLazyImageShell(
  hostEl: HTMLElement,
  options?: { onRevealed?: () => void; shouldAbort?: () => boolean }
) {
  if (hostEl.getAttribute(LAZY_LOADED_ATTR) === "true") {
    if (getLazyTargets(hostEl).length && !options?.shouldAbort?.()) {
      hydrateLazyImageShell(hostEl, { onRevealed: options?.onRevealed });
    }
    return;
  }
  if (options?.shouldAbort?.()) return;

  const spinnerEl = hostEl.querySelector<HTMLElement>("[data-rmg-spinner]");
  showSpinnerEl(spinnerEl);
  hostEl.setAttribute("aria-busy", "true");

  const targets = getLazyTargets(hostEl);
  const decodePromises: Promise<void>[] = [];

  for (const target of targets) {
    const src = target.getAttribute(LAZY_ATTR);
    if (!src) continue;

    if (target instanceof HTMLImageElement) {
      target.style.opacity = "0";
      target.style.transition = target.style.transition || "opacity 280ms ease";
      target.src = src;
      decodePromises.push(waitForImageDecode(target));
    } else if (target.hasAttribute(LAZY_NESTED_IMAGE_ATTR)) {
      const img = findPrimaryTrackableImage(target);
      if (img) {
        img.style.opacity = "0";
        img.style.transition = img.style.transition || "opacity 280ms ease";
        img.src = src;
        decodePromises.push(waitForImageDecode(img));
      }
    } else {
      (target.style as CSSStyleDeclaration & { backgroundImage: string }).backgroundImage =
        `url("${src}")`;
    }
  }

  if (decodePromises.length) {
    await Promise.all(decodePromises);
  }

  if (options?.shouldAbort?.()) return;
  await nextFrame();
  if (options?.shouldAbort?.()) return;

  for (const target of targets) {
    const src = target.getAttribute(LAZY_ATTR);
    if (!src) continue;

    target.removeAttribute(LAZY_ATTR);
    target.removeAttribute(LAZY_NESTED_IMAGE_ATTR);
    if (target instanceof HTMLImageElement) {
      target.style.opacity = "1";
    } else {
      const img = findPrimaryTrackableImage(target);
      if (img) img.style.opacity = "1";
      else target.style.opacity = "1";
    }
  }

  hostEl.setAttribute(LAZY_LOADED_ATTR, "true");
  hostEl.removeAttribute("aria-busy");
  hideSpinnerEl(spinnerEl);
  options?.onRevealed?.();
}
