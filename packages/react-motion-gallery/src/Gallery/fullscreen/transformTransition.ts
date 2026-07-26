type ViewportCropRectLike = Pick<
  DOMRect,
  "left" | "top" | "right" | "bottom"
>;

export const TRANSITION_PROXY_MAX_CSS_LONG_EDGE = 1024;
export const TRANSITION_PROXY_MAX_DEVICE_LONG_EDGE = 2048;
export const TRANSITION_PROXY_INNER_BASE_WIDTH = 250;
export const TRANSITION_PROXY_MIN_PAINT_MS = 50;
export const TRANSITION_PROXY_MAX_DECODE_MS = 250;
export const TRANSITION_PREPAINT_OPACITY = 0.003;

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function positiveOr(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function transformPx(value: number) {
  const normalized = Math.abs(value) < 0.0001 ? 0 : value;
  return `${normalized}px`;
}

export function clampViewportCropRect(
  rect: ViewportCropRectLike,
  viewportWidth: number,
  viewportHeight: number
) {
  const width = Math.max(1, finiteOr(viewportWidth, 1));
  const height = Math.max(1, finiteOr(viewportHeight, 1));
  const left = Math.min(width, Math.max(0, finiteOr(rect.left, 0)));
  const top = Math.min(height, Math.max(0, finiteOr(rect.top, 0)));
  const right = Math.max(
    left,
    Math.min(width, finiteOr(rect.right, width))
  );
  const bottom = Math.max(
    top,
    Math.min(height, finiteOr(rect.bottom, height))
  );

  return new DOMRect(left, top, right - left, bottom - top);
}

export function intersectViewportCropRects(
  rects: Array<ViewportCropRectLike | null | undefined>,
  viewportWidth: number,
  viewportHeight: number
) {
  const width = Math.max(1, finiteOr(viewportWidth, 1));
  const height = Math.max(1, finiteOr(viewportHeight, 1));
  const available = rects.filter(
    (rect): rect is ViewportCropRectLike => rect != null
  );

  if (!available.length) {
    return new DOMRect(0, 0, width, height);
  }

  const intersection = {
    left: Math.max(...available.map((rect) => finiteOr(rect.left, 0))),
    top: Math.max(...available.map((rect) => finiteOr(rect.top, 0))),
    right: Math.min(
      ...available.map((rect) => finiteOr(rect.right, width))
    ),
    bottom: Math.min(
      ...available.map((rect) => finiteOr(rect.bottom, height))
    ),
  };

  return clampViewportCropRect(intersection, width, height);
}

export function resolveViewportCropTransforms(
  rect: ViewportCropRectLike,
  viewportWidth: number,
  viewportHeight: number
) {
  const width = Math.max(1, finiteOr(viewportWidth, 1));
  const height = Math.max(1, finiteOr(viewportHeight, 1));
  const crop = clampViewportCropRect(rect, width, height);
  const leadingX = crop.left;
  const leadingY = crop.top;
  const trailingX = crop.right - width - crop.left;
  const trailingY = crop.bottom - height - crop.top;
  const contentX = width - crop.right;
  const contentY = height - crop.bottom;

  return {
    crop,
    leading: `translate3d(${transformPx(leadingX)}, ${transformPx(
      leadingY
    )}, 0)`,
    trailing: `translate3d(${transformPx(trailingX)}, ${transformPx(
      trailingY
    )}, 0)`,
    content: `translate3d(${transformPx(contentX)}, ${transformPx(
      contentY
    )}, 0)`,
    translationSum: {
      x: leadingX + trailingX + contentX,
      y: leadingY + trailingY + contentY,
    },
  };
}

export type ViewportTransformCropper = {
  root: HTMLDivElement;
  content: HTMLDivElement;
  setRect: (rect: ViewportCropRectLike) => void;
  setTransition: (durationMs: number, easing: string) => void;
  clearTransition: () => void;
};

export function createViewportTransformCropper(args: {
  startRect: ViewportCropRectLike;
  viewportWidth: number;
  viewportHeight: number;
  zIndex: number;
  dataAttribute?: string;
}): ViewportTransformCropper {
  const {
    startRect,
    viewportWidth,
    viewportHeight,
    zIndex,
    dataAttribute,
  } = args;
  const root = document.createElement("div");
  const leading = document.createElement("div");
  const trailing = document.createElement("div");
  const content = document.createElement("div");

  root.setAttribute("data-rmg-fs-transform-crop", "true");
  if (dataAttribute) {
    root.setAttribute(dataAttribute, "true");
  }

  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: String(zIndex),
  } as CSSStyleDeclaration);

  for (const layer of [leading, trailing, content]) {
    Object.assign(layer.style, {
      position: "absolute",
      inset: "0",
      transformOrigin: "0 0",
      transition: "none",
      willChange: "transform",
      pointerEvents: "none",
    } as CSSStyleDeclaration);
  }

  leading.style.overflow = "hidden";
  trailing.style.overflow = "hidden";
  content.style.overflow = "visible";
  content.style.zIndex = String(zIndex);

  leading.appendChild(trailing);
  trailing.appendChild(content);
  root.appendChild(leading);

  const setRect = (rect: ViewportCropRectLike) => {
    const transforms = resolveViewportCropTransforms(
      rect,
      viewportWidth,
      viewportHeight
    );
    leading.style.transform = transforms.leading;
    trailing.style.transform = transforms.trailing;
    content.style.transform = transforms.content;
  };

  const setTransition = (durationMs: number, easing: string) => {
    const transition = `transform ${Math.max(
      0,
      finiteOr(durationMs, 0)
    )}ms ${easing}`;
    leading.style.transition = transition;
    trailing.style.transition = transition;
    content.style.transition = transition;
  };

  const clearTransition = () => {
    leading.style.transition = "none";
    trailing.style.transition = "none";
    content.style.transition = "none";
  };

  setRect(startRect);

  return {
    root,
    content,
    setRect,
    setTransition,
    clearTransition,
  };
}

export function resolveTransitionProxyRaster(args: {
  sourceWidth: number;
  sourceHeight: number;
  startRect: Pick<DOMRect, "width" | "height">;
  endRect: Pick<DOMRect, "width" | "height">;
  devicePixelRatio?: number;
  maxCssLongEdge?: number;
  maxDeviceLongEdge?: number;
}) {
  const sourceWidth = positiveOr(args.sourceWidth, 1);
  const sourceHeight = positiveOr(args.sourceHeight, 1);
  const sourceLongEdge = Math.max(sourceWidth, sourceHeight);
  const visualLongEdge = Math.max(
    positiveOr(args.startRect.width, 1),
    positiveOr(args.startRect.height, 1),
    positiveOr(args.endRect.width, 1),
    positiveOr(args.endRect.height, 1)
  );
  const devicePixelRatio = positiveOr(args.devicePixelRatio ?? 1, 1);
  const maxCssLongEdge = positiveOr(
    args.maxCssLongEdge ?? TRANSITION_PROXY_MAX_CSS_LONG_EDGE,
    TRANSITION_PROXY_MAX_CSS_LONG_EDGE
  );
  const maxDeviceLongEdge = positiveOr(
    args.maxDeviceLongEdge ?? TRANSITION_PROXY_MAX_DEVICE_LONG_EDGE,
    TRANSITION_PROXY_MAX_DEVICE_LONG_EDGE
  );
  const cssLongEdge = Math.max(
    1,
    Math.min(
      sourceLongEdge,
      visualLongEdge,
      maxCssLongEdge,
      maxDeviceLongEdge / devicePixelRatio
    )
  );
  const scale = cssLongEdge / sourceLongEdge;

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
    cssLongEdge,
  };
}

export function resolveTransitionProxyInnerLayout(args: {
  proxyWidth: number;
  proxyHeight: number;
  baseWidth?: number;
}) {
  const proxyWidth = positiveOr(args.proxyWidth, 1);
  const proxyHeight = positiveOr(args.proxyHeight, 1);
  const width = positiveOr(
    args.baseWidth ?? TRANSITION_PROXY_INNER_BASE_WIDTH,
    TRANSITION_PROXY_INNER_BASE_WIDTH
  );
  const scale = proxyWidth / width;

  return {
    width,
    height: proxyHeight / scale,
    scale,
  };
}

export async function warmTransitionImage(
  image: HTMLImageElement,
  options: {
    minPaintMs?: number;
    maxDecodeMs?: number;
  } = {}
) {
  const minPaintMs = Math.max(
    0,
    finiteOr(
      options.minPaintMs ?? TRANSITION_PROXY_MIN_PAINT_MS,
      TRANSITION_PROXY_MIN_PAINT_MS
    )
  );
  const maxDecodeMs = Math.max(
    minPaintMs,
    finiteOr(
      options.maxDecodeMs ?? TRANSITION_PROXY_MAX_DECODE_MS,
      TRANSITION_PROXY_MAX_DECODE_MS
    )
  );

  const decode =
    typeof image.decode === "function"
      ? Promise.resolve()
          .then(() => image.decode())
          .then(
            () => undefined,
            () => undefined
          )
      : Promise.resolve();
  let decodeCeilingTimer: number | null = null;
  const decodeCeiling = new Promise<void>((resolve) => {
    decodeCeilingTimer = window.setTimeout(resolve, maxDecodeMs);
  });
  const minimumPaint = new Promise<void>((resolve) => {
    window.setTimeout(resolve, minPaintMs);
  });

  await Promise.all([Promise.race([decode, decodeCeiling]), minimumPaint]);
  if (decodeCeilingTimer != null) {
    window.clearTimeout(decodeCeilingTimer);
  }
}
