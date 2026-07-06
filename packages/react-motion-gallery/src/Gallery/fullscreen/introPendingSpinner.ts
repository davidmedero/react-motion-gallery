import type {
  FullscreenIntroPendingSpinner,
  FullscreenOptions,
} from "./types";
import { FULLSCREEN_TOP_CHROME_Z_INDEX } from "./layering";

export const NO_FULLSCREEN_INTRO_PENDING_SPINNER: FullscreenIntroPendingSpinner = {
  hide: () => {},
};

function isVideoItem(item: any) {
  return (
    item?.type === "video" ||
    item?.kind === "video" ||
    item?.mediaType === "video" ||
    !!item?.videoSrc ||
    !!item?.sources?.video ||
    !!item?.plyrSource
  );
}

export function shouldRenderIntroPendingSpinner(args: {
  fs: FullscreenOptions;
  item?: any;
  isVideoSlide?: boolean;
}) {
  const isVideoSlide = args.isVideoSlide ?? isVideoItem(args.item);
  const lazyConfig = isVideoSlide
    ? args.fs.lazyLoad?.videos
    : args.fs.lazyLoad?.images;

  if (!lazyConfig?.enabled) return false;
  return lazyConfig.spinner == null || lazyConfig.spinner === true;
}

export function mountIntroPendingSpinner(args: {
  styles: Record<string, string>;
  contentRect: DOMRect;
  enabled: boolean;
  zIndex?: number;
}): FullscreenIntroPendingSpinner {
  if (!args.enabled || !args.styles.spinner) {
    return NO_FULLSCREEN_INTRO_PENDING_SPINNER;
  }

  document
    .querySelectorAll<HTMLElement>(
      '[data-rmg-fs-intro-spinner-layer="true"], [data-rmg-fs-intro-spinner="true"]'
    )
    .forEach((node) => node.remove());

  const layer = document.createElement("div");
  layer.setAttribute("data-rmg-fs-intro-spinner-layer", "true");
  layer.setAttribute("aria-hidden", "true");

  const spinner = document.createElement("div");
  spinner.className = args.styles.spinner;
  spinner.setAttribute("data-rmg-fs-intro-spinner", "true");
  spinner.setAttribute("aria-hidden", "true");

  const left = args.contentRect.left + args.contentRect.width / 2;
  const top = args.contentRect.top + args.contentRect.height / 2;

  Object.assign(layer.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    opacity: "1",
    visibility: "visible",
    transition: "opacity 280ms cubic-bezier(.4,0,.22,1)",
    willChange: "opacity",
    isolation: "isolate",
    contain: "layout paint style",
  } as CSSStyleDeclaration);
  layer.style.setProperty(
    "z-index",
    String(args.zIndex ?? FULLSCREEN_TOP_CHROME_Z_INDEX),
    "important"
  );

  Object.assign(spinner.style, {
    position: "absolute",
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    right: "auto",
    bottom: "auto",
    pointerEvents: "none",
    willChange: "opacity",
    zIndex: "1",
  } as CSSStyleDeclaration);
  spinner.style.setProperty("opacity", "1", "important");
  spinner.style.setProperty("visibility", "visible", "important");
  spinner.style.setProperty("pointer-events", "none", "important");

  layer.appendChild(spinner);
  document.body.appendChild(layer);
  void layer.offsetWidth;

  let hidden = false;
  return {
    hide: () => {
      if (hidden) return;
      hidden = true;

      void layer.offsetWidth;

      layer.style.setProperty("opacity", "0", "important");
      layer.style.setProperty("visibility", "visible", "important");
      spinner.style.setProperty("pointer-events", "none", "important");

      window.setTimeout(() => {
        try {
          layer.remove();
          if (spinner.isConnected) spinner.remove();
        } catch {}
      }, 360);
    },
  };
}
