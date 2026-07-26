import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import type { VideoSnapshotStore } from "../video/videoSnapshotStore";
import {
  buildFullscreenCaptionZoomMotion,
  resolveFullscreenCaptionZoomSettings,
} from "./captionZoomMotion";
import {
  renderFullscreenSlides,
  renderFullscreenCrossfadeSlides,
  shouldUseFsStaticInactiveVideo,
  shouldUseFsStaticVideoPreview,
} from "./renderFullscreenSlides";
import { renderFullscreenBaseSlides } from "./renderFullscreenBaseSlides";

function createEmptyVideoSnapshotStore(): VideoSnapshotStore {
  return {
    registerOriginal: () => undefined,
    unregisterOriginal: () => undefined,
    getSnapshot: () => null,
    subscribe: () => () => undefined,
    reset: () => undefined,
    destroy: () => undefined,
  };
}

function createImageSlideRenderArgs(overrides: Record<string, unknown> = {}) {
  const items = [
    { kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" },
    { kind: "image", src: "https://example.com/bravo.jpg", alt: "Bravo" },
    { kind: "image", src: "https://example.com/charlie.jpg", alt: "Charlie" },
  ] as any[];

  return {
    items,
    plyrList: [],
    getTransform: (index: number) => `translateX(${index * 100}%)`,
    renderWindow: items.map((_, index) => ({
      renderedIndex: index,
      canonicalIndex: index,
    })),
    imageRefs: { current: items.map(() => React.createRef<HTMLDivElement>()) },
    playerRefs: { current: [] },
    cells: { current: [] },
    isZoomed: false,
    showFullscreenSlider: true,
    defaultPlayerStyle: {},
    onPanPointerDown: () => undefined,
    onSuppressNextClickCapture: () => undefined,
    resolveFsCaptionPlacement: () => null,
    styles: {
      imgMargin: "imgMargin",
      fullscreenImages: "fullscreenImages",
    },
    fsDecodedImagesRef: { current: new Set() },
    fsCustomDecodedImagesRef: { current: new Set() },
    fsCustomResolvedSrcByKeyRef: { current: new Map() },
    fsPreparedVideosRef: { current: new Set() },
    getMediaKey: (item: any) => String(item.src ?? ""),
    ...overrides,
  } as any;
}

describe("fullscreen crossfade slide rendering", () => {
  test("renders default fullscreen image dimensions for first-view intro measurement", () => {
    const slides = renderFullscreenSlides({
      items: [
        {
          kind: "image",
          src: "https://example.com/alpha.jpg",
          alt: "Alpha",
          width: 1200,
          height: 900,
        } as any,
      ],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('width="1200"');
    expect(markup).toContain('height="900"');
  });

  test("renders captions for every window slide by default", () => {
    const renderCaption = vi.fn(({ index }: { index: number }) => (
      <span>Caption {index}</span>
    ));

    renderToStaticMarkup(
      <>{renderFullscreenSlides(createImageSlideRenderArgs({ renderCaption }))}</>
    );

    expect(renderCaption.mock.calls.map(([args]) => args.index)).toEqual([
      0,
      1,
      2,
    ]);
  });

  test("marks crossfade slide layers as inert fullscreen slides", () => {
    const slides = renderFullscreenCrossfadeSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-render-mode="crossfade"');
    expect(markup).toContain('data-rmg-clone="false"');
  });

  test("uses static video previews for crossfade slides instead of live players", () => {
    expect(
      shouldUseFsStaticVideoPreview({
        isClone: false,
        renderMode: "crossfade",
      })
    ).toBe(true);
    expect(
      shouldUseFsStaticVideoPreview({
        isClone: true,
        renderMode: "track",
      })
    ).toBe(true);

    const slides = renderFullscreenCrossfadeSlides({
      items: [{ kind: "video", src: "https://example.com/alpha.mp4" } as any],
      plyrList: [
        {
          source: {
            type: "video",
            sources: [{ src: "https://example.com/alpha.mp4", type: "video/mp4" }],
          },
          options: {},
        } as any,
      ],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      videoSnapshotStore: createEmptyVideoSnapshotStore(),
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-render-mode="crossfade"');
    expect(markup).toContain('data-rmg-video-snapshot="true"');
  });

  test("uses static previews for inactive unprepared video slides by default", () => {
    expect(
      shouldUseFsStaticInactiveVideo({
        activeCanonicalIndex: 0,
        canonicalIndex: 1,
        lazyAllowed: false,
        lazyEnabled: false,
        liveReady: false,
      })
    ).toBe(true);

    const slides = renderFullscreenSlides({
      items: [
        { kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any,
        { kind: "video", src: "https://example.com/bravo.mp4", poster: "https://example.com/bravo.jpg" } as any,
      ],
      plyrList: [
        {} as any,
        {
          source: {
            type: "video",
            poster: "https://example.com/bravo.jpg",
            sources: [{ src: "https://example.com/bravo.mp4", type: "video/mp4" }],
          },
          options: {},
        } as any,
      ],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>(), React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      videoSnapshotStore: createEmptyVideoSnapshotStore(),
      canonicalLength: 2,
      activeCanonicalIndex: 0,
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-video-snapshot="true"');
    expect(markup).not.toContain('data-rmg-live-video="true"');
  });

  test("omits live track video content when fullscreen is not visible and video is deferred", () => {
    const slides = renderFullscreenSlides({
      items: [
        { kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any,
        { kind: "video", src: "https://example.com/bravo.mp4", poster: "https://example.com/bravo.jpg" } as any,
      ],
      plyrList: [
        {} as any,
        {
          source: {
            type: "video",
            poster: "https://example.com/bravo.jpg",
            sources: [{ src: "https://example.com/bravo.mp4", type: "video/mp4" }],
          },
          options: {},
        } as any,
      ],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>(), React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: false,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      videoSnapshotStore: createEmptyVideoSnapshotStore(),
      canonicalLength: 2,
      activeCanonicalIndex: 0,
      deferLiveVideoUntilVisible: true,
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).not.toContain('data-rmg-live-video="true"');
  });

  test("mounts only the opening target player during a video intro", () => {
    const items = [0, 1, 2].map((index) => ({
      kind: "video",
      src: `https://example.com/${index}.mp4`,
      poster: `https://example.com/${index}.jpg`,
    })) as any[];
    const plyrList = items.map((item) => ({
      source: {
        type: "video",
        poster: item.poster,
        sources: [{ src: item.src, type: "video/mp4" }],
      },
      options: {},
    })) as any[];
    const slides = renderFullscreenSlides({
      items,
      plyrList,
      getTransform: () => "translateX(0%)",
      imageRefs: {
        current: items.map(() => React.createRef<HTMLDivElement>()),
      },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: false,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      videoSnapshotStore: createEmptyVideoSnapshotStore(),
      canonicalLength: 3,
      activeCanonicalIndex: 1,
      openingCanonicalIndex: 1,
      openingInProgress: true,
      deferLiveVideoUntilVisible: false,
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup.match(/data-rmg-live-video="true"/g)).toHaveLength(1);
  });

  test("uses static previews for inactive unprepared track video slides", () => {
    expect(
      shouldUseFsStaticInactiveVideo({
        activeCanonicalIndex: 0,
        canonicalIndex: 1,
        lazyAllowed: false,
        lazyEnabled: false,
        liveReady: false,
      })
    ).toBe(true);

    expect(
      shouldUseFsStaticInactiveVideo({
        activeCanonicalIndex: 0,
        canonicalIndex: 1,
        lazyAllowed: false,
        lazyEnabled: true,
        liveReady: false,
      })
    ).toBe(true);

    const slides = renderFullscreenSlides({
      items: [
        { kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any,
        { kind: "video", src: "https://example.com/bravo.mp4", poster: "https://example.com/bravo.jpg" } as any,
      ],
      plyrList: [
        {} as any,
        {
          source: {
            type: "video",
            poster: "https://example.com/bravo.jpg",
            sources: [{ src: "https://example.com/bravo.mp4", type: "video/mp4" }],
          },
          options: {},
        } as any,
      ],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>(), React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsLazy: { videos: { enabled: true } },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      videoSnapshotStore: createEmptyVideoSnapshotStore(),
      canonicalLength: 2,
      activeCanonicalIndex: 0,
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-video-snapshot="true"');
    expect(markup).not.toContain('data-rmg-video-spinner');
    expect(markup).not.toContain('data-rmg-live-video="true"');
  });

  test("keeps allowed inactive lazy track video slides live", () => {
    expect(
      shouldUseFsStaticInactiveVideo({
        activeCanonicalIndex: 0,
        canonicalIndex: 1,
        lazyAllowed: true,
        lazyEnabled: true,
        liveReady: false,
      })
    ).toBe(false);

    const slides = renderFullscreenSlides({
      items: [
        { kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any,
        { kind: "video", src: "https://example.com/bravo.mp4", poster: "https://example.com/bravo.jpg" } as any,
      ],
      plyrList: [
        {} as any,
        {
          source: {
            type: "video",
            poster: "https://example.com/bravo.jpg",
            sources: [{ src: "https://example.com/bravo.mp4", type: "video/mp4" }],
          },
          options: {},
        } as any,
      ],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>(), React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsLazy: { videos: { enabled: true } },
      fsLazyAllowedVideosRef: { current: new Set([1]) },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      videoSnapshotStore: createEmptyVideoSnapshotStore(),
      canonicalLength: 2,
      activeCanonicalIndex: 0,
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-live-video="true"');
  });

  test("keeps ready inactive lazy track video slides live", () => {
    expect(
      shouldUseFsStaticInactiveVideo({
        activeCanonicalIndex: 0,
        canonicalIndex: 1,
        lazyAllowed: false,
        lazyEnabled: true,
        liveReady: true,
      })
    ).toBe(false);

    const slides = renderFullscreenSlides({
      items: [
        { kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any,
        { kind: "video", src: "https://example.com/bravo.mp4", poster: "https://example.com/bravo.jpg" } as any,
      ],
      plyrList: [
        {} as any,
        {
          source: {
            type: "video",
            poster: "https://example.com/bravo.jpg",
            sources: [{ src: "https://example.com/bravo.mp4", type: "video/mp4" }],
          },
          options: {},
        } as any,
      ],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>(), React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      resolveFsCaptionPlacement: () => null,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsLazy: { videos: { enabled: true } },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set(["video:https://example.com/bravo.mp4"]) },
      videoSnapshotStore: createEmptyVideoSnapshotStore(),
      canonicalLength: 2,
      activeCanonicalIndex: 0,
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-live-video="true"');
  });

  test("applies caption zoom fade styles to slide captions", () => {
    const renderCaption = vi.fn(({ index, isZoomed }: { index: number; isZoomed: boolean }) => (
      <span>{`${index}-${String(isZoomed)}`}</span>
    ));
    const captionZoomMotion = buildFullscreenCaptionZoomMotion({
      phase: "hiding",
      isZoomed: true,
      settings: resolveFullscreenCaptionZoomSettings({
        zoomInTransform: "translateY(14px)",
      }),
    });

    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: true,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      renderCaption,
      captionZoomMotion,
      fsCaptionLayout: "slide",
      resolveFsCaptionPlacement: () => "bottom",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(renderCaption).toHaveBeenCalledWith(
      expect.objectContaining({
        index: 0,
        isZoomed: true,
      })
    );
    expect(markup).toContain('data-rmg-fs-caption="true"');
    expect(markup).toContain('data-rmg-fs-caption-content="true"');
    expect(markup).toContain("opacity:0");
    expect(markup).toContain("translateY(14px)");
    expect(markup).toContain("pointer-events:none");
  });

  test("resolves viewport-relative caption widths for slide layouts", () => {
    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      renderCaption: () => <span>Caption</span>,
      fsCaptionLayout: "slide",
      fsCaptionWidth: "50%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "right",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain('data-rmg-zoom-pan-root="true"');
    expect(markup).toContain("flex:0 0 720px");
    expect(markup).toContain("width:720px");
    expect(markup).toContain("width:calc(100% - 720px)");
  });

  test("resolves viewport-relative caption heights for slide layouts", () => {
    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      renderCaption: () => <span>Caption</span>,
      fsCaptionLayout: "slide",
      fsCaptionHeight: "25%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "bottom",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("height:225px");
    expect(markup).toContain("height:calc(100% - 225px)");
  });

  test("reserves media width for entries overlays with explicit side widths", () => {
    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      fsViewportOverlayPlacement: "right",
      fsViewportOverlayWidth: "50%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "right",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("flex-direction:row");
    expect(markup).toContain("flex:0 0 720px");
    expect(markup).toContain("width:calc(100% - 720px)");
  });

  test("reserves media height for entries overlays with explicit top and bottom heights", () => {
    const slides = renderFullscreenSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      plyrList: [],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      playerRefs: { current: [] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      defaultPlayerStyle: {},
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      fsViewportOverlayPlacement: "bottom",
      fsViewportOverlayHeight: "25%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "bottom",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      fsDecodedImagesRef: { current: new Set() },
      fsCustomDecodedImagesRef: { current: new Set() },
      fsCustomResolvedSrcByKeyRef: { current: new Map() },
      fsPreparedVideosRef: { current: new Set() },
      getMediaKey: (item) => String((item as any).src ?? ""),
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("flex-direction:column");
    expect(markup).toContain("height:calc(100% - 225px)");
  });

  test("base renderer reserves media width for entries overlays with explicit side widths", () => {
    const slides = renderFullscreenBaseSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      fsViewportOverlayPlacement: {
        xs: "bottom",
        lg: "right",
      },
      fsViewportOverlayWidth: {
        lg: "32%",
        xl: "28%",
      },
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "right",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      canonicalLength: 1,
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("flex-direction:row");
    expect(markup).toContain("flex:0 0 460.8px");
    expect(markup).toContain("width:calc(100% - 460.8px)");
  });

  test("base renderer prioritizes only the active image and suppresses neighbor painting during open", () => {
    const items = [
      { kind: "image", src: "https://example.com/a.jpg", alt: "A" },
      { kind: "image", src: "https://example.com/b.jpg", alt: "B" },
      { kind: "image", src: "https://example.com/c.jpg", alt: "C" },
    ] as any[];
    const slides = renderFullscreenBaseSlides({
      items,
      getTransform: (index: number) => `translateX(${index * 100}%)`,
      imageRefs: {
        current: items.map(() => React.createRef<HTMLDivElement>()),
      },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: false,
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      viewportWidth: 1440,
      viewportHeight: 900,
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      canonicalLength: 3,
      activeCanonicalIndex: 1,
      openingCanonicalIndex: 1,
      openingInProgress: true,
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup.match(/<img[^>]*fetchPriority="high"/g)).toHaveLength(1);
    expect(markup.match(/loading="eager"/g)).toHaveLength(1);
    expect(
      markup.match(/data-rmg-fs-opening-suspended="true"/g)
    ).toHaveLength(2);
    expect(markup).toContain("content-visibility:hidden");
  });

  test("base renderer reserves media height for entries overlays with explicit top and bottom heights", () => {
    const slides = renderFullscreenBaseSlides({
      items: [{ kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any],
      getTransform: () => "translateX(0%)",
      imageRefs: { current: [React.createRef<HTMLDivElement>()] },
      cells: { current: [] },
      isZoomed: false,
      showFullscreenSlider: true,
      onPanPointerDown: () => undefined,
      onSuppressNextClickCapture: () => undefined,
      fsViewportOverlayPlacement: "bottom",
      fsViewportOverlayHeight: "25%",
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => "bottom",
      styles: {
        imgMargin: "imgMargin",
        fullscreenImages: "fullscreenImages",
      },
      canonicalLength: 1,
    });

    const markup = renderToStaticMarkup(<>{slides}</>);

    expect(markup).toContain('data-rmg-fs-media-viewport="true"');
    expect(markup).toContain("flex-direction:column");
    expect(markup).toContain("flex:0 0 225px");
    expect(markup).toContain("height:calc(100% - 225px)");
  });
});
