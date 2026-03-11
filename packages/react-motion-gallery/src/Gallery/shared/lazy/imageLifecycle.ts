export function isTrackableImage(img: HTMLImageElement) {
  return !img.closest('[data-rmg-plyr="true"], .plyr, video, iframe');
}

export function findTrackableImages(host: ParentNode | null): HTMLImageElement[] {
  if (!host) return [];
  return Array.from(host.querySelectorAll("img")).filter(isTrackableImage);
}

export function findPrimaryTrackableImage(host: ParentNode | null): HTMLImageElement | null {
  return findTrackableImages(host)[0] ?? null;
}

export function applyImageHints(
  img: HTMLImageElement,
  opts?: { eager?: boolean }
) {
  if (!img.hasAttribute("loading")) {
    img.setAttribute("loading", opts?.eager ? "eager" : "lazy");
  }
  if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
  if (!img.hasAttribute("fetchpriority")) {
    img.setAttribute("fetchpriority", opts?.eager ? "high" : "low");
  }
}

export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function waitForImageDecode(img: HTMLImageElement): Promise<void> {
  if (img.complete) {
    if (img.naturalWidth <= 0) return;

    const decode = (img as HTMLImageElement & { decode?: () => Promise<void> }).decode;
    if (typeof decode === "function") {
      await decode.call(img).catch(() => {});
    }
    return;
  }

  await new Promise<void>((resolve) => {
    const done = () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);

      if (img.naturalWidth <= 0) {
        resolve();
        return;
      }

      const decode = (img as HTMLImageElement & { decode?: () => Promise<void> }).decode;
      if (typeof decode === "function") {
        decode.call(img).catch(() => {}).finally(resolve);
        return;
      }

      resolve();
    };

    img.addEventListener("load", done);
    img.addEventListener("error", done);
  });
}

export type PreparedImage = {
  img: HTMLImageElement;
  prevOpacity: string;
  prevTransition: string;
  hadOpacity: boolean;
  hadTransition: boolean;
};

function clearPreparedOpacityTransition(prepared: PreparedImage) {
  if (prepared.hadTransition) return;

  let cleared = false;
  const clear = () => {
    if (cleared) return;
    cleared = true;
    prepared.img.style.removeProperty("transition");
    prepared.img.removeEventListener("transitionend", onEnd as EventListener);
  };

  const onEnd = (event: TransitionEvent) => {
    if (event.propertyName && event.propertyName !== "opacity") return;
    clear();
  };

  prepared.img.addEventListener("transitionend", onEnd as EventListener);
  window.setTimeout(clear, 360);
}

export function prepareImage(img: HTMLImageElement): PreparedImage {
  const prepared: PreparedImage = {
    img,
    prevOpacity: img.style.opacity,
    prevTransition: img.style.transition,
    hadOpacity: img.style.opacity !== "",
    hadTransition: img.style.transition !== "",
  };

  img.style.opacity = "0";
  if (!prepared.hadTransition) {
    img.style.transition = "opacity 300ms ease";
  }

  return prepared;
}

export function revealPreparedImage(prepared: PreparedImage) {
  if (prepared.hadOpacity) prepared.img.style.opacity = prepared.prevOpacity;
  else prepared.img.style.removeProperty("opacity");

  clearPreparedOpacityTransition(prepared);
}

export function restorePreparedImage(prepared: PreparedImage) {
  if (prepared.hadOpacity) prepared.img.style.opacity = prepared.prevOpacity;
  else prepared.img.style.removeProperty("opacity");

  if (prepared.hadTransition) prepared.img.style.transition = prepared.prevTransition;
  else prepared.img.style.removeProperty("transition");
}

export function readResolvedImageSrc(img: HTMLImageElement | null): string {
  if (!img) return "";
  return img.currentSrc || img.src || "";
}