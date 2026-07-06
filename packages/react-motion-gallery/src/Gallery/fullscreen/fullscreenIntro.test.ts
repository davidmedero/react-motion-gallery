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

describe("fullscreen scale intro", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    resetFullscreenDialogSwitchForTests();
    document.body.innerHTML = "";
  });

  test("uses mounted target dimensions before natural image dimensions are available", async () => {
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
    await flushAnimationFrame();
    await flushAnimationFrame();

    expect(duplicateImgRef.current?.style.transform).toContain(
      "translate3d(300px, 350px, 0)"
    );
    expect(duplicateImgRef.current?.style.transform).not.toContain(
      "translate3d(500px, 350px, 0)"
    );
    expect(duplicateImgRef.current?.style.zIndex).toBe("1210");
    expect(duplicateImgRef.current?.parentElement?.style.zIndex).toBe("1210");
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
    vi.advanceTimersByTime(121);
    await Promise.resolve();
    await flushAnimationFrame();
    await flushAnimationFrame();
    await flushAnimationFrame();

    expect(duplicateImgRef.current?.style.width).toBe("600px");
    expect(duplicateImgRef.current?.style.height).toBe("450px");
    expect(duplicateImgRef.current?.style.transform).toContain(
      "scale(0.6666666666666666)"
    );
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
