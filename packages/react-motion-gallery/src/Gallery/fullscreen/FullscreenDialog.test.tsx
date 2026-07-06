// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { FullscreenRuntime } from "./FullscreenRuntime";
import {
  FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX,
  FULLSCREEN_INTRO_MEDIA_Z_INDEX_OFFSET,
  FULLSCREEN_MODAL_ROOT_Z_INDEX_OFFSET,
  FULLSCREEN_OVERLAY_PROMOTED_ROOT_Z_INDEX_OFFSET,
  FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX,
  FULLSCREEN_TOP_CHROME_Z_INDEX,
} from "./layering";
import type { FullscreenPlugin } from "./types";

vi.mock("./FullscreenSlider", async () => {
  const React = await import("react");

  return {
    FullscreenSlider: React.forwardRef<HTMLDivElement, any>(
      function MockFullscreenSlider(props, ref) {
        const threshold =
          typeof props.virtualization?.threshold === "number"
            ? props.virtualization.threshold
            : 40;
        const useVirtualWindow =
          props.virtualization?.enabled === true &&
          props.cellCount > 1 &&
          props.cellCount > threshold;
        const renderWindow = useVirtualWindow
          ? [
              {
                renderedIndex: 1,
                canonicalIndex: 0,
                virtualIndex: 0,
                isClone: false,
                key: "virtual-0",
                transform: "translate3d(0, 0, 0)",
              },
              {
                renderedIndex: 2,
                canonicalIndex: 1,
                virtualIndex: 1,
                isClone: false,
                key: "virtual-1",
                transform: "translate3d(100%, 0, 0)",
              },
            ]
          : null;
        const renderedChildren =
          typeof props.renderChildren === "function"
            ? props.renderChildren(renderWindow)
            : props.children;
        const crossfadeIndexes = (globalThis as any)
          .__rmgTestCrossfadeIndexes as number[] | undefined;
        const renderedCrossfade =
          Array.isArray(crossfadeIndexes) &&
          typeof props.renderCrossfadeSlides === "function"
            ? props.renderCrossfadeSlides(crossfadeIndexes)
            : null;

        return (
          <div ref={ref} data-testid="mock-fullscreen-slider">
            <button
              type="button"
              data-testid="activate-close-layer"
              onClick={() => props.onCloseDragLayerChange?.(true)}
            />
            {renderedChildren}
            {renderedCrossfade}
          </div>
        );
      }
    ),
  };
});

const zoomMotion = {
  phase: "visible",
  isZoomed: false,
  interactive: true,
  contentStyle: {},
};

function createFsSub() {
  return {
    get: () => 0,
    onEvent: () => () => undefined,
    requestNext: vi.fn(),
    requestPrev: vi.fn(),
  };
}

function createRuntimePlugin(): FullscreenPlugin {
  return {
    __rmgFullscreenPlugin: true,
    kind: "captions",
    runtime: {
      renderSlides: () => [<div key="slide" data-testid="mock-slide" />],
      renderCrossfadeSlides: () => [],
      useZoomPanRuntime: () => {
        const isPinching = React.useRef(false);
        const isTouchPinching = React.useRef(false);
        const noop = React.useCallback(() => undefined, []);

        return {
          isPinching,
          isTouchPinching,
          entryOverlayZoomMotion: zoomMotion,
          captionZoomMotion: zoomMotion,
          handlePanPointerStart: noop,
          handleZoomToggle: noop,
          resetAllZoomDom: noop,
          resetForSlideNavigation: noop,
          forceResetZoom: noop,
        };
      },
    },
  };
}

function createRenderSlidesPlugin(args: {
  kind: FullscreenPlugin["kind"];
  lazyLoad?: boolean;
  renderSlides: (args: any) => React.ReactNode[];
  renderCrossfadeSlides?: (args: any) => React.ReactNode[];
}): FullscreenPlugin {
  return {
    __rmgFullscreenPlugin: true,
    kind: args.kind,
    runtime: {
      lazyLoad: args.lazyLoad,
      renderSlides: args.renderSlides,
      renderCrossfadeSlides: args.renderCrossfadeSlides ?? (() => []),
      useZoomPanRuntime: () => {
        const isPinching = React.useRef(false);
        const isTouchPinching = React.useRef(false);
        const noop = React.useCallback(() => undefined, []);

        return {
          isPinching,
          isTouchPinching,
          entryOverlayZoomMotion: zoomMotion,
          captionZoomMotion: zoomMotion,
          handlePanPointerStart: noop,
          handleZoomToggle: noop,
          resetAllZoomDom: noop,
          resetForSlideNavigation: noop,
          forceResetZoom: noop,
        };
      },
    },
  };
}

function createMediaItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    kind: "image",
    src: `https://example.com/image-${index}.jpg`,
    alt: `Image ${index}`,
  })) as Array<{ kind: "image"; src: string; alt: string }>;
}

function configureFullscreenItems(
  props: ReturnType<typeof createBaseProps>,
  count: number
) {
  const items = createMediaItems(count);
  props.normalizedItems = items as any;
  props.wrappedItems =
    count > 1
      ? ([items[count - 1], ...items, items[0]] as any)
      : ([items[0]] as any);
  props.imageRefs = {
    current: Array.from({ length: Math.max(1, count + 2) }, () =>
      React.createRef<HTMLDivElement | null>()
    ),
  };
  props.entryMapRef = {
    current: items.map((_, index) => ({ entryIndex: 0, mediaIndex: index })),
  };
}

function createBaseProps() {
  const item = {
    kind: "image",
    src: "https://example.com/alpha.jpg",
    alt: "Alpha",
  } as const;
  const entry = {
    title: "Entry Alpha",
    media: [item],
  };

  return {
    fsEnabled: true,
    fsSub: createFsSub() as any,
    showFullscreenModal: true,
    setShowFullscreenModal: vi.fn(),
    setShowFullscreenSlider: vi.fn(),
    showFullscreenSlider: true,
    isClick: { current: false },
    isAnimatingRef: { current: false },
    overlayDivRef: { current: null },
    duplicateImgRef: { current: null },
    cells: { current: [] },
    slidesForFullscreen: { current: [] },
    sliderForFullscreen: { current: null },
    isWrappingForFullscreen: { current: false },
    setClosingModal: vi.fn(),
    closingModal: false,
    closeButtonRef: { current: null },
    counterRef: { current: null },
    leftChevronRef: { current: null },
    rightChevronRef: { current: null },
    centerSliderForFullscreen: vi.fn(),
    setSliderIndexForFullscreen: vi.fn(),
    layout: "entries" as const,
    expandableImageRefs: { current: [] },
    resolveLayoutlessTarget: () => ({ host: null, image: null, media: null }),
    entryMapRef: { current: [{ entryIndex: 0, mediaIndex: 0 }] },
    entryMediaLayout: null,
    introFade: false,
    introDuration: { transform: 0, fade: 0 },
    introEasing: "linear",
    fullscreenSliderApi: React.createRef<any>(),
    slideIndex: 0,
    isZoomClick: { current: false },
    isZoomed: false,
    windowSize: { width: 900, height: 600 },
    imageRefs: { current: [React.createRef<HTMLDivElement | null>()] },
    wrappedItems: [item as any],
    setWrappedItems: vi.fn(),
    scale: 1,
    isZooming: { current: false },
    singleModePlyrRefs: { current: [] },
    wrappedModePlyrRefs: { current: [] },
    direction: "ltr" as const,
    sliderGap: 0,
    sliderDuration: 0,
    sliderFriction: 1,
    sliderSkipSnaps: undefined,
    sliderStrictSnaps: false,
    suppressLoopRef: { current: false },
    fsFadeOpening: false,
    normalizedItems: [item as any],
    fsThumbContainerRef: { current: null },
    fullscreenThumbnailSlot: null,
    setFullscreenThumbnailMountEl: vi.fn(),
    showFsEntryOverlayMount: true,
    fsIntroReq: null,
    clearFsIntroReq: vi.fn(),
    styles: {
      fullscreenImages: "fullscreenImages",
      imgMargin: "imgMargin",
      open: "open",
    },
    fs: {
      enabled: true,
      dialog: {
        className: "dialog-shell",
        media: { className: "dialog-media" },
        caption: { className: "dialog-caption" },
      },
      controls: {
        close: { enabled: false },
        counter: { enabled: false },
        arrows: { enabled: false },
      },
      caption: {
        layout: "overlay",
        placement: "bottom",
        render: () => <span data-testid="caption-overlay">Caption</span>,
      },
      slider: {
        duration: 0,
        friction: 1,
        virtualization: { enabled: true },
      },
      effects: {
        introFade: false,
        crossfade: {},
      },
      zoom: {},
    },
    overlayCaptionRef: { current: null },
    overlayCaptionRootRef: { current: null },
    setFsFadeOpening: vi.fn(),
    addShield: vi.fn(),
    resolveFsCaptionPlacement: (
      placement: "top" | "right" | "bottom" | "left" | undefined
    ) => placement ?? "bottom",
    requestFsCloseRef: { current: null },
    cancelFsCloseRef: { current: null },
    suppressNextClickRef: { current: false },
    currentImage: { current: null },
    scaleRef: { current: 1 },
    pointerDownRef: { current: false },
    interactionModeRef: { current: "idle" as const },
    boundsX: { current: null },
    boundsY: { current: null },
    bodyX: { current: null },
    bodyY: { current: null },
    locX: { current: null },
    locY: { current: null },
    prevX: { current: null },
    prevY: { current: null },
    offX: { current: null },
    offY: { current: null },
    tgtX: { current: null },
    tgtY: { current: null },
    axisRef: { current: null },
    animRef: { current: null },
    setScale: vi.fn(),
    previousZoom: { current: { x: 0, y: 0 } },
    panRef: { current: { x: 0, y: 0 } },
    changingSlides: { current: false },
    fsIndexRef: { current: 0 },
    entriesObject: {
      items: [entry],
      overlay: {
        placement: "right",
        width: 260,
        overlayCrossfadeDurationMs: 0,
      },
      render: {
        overlay: ({ entry: activeEntry }: { entry: typeof entry }) => (
          <span data-testid="entry-overlay">{activeEntry.title}</span>
        ),
      },
    },
    syncFullscreenSourceFromIndex: vi.fn(),
    setFullscreenOpen: vi.fn(),
    runtimePlugins: [createRuntimePlugin()],
    dialogHidden: false,
    dialogTransitionDurationMs: undefined as number | undefined,
    dialogTransitionEasing: undefined as string | undefined,
  };
}

function mountRuntime(configure?: (props: ReturnType<typeof createBaseProps>) => void) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const props = createBaseProps();

  configure?.(props);

  React.act(() => {
    root.render(<FullscreenRuntime {...(props as any)} />);
  });

  return { container, props, root };
}

function unmount(root: Root, container: HTMLElement) {
  React.act(() => {
    root.unmount();
  });
  container.remove();
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      window.setTimeout(() => cb(performance.now()), 0)) as any;
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = ((id: number) =>
      window.clearTimeout(id)) as any;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (globalThis as any).__rmgTestCrossfadeIndexes;
  document.body.innerHTML = "";
});

afterAll(() => {
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

describe("fullscreen dialog mode", () => {
  test("promotes the modal root above intro media when overlay captions mount by default", () => {
    const { container, root } = mountRuntime((nextProps) => {
      nextProps.showFsEntryOverlayMount = false;
    });

    const fullscreenRoot = container.querySelector<HTMLElement>(
      '[data-rmg-fs-root="true"]'
    );
    const baseZ = 9999;

    expect(fullscreenRoot?.style.zIndex).toBe(
      String(baseZ + FULLSCREEN_OVERLAY_PROMOTED_ROOT_Z_INDEX_OFFSET)
    );
    expect(FULLSCREEN_OVERLAY_PROMOTED_ROOT_Z_INDEX_OFFSET).toBeGreaterThan(
      FULLSCREEN_INTRO_MEDIA_Z_INDEX_OFFSET
    );

    unmount(root, container);
  });

  test("promotes the modal root above intro media when entry overlays mount by default", () => {
    const { container, root } = mountRuntime((nextProps) => {
      delete (nextProps.fs as any).caption;
    });

    const fullscreenRoot = container.querySelector<HTMLElement>(
      '[data-rmg-fs-root="true"]'
    );
    const baseZ = 9999;

    expect(fullscreenRoot?.style.zIndex).toBe(
      String(baseZ + FULLSCREEN_OVERLAY_PROMOTED_ROOT_Z_INDEX_OFFSET)
    );
    expect(FULLSCREEN_OVERLAY_PROMOTED_ROOT_Z_INDEX_OFFSET).toBeGreaterThan(
      FULLSCREEN_INTRO_MEDIA_Z_INDEX_OFFSET
    );

    unmount(root, container);
  });

  test("keeps the legacy modal root layer when overlay intro promotion is disabled", () => {
    const { container, root } = mountRuntime((nextProps) => {
      (nextProps.fs as any).overlaysAboveIntroMedia = false;
    });

    const fullscreenRoot = container.querySelector<HTMLElement>(
      '[data-rmg-fs-root="true"]'
    );
    const baseZ = 9999;

    expect(fullscreenRoot?.style.zIndex).toBe(
      String(baseZ + FULLSCREEN_MODAL_ROOT_Z_INDEX_OFFSET)
    );
    expect(FULLSCREEN_INTRO_MEDIA_Z_INDEX_OFFSET).toBeGreaterThan(
      FULLSCREEN_MODAL_ROOT_Z_INDEX_OFFSET
    );

    unmount(root, container);
  });

  test("only passes fullscreen lazy-load options when the lazy-load runtime is installed", () => {
    const lazyLoad = {
      images: { enabled: true },
      videos: { enabled: true },
    };
    const renderSlidesWithoutLazy = vi.fn(() => [
      <div key="slide" data-testid="mock-slide" />,
    ]);
    const withoutLazy = mountRuntime((nextProps) => {
      nextProps.fs.lazyLoad = lazyLoad;
      nextProps.runtimePlugins = [
        createRenderSlidesPlugin({
          kind: "video",
          renderSlides: renderSlidesWithoutLazy,
        }),
      ];
    });

    expect(renderSlidesWithoutLazy).toHaveBeenCalled();
    expect(
      renderSlidesWithoutLazy.mock.calls.every(([args]) => args.fsLazy == null)
    ).toBe(true);

    unmount(withoutLazy.root, withoutLazy.container);

    const renderSlidesWithLazy = vi.fn(() => [
      <div key="slide" data-testid="mock-slide" />,
    ]);
    const withLazy = mountRuntime((nextProps) => {
      nextProps.fs.lazyLoad = lazyLoad;
      nextProps.runtimePlugins = [
        createRenderSlidesPlugin({
          kind: "lazy-load",
          lazyLoad: true,
          renderSlides: renderSlidesWithLazy,
        }),
      ];
    });

    expect(renderSlidesWithLazy).toHaveBeenCalled();
    expect(
      renderSlidesWithLazy.mock.calls.some(([args]) => args.fsLazy === lazyLoad)
    ).toBe(true);

    unmount(withLazy.root, withLazy.container);
  });

  test("passes a fullscreen virtual render window to the slide renderer on open", () => {
    const renderSlides = vi.fn((args: any) =>
      (args.renderWindow ?? args.items).map((item: any, index: number) => (
        <div
          key={item.key ?? `slide-${index}`}
          data-testid="mock-slide"
          data-rendered-index={String(item.renderedIndex ?? index)}
        />
      ))
    );

    const { container, root } = mountRuntime((nextProps) => {
      configureFullscreenItems(nextProps, 8);
      nextProps.fs.slider = {
        ...nextProps.fs.slider,
        virtualization: { enabled: true, threshold: 4, overscan: 2 },
      };
      nextProps.runtimePlugins = [
        createRenderSlidesPlugin({
          kind: "captions",
          renderSlides,
        }),
      ];
    });

    const windowedCall = renderSlides.mock.calls.find(([args]) =>
      Array.isArray(args.renderWindow)
    )?.[0];

    expect(windowedCall?.items).toHaveLength(10);
    expect(windowedCall?.renderWindow).toHaveLength(2);
    expect(container.querySelectorAll('[data-testid="mock-slide"]')).toHaveLength(
      2
    );

    unmount(root, container);
  });

  test("keeps the full fullscreen render when virtualization is disabled", () => {
    const renderSlides = vi.fn((args: any) =>
      (args.renderWindow ?? args.items).map((item: any, index: number) => (
        <div
          key={item.key ?? `slide-${index}`}
          data-testid="mock-slide"
          data-rendered-index={String(item.renderedIndex ?? index)}
        />
      ))
    );

    const { container, root } = mountRuntime((nextProps) => {
      configureFullscreenItems(nextProps, 5);
      nextProps.fs.slider = {
        ...nextProps.fs.slider,
        virtualization: { enabled: false },
      };
      nextProps.runtimePlugins = [
        createRenderSlidesPlugin({
          kind: "captions",
          renderSlides,
        }),
      ];
    });

    const fullRenderCall = renderSlides.mock.calls.find(
      ([args]) => args.renderWindow == null
    )?.[0];

    expect(fullRenderCall?.items).toHaveLength(7);
    expect(container.querySelectorAll('[data-testid="mock-slide"]')).toHaveLength(
      7
    );

    unmount(root, container);
  });

  test("renders fullscreen crossfade nodes only for requested source and target indexes", () => {
    (globalThis as any).__rmgTestCrossfadeIndexes = [2, 5];

    const renderSlides = vi.fn((args: any) =>
      (args.renderWindow ?? args.items).map((item: any, index: number) => (
        <div key={item.key ?? `slide-${index}`} data-testid="mock-slide" />
      ))
    );
    const renderCrossfadeSlides = vi.fn((args: any) =>
      (args.renderWindow ?? args.items).map((item: any, index: number) => (
        <div
          key={item.key ?? `crossfade-${index}`}
          data-testid="mock-crossfade-slide"
          data-index={String(item.virtualIndex ?? index)}
        />
      ))
    );

    const { container, root } = mountRuntime((nextProps) => {
      configureFullscreenItems(nextProps, 8);
      nextProps.runtimePlugins = [
        createRenderSlidesPlugin({
          kind: "captions",
          renderSlides,
          renderCrossfadeSlides,
        }),
      ];
    });

    const crossfadeCall = renderCrossfadeSlides.mock.calls[0]?.[0];

    expect(crossfadeCall?.renderWindow).toHaveLength(2);
    expect(
      crossfadeCall?.renderWindow.map((item: any) => item.virtualIndex)
    ).toEqual([2, 5]);
    expect(
      container.querySelectorAll('[data-testid="mock-crossfade-slide"]')
    ).toHaveLength(2);

    unmount(root, container);
  });

  test("mounts media and overlay panes inside the dialog wrapper", () => {
    const { container, root } = mountRuntime();

    const fullscreenRoot = container.querySelector<HTMLElement>(
      '[data-rmg-fs-root="true"]'
    );
    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );
    const media = dialog?.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-media="true"]'
    );
    const captionPane = dialog?.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-caption="true"]'
    );

    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("data-rmg-fs-dialog-placement")).toBe("right");
    expect(media?.querySelector('[data-testid="mock-fullscreen-slider"]')).toBeTruthy();
    expect(captionPane?.querySelector('[data-testid="caption-overlay"]')).toBeTruthy();
    expect(captionPane?.querySelector('[data-testid="entry-overlay"]')).toBeTruthy();
    expect(media?.style.minWidth).toBe("45%");
    expect(captionPane?.style.width).toBe("260px");
    expect(captionPane?.style.flexBasis).toBe("260px");
    expect(captionPane?.style.maxWidth).toBe("55%");

    const directViewportOverlays = Array.from(fullscreenRoot?.children ?? []).filter(
      (child) =>
        child.getAttribute("data-rmg-fs-caption") === "true" ||
        child.getAttribute("data-rmg-fs-entry-overlay") === "true"
    );
    expect(directViewportOverlays).toHaveLength(0);

    unmount(root, container);
  });

  test("keeps dialog percentage caption widths relative to the dialog pane", () => {
    const { container, root } = mountRuntime((nextProps) => {
      nextProps.showFsEntryOverlayMount = false;
      nextProps.windowSize = { width: 1800, height: 900 };
      nextProps.fs.caption = {
        ...(nextProps.fs.caption ?? {}),
        layout: "overlay",
        placement: "right",
        width: {
          xs: "60%",
          lg: "34%",
          xl: "30%",
        },
        render: () => <span data-testid="caption-overlay">Caption</span>,
      };
    });

    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );
    const media = dialog?.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-media="true"]'
    );
    const captionPane = dialog?.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-caption="true"]'
    );

    expect(dialog?.getAttribute("data-rmg-fs-dialog-placement")).toBe("right");
    expect(media?.style.minWidth).toBe("45%");
    expect(captionPane?.style.width).toBe("30%");
    expect(captionPane?.style.flexBasis).toBe("30%");
    expect(captionPane?.style.maxWidth).toBe("55%");

    unmount(root, container);
  });

  test("keeps fullscreen thumbnails below promoted close media", () => {
    const setFullscreenThumbnailMountEl = vi.fn();
    const { container, root } = mountRuntime((nextProps) => {
      nextProps.fullscreenThumbnailSlot = { position: "bottom" } as any;
      nextProps.setFullscreenThumbnailMountEl = setFullscreenThumbnailMountEl;
    });

    const thumbnailSlot = setFullscreenThumbnailMountEl.mock.calls
      .map(([node]) => node)
      .find((node): node is HTMLElement => node instanceof HTMLElement);

    expect(thumbnailSlot).toBeTruthy();
    expect(thumbnailSlot?.style.zIndex).toBe(
      String(FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX)
    );

    unmount(root, container);
  });

  test("promotes dialog media over dialog chrome during close drag when intro overlays stay below", () => {
    const setFullscreenThumbnailMountEl = vi.fn();
    const { container, root } = mountRuntime((nextProps) => {
      (nextProps.fs as any).overlaysAboveIntroMedia = false;
      nextProps.fs.controls = {
        ...nextProps.fs.controls,
        close: { enabled: true },
      };
      nextProps.fs.dialog.style = {
        ...(nextProps.fs.dialog.style ?? {}),
        borderRadius: 8,
      };
      nextProps.fullscreenThumbnailSlot = { position: "bottom" } as any;
      nextProps.setFullscreenThumbnailMountEl = setFullscreenThumbnailMountEl;
    });

    const activateCloseLayer = container.querySelector<HTMLButtonElement>(
      '[data-testid="activate-close-layer"]'
    );

    React.act(() => {
      activateCloseLayer?.click();
    });

    const dialogBody = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-body="true"]'
    );
    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );
    const dialogMedia = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-media="true"]'
    );
    const dialogCaption = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-caption="true"]'
    );
    const dialogHeader = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-header="true"]'
    );
    const thumbnailSlot = setFullscreenThumbnailMountEl.mock.calls
      .map(([node]) => node)
      .find((node): node is HTMLElement => node instanceof HTMLElement);

    expect(dialogHeader?.style.zIndex).toBe(
      String(FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX)
    );
    expect(dialog?.style.zIndex).toBe(
      String(FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX)
    );
    expect(dialog?.style.overflow).toBe("visible");
    expect(dialog?.style.borderRadius).toBe("8px");
    expect(dialog?.style.contain).toBe("none");
    expect(dialog?.style.isolation).toBe("auto");
    expect(dialogHeader?.style.borderTopLeftRadius).toBe("inherit");
    expect(dialogHeader?.style.borderTopRightRadius).toBe("inherit");
    expect(dialogHeader?.style.overflow).toBe("hidden");
    expect(dialogBody?.style.zIndex).toBe(
      String(FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX)
    );
    expect(dialogBody?.style.overflow).toBe("visible");
    expect(dialogBody?.style.contain).toBe("none");
    expect(dialogMedia?.style.zIndex).toBe(
      String(FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX)
    );
    expect(dialogMedia?.style.overflow).toBe("visible");
    expect(dialogMedia?.style.borderBottomLeftRadius).toBe("inherit");
    expect(dialogMedia?.style.contain).toBe("none");
    expect(dialogCaption?.style.borderBottomRightRadius).toBe("inherit");
    expect(thumbnailSlot?.style.zIndex).toBe(
      String(FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX - 1)
    );
    expect(FULLSCREEN_TOP_CHROME_Z_INDEX).toBeGreaterThan(
      FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX
    );

    unmount(root, container);
  });

  test("does not promote dialog media during close drag unless intro overlays stay below", () => {
    const setFullscreenThumbnailMountEl = vi.fn();
    const { container, root } = mountRuntime((nextProps) => {
      nextProps.fullscreenThumbnailSlot = { position: "bottom" } as any;
      nextProps.setFullscreenThumbnailMountEl = setFullscreenThumbnailMountEl;
    });

    const activateCloseLayer = container.querySelector<HTMLButtonElement>(
      '[data-testid="activate-close-layer"]'
    );

    React.act(() => {
      activateCloseLayer?.click();
    });

    const dialogBody = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-body="true"]'
    );
    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );
    const dialogMedia = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-media="true"]'
    );
    const thumbnailSlot = setFullscreenThumbnailMountEl.mock.calls
      .map(([node]) => node)
      .find((node): node is HTMLElement => node instanceof HTMLElement);

    expect(dialog?.style.zIndex).toBe("");
    expect(dialog?.style.overflow).toBe("hidden");
    expect(dialogBody?.style.zIndex).toBe("");
    expect(dialogBody?.style.overflow).toBe("hidden");
    expect(dialogMedia?.style.zIndex).toBe("");
    expect(dialogMedia?.style.overflow).toBe("hidden");
    expect(thumbnailSlot?.style.zIndex).toBe(
      String(FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX)
    );

    unmount(root, container);
  });

  test("keeps dialog media promoted during close animation when intro overlays stay below", () => {
    const setFullscreenThumbnailMountEl = vi.fn();
    const { container, root } = mountRuntime((nextProps) => {
      (nextProps.fs as any).overlaysAboveIntroMedia = false;
      nextProps.closingModal = true;
      nextProps.fs.dialog.style = {
        ...(nextProps.fs.dialog.style ?? {}),
        borderRadius: 8,
      };
      nextProps.fullscreenThumbnailSlot = { position: "bottom" } as any;
      nextProps.setFullscreenThumbnailMountEl = setFullscreenThumbnailMountEl;
    });

    const dialogBody = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-body="true"]'
    );
    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );
    const dialogMedia = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-media="true"]'
    );
    const dialogCaption = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-caption="true"]'
    );
    const thumbnailSlot = setFullscreenThumbnailMountEl.mock.calls
      .map(([node]) => node)
      .find((node): node is HTMLElement => node instanceof HTMLElement);

    expect(dialog?.style.overflow).toBe("visible");
    expect(dialog?.style.borderRadius).toBe("8px");
    expect(dialogBody?.style.zIndex).toBe(
      String(FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX)
    );
    expect(dialogBody?.style.overflow).toBe("visible");
    expect(dialogMedia?.style.zIndex).toBe(
      String(FULLSCREEN_CLOSE_MEDIA_LAYER_Z_INDEX)
    );
    expect(dialogMedia?.style.overflow).toBe("visible");
    expect(dialogMedia?.style.borderTopLeftRadius).toBe("inherit");
    expect(dialogMedia?.style.borderBottomLeftRadius).toBe("inherit");
    expect(thumbnailSlot?.style.zIndex).toBe(
      String(FULLSCREEN_THUMBNAIL_SLOT_Z_INDEX - 1)
    );
    expect(dialogCaption?.style.borderTopRightRadius).toBe("inherit");
    expect(dialogCaption?.style.borderBottomRightRadius).toBe("inherit");

    unmount(root, container);
  });

  test("rounds the full caption surface when absolute close chrome floats over hidden media", () => {
    const { container, root } = mountRuntime((nextProps) => {
      (nextProps.fs as any).overlaysAboveIntroMedia = false;
      nextProps.closingModal = true;
      nextProps.showFsEntryOverlayMount = false;
      nextProps.fs.controls = {
        ...nextProps.fs.controls,
        close: { enabled: true },
      };
      nextProps.fs.dialog.style = {
        ...(nextProps.fs.dialog.style ?? {}),
        borderRadius: 8,
      };
      nextProps.fs.dialog.header = {
        ...(nextProps.fs.dialog.header ?? {}),
        style: {
          ...(nextProps.fs.dialog.header?.style ?? {}),
          position: "absolute",
          inset: "0 0 auto 0",
        },
      };
      nextProps.fs.dialog.media = {
        ...(nextProps.fs.dialog.media ?? {}),
        style: {
          ...(nextProps.fs.dialog.media?.style ?? {}),
          display: "none",
        },
      };
      nextProps.fs.caption = {
        ...(nextProps.fs.caption ?? {}),
        placement: "bottom",
        height: "100%",
        render: () => <span data-testid="caption-overlay">Caption</span>,
      };
    });

    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );
    const dialogHeader = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-header="true"]'
    );
    const dialogMedia = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-media="true"]'
    );
    const dialogCaption = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-caption="true"]'
    );

    expect(dialog?.style.overflow).toBe("hidden");
    expect(dialog?.style.borderRadius).toBe("8px");
    expect(dialogHeader?.style.borderTopLeftRadius).toBe("");
    expect(dialogHeader?.style.borderTopRightRadius).toBe("");
    expect(dialogHeader?.style.zIndex).toBe("2");
    expect(dialogMedia?.style.display).toBe("none");
    expect(dialogMedia?.style.zIndex).toBe("");
    expect(dialogMedia?.style.overflow).toBe("hidden");
    expect(dialogMedia?.style.borderTopLeftRadius).toBe("");
    expect(dialogCaption?.style.borderTopLeftRadius).toBe("inherit");
    expect(dialogCaption?.style.borderTopRightRadius).toBe("inherit");
    expect(dialogCaption?.style.borderBottomRightRadius).toBe("inherit");
    expect(dialogCaption?.style.borderBottomLeftRadius).toBe("inherit");
    expect(dialogCaption?.style.overflow).toBe("hidden");

    unmount(root, container);
  });

  test("renders the close button inside a dialog header and closes from the backdrop", () => {
    const { container, props, root } = mountRuntime((nextProps) => {
      nextProps.fs.controls = {
        ...nextProps.fs.controls,
        close: {
          className: "custom-close",
          render: () => <span data-testid="close-icon">Close</span>,
        },
      };
    });

    const fullscreenRoot = container.querySelector<HTMLElement>(
      '[data-rmg-fs-root="true"]'
    );
    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );
    const header = dialog?.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-header="true"]'
    );
    const closeButton = header?.querySelector<HTMLButtonElement>(
      '[data-rmg-fs-dialog-close="true"]'
    );
    const backdrop = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog-backdrop="true"]'
    );

    expect(header).toBeTruthy();
    expect(closeButton).toBeTruthy();
    expect(closeButton?.className).toContain("custom-close");
    expect(header?.querySelector('[data-testid="close-icon"]')).toBeTruthy();
    expect(
      Array.from(fullscreenRoot?.children ?? []).filter(
        (child) => child.tagName === "BUTTON"
      )
    ).toHaveLength(0);

    const requestClose = vi.fn();
    props.requestFsCloseRef.current = requestClose;

    React.act(() => {
      dialog?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(requestClose).not.toHaveBeenCalled();

	    React.act(() => {
	      backdrop?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
	      backdrop?.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
	      backdrop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	    });
	    expect(requestClose).toHaveBeenCalledTimes(1);

    React.act(() => {
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(requestClose).toHaveBeenCalledTimes(2);

	    unmount(root, container);
	  });

	  test("does not close from backdrop when the pointer down started in dialog content", () => {
	    const { container, props, root } = mountRuntime((nextProps) => {
	      nextProps.fs.controls = {
	        ...nextProps.fs.controls,
	        close: { enabled: true },
	      };
	    });
	    const requestClose = vi.fn();
	    props.requestFsCloseRef.current = requestClose;
	
	    const slider = container.querySelector<HTMLElement>(
	      '[data-testid="mock-fullscreen-slider"]'
	    );
	    const backdrop = container.querySelector<HTMLElement>(
	      '[data-rmg-fs-dialog-backdrop="true"]'
	    );
	
	    React.act(() => {
	      slider?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
	      backdrop?.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
	      backdrop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	    });
	
	    expect(requestClose).not.toHaveBeenCalled();
	
	    unmount(root, container);
	  });

	  test("hides only the dialog surface for dialog transitions", () => {
    const { container, root } = mountRuntime((nextProps) => {
      nextProps.dialogHidden = true;
      nextProps.dialogTransitionDurationMs = 180;
      nextProps.dialogTransitionEasing = "linear";
    });

    const fullscreenRoot = container.querySelector<HTMLElement>(
      '[data-rmg-fs-root="true"]'
    );
    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );

    expect(fullscreenRoot?.style.opacity).toBe("1");
    expect(dialog?.style.opacity).toBe("0");
    expect(dialog?.style.pointerEvents).toBe("none");
    expect(dialog?.style.transition).toContain("opacity 180ms linear");

    unmount(root, container);
  });

  test("mounts an opening dialog hidden before fading it in", async () => {
    const { container, root } = mountRuntime((nextProps) => {
      nextProps.dialogTransitionDurationMs = 120;
      nextProps.dialogTransitionEasing = "linear";
    });

    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );

    expect(dialog?.style.opacity).toBe("0");
    expect(dialog?.style.pointerEvents).toBe("none");

    await React.act(async () => {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
    });

    expect(dialog?.style.opacity).toBe("1");
    expect(dialog?.style.pointerEvents).toBe("");
    expect(dialog?.style.transition).toContain("opacity 120ms linear");

    unmount(root, container);
  });

  test("normal dialog opacity ignores switch-only timing", async () => {
    const openRuntime = mountRuntime((nextProps) => {
      Object.assign(nextProps.fs.dialog, {
        opacityDuration: 90,
        opacityEasing: "ease-in",
        switchOpacityDuration: 440,
        switchOpacityEasing: "step-end",
      });
    });

    await React.act(async () => {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
    });

    const openDialog = openRuntime.container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );

    expect(openDialog?.style.transition).toContain("opacity 90ms ease-in");
    expect(openDialog?.style.transition).not.toContain("440ms");
    expect(openDialog?.style.transition).not.toContain("step-end");

    unmount(openRuntime.root, openRuntime.container);

    const closingRuntime = mountRuntime((nextProps) => {
      nextProps.closingModal = true;
      Object.assign(nextProps.fs.dialog, {
        opacityDuration: 90,
        opacityEasing: "ease-in",
        switchOpacityDuration: 440,
        switchOpacityEasing: "step-end",
      });
    });

    const closingDialog = closingRuntime.container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );

    expect(closingDialog?.style.transition).toContain("opacity 90ms ease-in");
    expect(closingDialog?.style.transition).not.toContain("440ms");
    expect(closingDialog?.style.transition).not.toContain("step-end");

    unmount(closingRuntime.root, closingRuntime.container);
  });

  test("keeps the dialog shell clipped while closing", () => {
    const { container, root } = mountRuntime((nextProps) => {
      nextProps.closingModal = true;
      nextProps.fs.dialog.style = {
        ...(nextProps.fs.dialog.style ?? {}),
        borderRadius: 8,
      };
    });

    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );

    expect(dialog?.style.overflow).toBe("hidden");
    expect(dialog?.style.borderRadius).toBe("8px");

    unmount(root, container);
  });

  test("restores a hidden dialog surface with the requested transition", async () => {
    const { container, root } = mountRuntime((nextProps) => {
      nextProps.dialogHidden = false;
      nextProps.dialogTransitionDurationMs = 90;
      nextProps.dialogTransitionEasing = "ease-out";
    });

    await React.act(async () => {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
    });

    const dialog = container.querySelector<HTMLElement>(
      '[data-rmg-fs-dialog="true"]'
    );

    expect(dialog?.style.opacity).toBe("1");
    expect(dialog?.style.pointerEvents).toBe("");
    expect(dialog?.style.transition).toContain("opacity 90ms ease-out");

    unmount(root, container);
  });
});
