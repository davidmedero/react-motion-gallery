// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from "vitest";

import { runFullscreenIntro } from "./fullscreenIntro";
import {
  beginFullscreenDialogSwitch,
  finishFullscreenDialogSwitch,
  resetFullscreenDialogSwitchForTests,
} from "./dialogSwitch";

function rect(
  left: number,
  top: number,
  width: number,
  height: number
): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

async function flushAnimationFrame() {
  vi.advanceTimersByTime(16);
  await Promise.resolve();
}

async function flushTransitionWarm() {
  vi.advanceTimersByTime(50);
  await Promise.resolve();
  await Promise.resolve();
}

describe("fullscreen scale intro", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    resetFullscreenDialogSwitchForTests();
    document.body.innerHTML = "";
  });

  test("keeps the scale path above the former device-pixel cutoff and uses mounted target dimensions", async () => {
    vi.useFakeTimers();

    let rafNow = 0;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    vi.stubGlobal("devicePixelRatio", 5);
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    const originalImage = document.createElement("img");
    originalImage.setAttribute("data-rmg-test", "origin");
    originalImage.src = "/thumb.jpg";
    Object.defineProperty(originalImage, "currentSrc", {
      configurable: true,
      value: "/selected-thumb.jpg",
    });
    originalImage.style.objectFit = "contain";
    originalImage.style.objectPosition = "50% 50%";
    Object.defineProperty(originalImage, "naturalWidth", {
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(originalImage, "naturalHeight", {
      configurable: true,
      value: 1200,
    });
    document.body.appendChild(originalImage);

    const fullscreenRoot = document.createElement("div");
    const targetSlide = document.createElement("div");
    targetSlide.setAttribute("data-rmg-fs-slide", "true");
    targetSlide.setAttribute("data-rmg-canonical-idx", "0");
    targetSlide.setAttribute("data-rmg-clone", "false");

    const targetMedia = document.createElement("div");
    targetMedia.setAttribute("data-rmg-fs-media", "true");

    const targetImage = document.createElement("img");
    targetImage.setAttribute("data-rmg-test", "target");
    targetImage.setAttribute("width", "1200");
    targetImage.setAttribute("height", "1200");
    targetImage.style.objectFit = "contain";
    targetImage.style.objectPosition = "50% 50%";
    Object.defineProperty(targetImage, "naturalWidth", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(targetImage, "naturalHeight", {
      configurable: true,
      value: 0,
    });

    targetMedia.appendChild(targetImage);
    targetSlide.appendChild(targetMedia);
    fullscreenRoot.appendChild(targetSlide);
    document.body.appendChild(fullscreenRoot);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const testId = this.getAttribute("data-rmg-test");
      if (testId === "origin") return rect(10, 20, 100, 100);
      if (testId === "target") return rect(100, 150, 400, 400);
      return rect(0, 0, 1000, 700);
    });

    const duplicateImgRef = { current: null as HTMLElement | null };

    runFullscreenIntro({
      originalImage,
      method: "scale",
      index: 0,
      normalizedItems: [
        {
          kind: "image",
          src: "/full.jpg",
          alt: "Full",
          width: 1200,
          height: 1200,
        },
      ],
      styles: {
        fullscreenOverlay: "fullscreenOverlay",
        fsOverlayCaption: "fsOverlayCaption",
        open: "open",
      },
      fs: {
        enabled: true,
        effects: {
          introDuration: { transform: 360, fade: 180 },
          introEasing: "linear",
        },
      } as any,
      overlayDivRef: { current: null },
      duplicateImgRef,
      overlayCaptionRef: { current: null },
      overlayCaptionRootRef: { current: null },
      setShowFullscreenSlider: vi.fn(),
      setFsFadeOpening: vi.fn(),
      addShield: vi.fn(),
      resolveFsCaptionPlacement: () => null,
      baseZ: 1200,
      fullscreenRootRef: { current: fullscreenRoot },
    });

    await Promise.resolve();
    await flushTransitionWarm();
    await flushAnimationFrame();
    await flushAnimationFrame();
    await flushAnimationFrame();

    const proxy = duplicateImgRef.current;
    const proxyImage = proxy?.querySelector<HTMLImageElement>(
      '[data-rmg-fs-intro-proxy-image="true"]'
    );

    expect(proxy?.dataset.rmgFsIntroProxy).toBe("true");
    expect(proxy?.style.transform).toContain(
      "translate3d(300px, 350px, 0)"
    );
    expect(proxy?.style.transform).not.toContain(
      "translate3d(500px, 350px, 0)"
    );
    expect(proxy?.style.transition).toBe("transform 360ms linear");
    expect(proxy?.style.zIndex).toBe("1210");
    expect(proxy?.parentElement?.style.zIndex).toBe("1210");
    expect(proxyImage?.getAttribute("src")).toBe("/selected-thumb.jpg");
    expect(proxyImage?.src).not.toContain("/full.jpg");
    expect(proxyImage?.style.width).toBe("250px");
    expect(proxyImage?.style.height).toBe("250px");
    expect(proxyImage?.style.transform).toBe("scale(1.6)");
    expect(proxyImage?.style.transition).toBe("none");
    expect(proxyImage?.style.willChange).toBe("");
    const cropper = proxy?.closest<HTMLElement>(
      '[data-rmg-fs-intro-cropper="true"]'
    );
    expect(cropper).not.toBeNull();
    expect(cropper?.style.clipPath).toBe("");
    expect(cropper?.querySelector('[style*="clip-path"]')).toBeNull();
  });

  test("does not treat rendered target image dimensions as intrinsic dimensions", async () => {
    vi.useFakeTimers();

    let rafNow = 0;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    const originalImage = document.createElement("img");
    originalImage.setAttribute("data-rmg-test", "origin");
    originalImage.src = "/thumb.jpg";
    originalImage.style.objectFit = "cover";
    Object.defineProperty(originalImage, "naturalWidth", {
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(originalImage, "naturalHeight", {
      configurable: true,
      value: 900,
    });
    document.body.appendChild(originalImage);

    const fullscreenRoot = document.createElement("div");
    const dialogMedia = document.createElement("div");
    dialogMedia.setAttribute("data-rmg-fs-dialog-media", "true");

    const targetSlide = document.createElement("div");
    targetSlide.setAttribute("data-rmg-fs-slide", "true");
    targetSlide.setAttribute("data-rmg-canonical-idx", "0");
    targetSlide.setAttribute("data-rmg-clone", "false");

    const targetMedia = document.createElement("div");
    targetMedia.setAttribute("data-rmg-fs-media", "true");

    const targetImage = document.createElement("img");
    targetImage.setAttribute("data-rmg-test", "target");
    targetImage.style.objectFit = "contain";
    targetImage.style.objectPosition = "50% 50%";
    Object.defineProperty(targetImage, "naturalWidth", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(targetImage, "naturalHeight", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(targetImage, "width", {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(targetImage, "height", {
      configurable: true,
      value: 600,
    });

    targetMedia.appendChild(targetImage);
    targetSlide.appendChild(targetMedia);
    dialogMedia.appendChild(targetSlide);
    fullscreenRoot.appendChild(dialogMedia);
    document.body.appendChild(fullscreenRoot);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const testId = this.getAttribute("data-rmg-test");
      if (testId === "origin") return rect(10, 20, 120, 90);
      if (testId === "target") return rect(100, 150, 400, 600);
      if (this === dialogMedia) return rect(100, 150, 400, 600);
      return rect(0, 0, 1000, 700);
    });

    const duplicateImgRef = { current: null as HTMLElement | null };

    runFullscreenIntro({
      originalImage,
      method: "scale",
      index: 0,
      normalizedItems: [
        {
          kind: "image",
          src: "/full.jpg",
          alt: "Full",
        },
      ],
      styles: {
        fullscreenOverlay: "fullscreenOverlay",
        fsOverlayCaption: "fsOverlayCaption",
        open: "open",
      },
      fs: {
        enabled: true,
        dialog: {},
        effects: {
          introDuration: { transform: 360, fade: 180 },
          introEasing: "linear",
        },
      } as any,
      overlayDivRef: { current: null },
      duplicateImgRef,
      overlayCaptionRef: { current: null },
      overlayCaptionRootRef: { current: null },
      setShowFullscreenSlider: vi.fn(),
      setFsFadeOpening: vi.fn(),
      addShield: vi.fn(),
      resolveFsCaptionPlacement: () => null,
      baseZ: 1200,
      fullscreenRootRef: { current: fullscreenRoot },
    });

    await Promise.resolve();
    vi.advanceTimersByTime(128);
    await Promise.resolve();
    await flushTransitionWarm();
    await flushAnimationFrame();
    await flushAnimationFrame();
    await flushAnimationFrame();

    const proxy = duplicateImgRef.current;
    const proxyImage = proxy?.querySelector<HTMLImageElement>(
      '[data-rmg-fs-intro-proxy-image="true"]'
    );

    expect(proxy?.style.width).toBe("600px");
    expect(proxy?.style.height).toBe("450px");
    expect(proxy?.style.transform).toContain(
      "scale(0.6666666666666666)"
    );
    expect(proxyImage?.style.width).toBe("250px");
    expect(proxyImage?.style.height).toBe("187.5px");
    expect(proxyImage?.style.transform).toBe("scale(2.4)");
    expect(proxyImage?.style.transition).toBe("none");
  });

  test("completes from the outer proxy and hands off to the ready fullscreen image", async () => {
    vi.useFakeTimers();

    let rafNow = 0;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    const originalImage = document.createElement("img");
    originalImage.setAttribute("data-rmg-test", "origin");
    originalImage.src = "/thumb.jpg";
    originalImage.style.objectFit = "cover";
    Object.defineProperty(originalImage, "naturalWidth", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(originalImage, "naturalHeight", {
      configurable: true,
      value: 600,
    });
    document.body.appendChild(originalImage);

    const fullscreenRoot = document.createElement("div");
    const targetSlide = document.createElement("div");
    targetSlide.setAttribute("data-rmg-fs-slide", "true");
    targetSlide.setAttribute("data-rmg-canonical-idx", "0");
    targetSlide.setAttribute("data-rmg-clone", "false");

    const targetMedia = document.createElement("div");
    targetMedia.setAttribute("data-rmg-fs-media", "true");

    const targetImage = document.createElement("img");
    targetImage.setAttribute("data-rmg-test", "target");
    targetImage.src = "/full.jpg";
    targetImage.style.objectFit = "contain";
    targetImage.style.objectPosition = "50% 50%";
    Object.defineProperty(targetImage, "complete", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(targetImage, "naturalWidth", {
      configurable: true,
      value: 1600,
    });
    Object.defineProperty(targetImage, "naturalHeight", {
      configurable: true,
      value: 1200,
    });
    targetImage.decode = vi.fn(() => Promise.resolve());

    targetMedia.appendChild(targetImage);
    targetSlide.appendChild(targetMedia);
    fullscreenRoot.appendChild(targetSlide);
    document.body.appendChild(fullscreenRoot);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      const testId = this.getAttribute("data-rmg-test");
      if (testId === "origin") return rect(20, 30, 160, 120);
      if (testId === "target") return rect(100, 80, 800, 600);
      return rect(0, 0, 1000, 700);
    });

    const duplicateImgRef = { current: null as HTMLElement | null };
    const setShowFullscreenSlider = vi.fn();

    runFullscreenIntro({
      originalImage,
      method: "scale",
      index: 0,
      normalizedItems: [
        {
          kind: "image",
          src: "/full.jpg",
          alt: "Full",
          width: 1600,
          height: 1200,
        },
      ],
      styles: {
        fullscreenOverlay: "fullscreenOverlay",
        fsOverlayCaption: "fsOverlayCaption",
        open: "open",
      },
      fs: {
        enabled: true,
        effects: {
          introDuration: { transform: 360, fade: 180 },
          introEasing: "linear",
        },
      } as any,
      overlayDivRef: { current: null },
      duplicateImgRef,
      overlayCaptionRef: { current: null },
      overlayCaptionRootRef: { current: null },
      setShowFullscreenSlider,
      setFsFadeOpening: vi.fn(),
      addShield: vi.fn(),
      resolveFsCaptionPlacement: () => null,
      baseZ: 1200,
      fullscreenRootRef: { current: fullscreenRoot },
    });

    await Promise.resolve();
    await flushTransitionWarm();

    const proxy = duplicateImgRef.current;
    const proxyImage = proxy?.querySelector<HTMLImageElement>(
      '[data-rmg-fs-intro-proxy-image="true"]'
    );
    const cropper = proxy?.closest<HTMLElement>(
      '[data-rmg-fs-intro-cropper="true"]'
    );
    const startTransform = proxy?.style.transform;
    const innerTransform = proxyImage?.style.transform;

    await flushAnimationFrame();
    await flushAnimationFrame();
    await flushAnimationFrame();

    expect(proxy?.style.transform).not.toBe(startTransform);
    expect(proxyImage?.style.transform).toBe(innerTransform);
    expect(proxy?.style.transition).toBe("transform 360ms linear");
    expect(proxyImage?.style.transition).toBe("none");

    const transitionEnd = new Event("transitionend", { bubbles: true });
    Object.defineProperty(transitionEnd, "propertyName", {
      configurable: true,
      value: "transform",
    });
    proxy?.dispatchEvent(transitionEnd);
    await Promise.resolve();

    await flushAnimationFrame();
    await flushAnimationFrame();
    expect(setShowFullscreenSlider).toHaveBeenCalledWith(true);
    expect(proxy?.isConnected).toBe(true);

    await Promise.resolve();
    for (let frame = 0; frame < 6; frame += 1) {
      await flushAnimationFrame();
    }
    await Promise.resolve();

    expect(targetImage.decode).toHaveBeenCalledTimes(1);
    expect(cropper?.isConnected).toBe(false);
    expect(proxy?.isConnected).toBe(false);
    expect(proxyImage?.isConnected).toBe(false);
    expect(duplicateImgRef.current).toBeNull();
  });

  test("shows a pending spinner until the scale intro starts", async () => {
    vi.useFakeTimers();

    let rafNow = 0;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    const originalImage = document.createElement("img");
    originalImage.src = "/thumb.jpg";
    originalImage.style.objectFit = "cover";
    Object.defineProperty(originalImage, "naturalWidth", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(originalImage, "naturalHeight", {
      configurable: true,
      value: 600,
    });
    document.body.appendChild(originalImage);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      if (this === originalImage) return rect(10, 20, 120, 90);
      return rect(0, 0, 1000, 700);
    });

    runFullscreenIntro({
      originalImage,
      method: "scale",
      index: 0,
      normalizedItems: [
        {
          kind: "image",
          src: "/full.jpg",
          alt: "Full",
          width: 800,
          height: 600,
        },
      ],
      styles: {
        fullscreenOverlay: "fullscreenOverlay",
        fsOverlayCaption: "fsOverlayCaption",
        open: "open",
        spinner: "spinner",
      },
      fs: {
        enabled: true,
        lazyLoad: {
          images: {
            enabled: true,
          },
        },
        effects: {
          introDuration: { transform: 360, fade: 180 },
          introEasing: "linear",
        },
      } as any,
      overlayDivRef: { current: null },
      duplicateImgRef: { current: null },
      overlayCaptionRef: { current: null },
      overlayCaptionRootRef: { current: null },
      setShowFullscreenSlider: vi.fn(),
      setFsFadeOpening: vi.fn(),
      addShield: vi.fn(),
      resolveFsCaptionPlacement: () => null,
      baseZ: 1200,
      fullscreenRootRef: { current: null },
    });

    const spinner = document.querySelector<HTMLElement>(
      '[data-rmg-fs-intro-spinner="true"]'
    );
    const layer = document.querySelector<HTMLElement>(
      '[data-rmg-fs-intro-spinner-layer="true"]'
    );
    expect(spinner).not.toBeNull();
    expect(layer).not.toBeNull();
    expect(spinner?.parentElement).toBe(layer);
    expect(layer?.style.opacity).toBe("1");
    expect(layer?.style.visibility).toBe("visible");
    expect(layer?.style.zIndex).toBe("2147483647");
    expect(spinner?.style.opacity).toBe("1");
    expect(spinner?.style.visibility).toBe("visible");

    vi.advanceTimersByTime(140);
    await Promise.resolve();
    await flushTransitionWarm();
    await flushAnimationFrame();

    expect(layer?.style.opacity).toBe("0");
    expect(spinner?.style.opacity).toBe("1");

    vi.advanceTimersByTime(380);
    expect(
      document.querySelector('[data-rmg-fs-intro-spinner="true"]')
    ).toBeNull();
    expect(
      document.querySelector('[data-rmg-fs-intro-spinner-layer="true"]')
    ).toBeNull();
  });

  test("skips the pending spinner when the mounted fullscreen image is already ready", () => {
    vi.useFakeTimers();

    let rafNow = 0;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 700,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => {
          rafNow += 16;
          callback(rafNow);
        }, 16),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });

    const originalImage = document.createElement("img");
    originalImage.src = "/thumb.jpg";
    originalImage.style.objectFit = "cover";
    Object.defineProperty(originalImage, "naturalWidth", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(originalImage, "naturalHeight", {
      configurable: true,
      value: 600,
    });
    document.body.appendChild(originalImage);

    const fullscreenRoot = document.createElement("div");
    const slide = document.createElement("div");
    slide.setAttribute("data-rmg-fs-slide", "true");
    slide.setAttribute("data-rmg-canonical-idx", "0");
    slide.setAttribute("data-rmg-clone", "false");

    const media = document.createElement("div");
    media.setAttribute("data-rmg-fs-media", "true");

    const fullscreenImage = document.createElement("img");
    fullscreenImage.src = "/full.jpg";
    Object.defineProperty(fullscreenImage, "complete", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(fullscreenImage, "naturalWidth", {
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(fullscreenImage, "naturalHeight", {
      configurable: true,
      value: 800,
    });

    media.appendChild(fullscreenImage);
    slide.appendChild(media);
    fullscreenRoot.appendChild(slide);
    document.body.appendChild(fullscreenRoot);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      if (this === originalImage) return rect(10, 20, 120, 90);
      if (this === fullscreenImage) return rect(100, 80, 700, 520);
      return rect(0, 0, 1000, 700);
    });

    runFullscreenIntro({
      originalImage,
      method: "scale",
      index: 0,
      normalizedItems: [
        {
          kind: "image",
          src: "/full.jpg",
          alt: "Full",
          width: 1200,
          height: 800,
        },
      ],
      styles: {
        fullscreenOverlay: "fullscreenOverlay",
        fsOverlayCaption: "fsOverlayCaption",
        open: "open",
        spinner: "spinner",
      },
      fs: {
        enabled: true,
        lazyLoad: {
          images: {
            enabled: true,
          },
        },
        effects: {
          introDuration: { transform: 360, fade: 180 },
          introEasing: "linear",
        },
      } as any,
      overlayDivRef: { current: null },
      duplicateImgRef: { current: null },
      overlayCaptionRef: { current: null },
      overlayCaptionRootRef: { current: null },
      setShowFullscreenSlider: vi.fn(),
      setFsFadeOpening: vi.fn(),
      addShield: vi.fn(),
      resolveFsCaptionPlacement: () => null,
      baseZ: 1200,
      fullscreenRootRef: { current: fullscreenRoot },
    });

    expect(
      document.querySelector('[data-rmg-fs-intro-spinner="true"]')
    ).toBeNull();
    expect(
      document.querySelector('[data-rmg-fs-intro-spinner-layer="true"]')
    ).toBeNull();
  });

  test("dialog switch intro reuses the active overlay without mutating it", () => {
    const overlay = document.createElement("div");
    overlay.className = "fullscreenOverlay";
    overlay.style.opacity = "0.72";
    overlay.style.transition = "opacity 999ms linear";
    overlay.style.pointerEvents = "none";
    document.body.appendChild(overlay);

    const switchState = beginFullscreenDialogSwitch({
      overlay,
      durationMs: 180,
      easing: "linear",
    });
    const overlayDivRef = { current: null as HTMLDivElement | null };
    const setShowFullscreenSlider = vi.fn();
    const setFsFadeOpening = vi.fn();
    const onDialogSwitchClaim = vi.fn();
    const addShield = vi.fn();

    runFullscreenIntro({
      originalImage: null,
      method: "fade",
      index: 0,
      normalizedItems: [
        {
          kind: "image",
          src: "/full.jpg",
          alt: "Full",
          width: 1200,
          height: 1200,
        },
      ],
      styles: {
        fullscreenOverlay: "fullscreenOverlay",
        fsOverlayCaption: "fsOverlayCaption",
        open: "open",
      },
      fs: {
        enabled: true,
        effects: {
          introDuration: { transform: 360, fade: 180 },
          introEasing: "linear",
        },
      } as any,
      overlayDivRef,
      duplicateImgRef: { current: null },
      overlayCaptionRef: { current: null },
      overlayCaptionRootRef: { current: null },
      setShowFullscreenSlider,
      setFsFadeOpening,
      onDialogSwitchClaim,
      addShield,
      resolveFsCaptionPlacement: () => null,
      baseZ: 1200,
      fullscreenRootRef: { current: null },
    });

    expect(overlayDivRef.current).toBe(overlay);
    expect(document.body.querySelectorAll(".fullscreenOverlay")).toHaveLength(1);
    expect(overlay.style.opacity).toBe("0.72");
    expect(overlay.style.transition).toBe("opacity 999ms linear");
    expect(overlay.style.pointerEvents).toBe("none");
    expect(addShield).not.toHaveBeenCalled();
    expect(onDialogSwitchClaim).toHaveBeenCalledWith(180);
    expect(setFsFadeOpening).toHaveBeenCalledWith(false);
    expect(setShowFullscreenSlider).toHaveBeenCalledWith(true);

    finishFullscreenDialogSwitch(switchState);
  });
});
