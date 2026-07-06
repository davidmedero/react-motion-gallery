// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { renderFullscreenSlides } from "./renderFullscreenSlides";

type Mounted = {
  container: HTMLDivElement;
  root: Root;
};

const items = [
  {
    kind: "image",
    src: "https://example.com/alpha.png",
    alt: "Alpha",
  },
  {
    kind: "image",
    src: "https://example.com/bravo.png",
    alt: "Bravo",
  },
] as any[];

function createSlides(args: {
  renderImage?: Parameters<typeof renderFullscreenSlides>[0]["renderImage"];
}) {
  return renderFullscreenSlides({
    items,
    plyrList: [],
    getTransform: (index) => `translateX(${index * 100}%)`,
    imageRefs: { current: [React.createRef<HTMLDivElement>(), React.createRef<HTMLDivElement>()] },
    playerRefs: { current: [] },
    cells: { current: [] },
    isZoomed: false,
    showFullscreenSlider: true,
    defaultPlayerStyle: {},
    onPanPointerDown: () => undefined,
    onSuppressNextClickCapture: () => undefined,
    renderImage: args.renderImage,
    resolveFsCaptionPlacement: () => null,
    styles: {
      imgMargin: "imgMargin",
      fullscreenImages: "fullscreenImages",
    },
    fsLazy: { images: { enabled: true } },
    fsLazyAllowedImagesRef: { current: new Set([1]) },
    fsDecodedImagesRef: { current: new Set() },
    fsCustomDecodedImagesRef: { current: new Set() },
    fsCustomResolvedSrcByKeyRef: { current: new Map() },
    fsPreparedVideosRef: { current: new Set() },
    canonicalLength: 2,
    activeCanonicalIndex: 1,
    getMediaKey: (item) => String((item as any).src ?? ""),
  });
}

function mountSlides(args: {
  renderImage?: Parameters<typeof renderFullscreenSlides>[0]["renderImage"];
} = {}): Mounted {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  React.act(() => {
    root.render(<>{createSlides(args)}</>);
  });

  return { container, root };
}

function unmount(mounted: Mounted) {
  React.act(() => {
    mounted.root.unmount();
  });
  mounted.container.remove();
}

function imageSpinnerForCanonical(container: HTMLElement, index: number) {
  const slide = container.querySelector(
    `[data-rmg-fs-slide="true"][data-rmg-canonical-idx="${index}"]`
  );

  return slide?.querySelector(
    "[data-rmg-image-spinner]"
  ) as HTMLElement | null;
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

  window.requestAnimationFrame ??= ((cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(performance.now()), 0)) as any;
  window.cancelAnimationFrame ??= ((id: number) =>
    window.clearTimeout(id)) as any;
});

afterEach(() => {
  document.body.innerHTML = "";
});

afterAll(() => {
  delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
});

describe("fullscreen lazy spinner visibility", () => {
  test("hides inactive default image spinners while preserving the active image spinner", () => {
    const mounted = mountSlides();

    const inactiveSpinner = imageSpinnerForCanonical(mounted.container, 0);
    const activeSpinner = imageSpinnerForCanonical(mounted.container, 1);

    expect(inactiveSpinner).not.toBeNull();
    expect(activeSpinner).not.toBeNull();
    expect(inactiveSpinner?.style.opacity).toBe("0");
    expect(inactiveSpinner?.style.visibility).toBe("hidden");
    expect(activeSpinner?.style.opacity).toBe("1");
    expect(activeSpinner?.style.visibility).toBe("visible");

    unmount(mounted);
  });

  test("hides inactive custom image spinners while preserving the active image spinner", () => {
    const mounted = mountSlides({
      renderImage: ({ item, className, baseStyle }) => (
        <img
          alt={item.alt ?? ""}
          className={className}
          src={(item as any).src}
          style={baseStyle}
        />
      ),
    });

    const inactiveSpinner = imageSpinnerForCanonical(mounted.container, 0);
    const activeSpinner = imageSpinnerForCanonical(mounted.container, 1);

    expect(inactiveSpinner).not.toBeNull();
    expect(activeSpinner).not.toBeNull();
    expect(inactiveSpinner?.style.opacity).toBe("0");
    expect(inactiveSpinner?.style.visibility).toBe("hidden");
    expect(activeSpinner?.style.opacity).toBe("1");
    expect(activeSpinner?.style.visibility).toBe("visible");

    unmount(mounted);
  });
});
