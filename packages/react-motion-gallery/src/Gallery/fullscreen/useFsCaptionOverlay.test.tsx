import * as React from "react";
import { Children } from "react";
import { describe, expect, test } from "vitest";

import {
  buildFullscreenCaptionZoomMotion,
  resolveFullscreenCaptionZoomSettings,
} from "./captionZoomMotion";
import type { FsCaptionRenderArgs } from "./types";
import {
  renderFsCaptionOverlayTree,
  resolveFsCaptionOverlayCrossfadeDurationMs,
  resolveFsCaptionOverlayCrossfadeEasing,
  resolveFsCaptionOverlayCrossfadeTarget,
} from "./useFsCaptionOverlay";

function createBaseArgs() {
  return {
    layers: [
      { key: 1, index: 0, opacity: 1 },
      { key: 2, index: 1, opacity: 0 },
    ],
    items: [
      { kind: "image", src: "https://example.com/alpha.jpg", alt: "Alpha" } as any,
      { kind: "image", src: "https://example.com/bravo.jpg", alt: "Bravo" } as any,
    ],
    caption: {
      layout: "overlay" as const,
      render: ({ item }: FsCaptionRenderArgs) => (
        <span>{"alt" in item ? item.alt : undefined}</span>
      ),
    },
    isZoomed: false,
    captionZoomMotion: buildFullscreenCaptionZoomMotion({
      phase: "visible",
      isZoomed: false,
      settings: resolveFullscreenCaptionZoomSettings(undefined),
    }),
    viewportWidth: 1280,
    viewportHeight: 720,
    fadeOutMs: 300,
    fadeOutEasing: "cubic-bezier(.4,0,.22,1)",
    resolveFsCaptionPlacement: () => "bottom" as const,
  };
}

describe("overlay caption crossfade rendering", () => {
  test("defaults overlay captions to content-only crossfades", () => {
    expect(resolveFsCaptionOverlayCrossfadeTarget(undefined)).toBe("content");
    expect(resolveFsCaptionOverlayCrossfadeDurationMs(undefined)).toBe(300);
    expect(resolveFsCaptionOverlayCrossfadeEasing(undefined)).toBe("cubic-bezier(.4,0,.22,1)");
    expect(
      resolveFsCaptionOverlayCrossfadeTarget({
        layout: "overlay",
        render: () => null,
      })
    ).toBe("content");
  });

  test("resolves overlay caption crossfade duration and easing", () => {
    expect(
      resolveFsCaptionOverlayCrossfadeDurationMs({
        overlayCrossfadeDurationMs: 520,
      })
    ).toBe(520);
    expect(
      resolveFsCaptionOverlayCrossfadeDurationMs({
        overlayCrossfadeDurationMs: -80,
      })
    ).toBe(0);
    expect(
      resolveFsCaptionOverlayCrossfadeEasing({
        overlayCrossfadeEasing: "linear",
      })
    ).toBe("linear");
  });

  test("renders one stable shell and one stable surface for content crossfades", () => {
    const tree = renderFsCaptionOverlayTree(createBaseArgs()) as React.ReactElement<any>;

    expect(tree.type).toBe("div");
    expect(tree.props["data-rmg-fs-caption"]).toBe("true");
    expect(tree.props["data-rmg-fs-caption-overlay"]).toBe("true");

    const surface = tree.props.children as React.ReactElement<any>;
    expect(surface.props["data-rmg-fs-caption-surface"]).toBe("true");

    const stableCaptionRoot = surface.props.children as React.ReactElement<any>;
    const stack = stableCaptionRoot.props.children as React.ReactElement<any>;
    const layers = Children.toArray(stack.props.children) as React.ReactElement<any>[];

    expect(stack.props.activeKey).toBe(2);
    expect(stack.props.activeReady).toBe(false);
    expect(stack.props.durationMs).toBe(300);
    expect(stack.props.easing).toBe("cubic-bezier(.4,0,.22,1)");
    expect(layers).toHaveLength(2);
    expect(layers.every((layer) => layer.props["data-rmg-fs-caption-content"] === "true")).toBe(
      true
    );
    expect(layers.map((layer) => layer.props["data-rmg-overlay-height-layer-key"])).toEqual([
      "1",
      "2",
    ]);
    expect(layers[1]?.props["data-rmg-overlay-height-active"]).toBe("true");
    expect(layers.map((layer) => layer.props.style.opacity)).toEqual([1, 0]);
    expect(layers[0]?.props.style.transition).toBe("opacity 300ms linear");
    expect(layers[1]?.props.style.transition).toBe("opacity 300ms linear");
    expect(layers[0]?.props.style.position).toBe("relative");
    expect(layers[0]?.props.style.zIndex).toBe(2);
    expect(layers[1]?.props.style.position).toBe("relative");
    expect(layers[1]?.props.style.zIndex).toBe(1);
  });

  test("renders overlay captions without zoom motion state", () => {
    const args: any = createBaseArgs();
    args.captionZoomMotion = undefined;

    const tree = renderFsCaptionOverlayTree(args) as React.ReactElement<any>;
    const surface = tree.props.children as React.ReactElement<any>;

    expect(tree.props["aria-hidden"]).toBeUndefined();
    expect(surface.props.style.transform).toBeUndefined();
    expect(surface.props.children).toBeTruthy();
  });

  test("keeps outgoing layout height until the incoming caption starts fading in", () => {
    const tree = renderFsCaptionOverlayTree({
      ...createBaseArgs(),
      layers: [
        { key: 1, index: 0, opacity: 0 },
        { key: 2, index: 1, opacity: 1 },
      ],
    }) as React.ReactElement<any>;

    const surface = tree.props.children as React.ReactElement<any>;
    const stableCaptionRoot = surface.props.children as React.ReactElement<any>;
    const stack = stableCaptionRoot.props.children as React.ReactElement<any>;
    const layers = Children.toArray(stack.props.children) as React.ReactElement<any>[];

    expect(stack.props.activeKey).toBe(2);
    expect(stack.props.activeReady).toBe(true);
    expect(layers.map((layer) => layer.props["data-rmg-overlay-height-layer-key"])).toEqual([
      "1",
      "2",
    ]);
    expect(layers[0]?.props.style.position).toBe("relative");
    expect(layers[0]?.props.style.zIndex).toBe(2);
    expect(layers[1]?.props.style.position).toBe("relative");
    expect(layers[1]?.props.style.zIndex).toBe(1);
  });

  test("keeps a stable rendered caption root and only crossfades its children in content mode", () => {
    const tree = renderFsCaptionOverlayTree({
      ...createBaseArgs(),
      caption: {
        layout: "overlay",
        overlayCrossfadeTarget: "content",
        render: ({ item }: FsCaptionRenderArgs) => (
          <div className="caption-shell" data-shell="true">
            <span>{"alt" in item ? item.alt : undefined}</span>
          </div>
        ),
      },
    }) as React.ReactElement<any>;

    const surface = tree.props.children as React.ReactElement<any>;
    const captionShell = surface.props.children as React.ReactElement<any>;

    expect(captionShell.props.className).toBe("caption-shell");
    expect(captionShell.props["data-shell"]).toBe("true");

    const stack = captionShell.props.children as React.ReactElement<any>;
    const layers = Children.toArray(stack.props.children) as React.ReactElement<any>[];

    expect(layers).toHaveLength(2);
    expect(layers[0]?.props.children.type).toBe("span");
    expect(layers[1]?.props.children.type).toBe("span");
  });

  test("keeps zoom fade styles on the stable surface in content mode", () => {
    const tree = renderFsCaptionOverlayTree({
      ...createBaseArgs(),
      captionZoomMotion: buildFullscreenCaptionZoomMotion({
        phase: "hiding",
        isZoomed: true,
        settings: resolveFullscreenCaptionZoomSettings({
          zoomInTransform: "translateY(14px)",
        }),
      }),
      isZoomed: true,
    }) as React.ReactElement<any>;

    const surface = tree.props.children as React.ReactElement<any>;
    const stableCaptionRoot = surface.props.children as React.ReactElement<any>;
    const stack = stableCaptionRoot.props.children as React.ReactElement<any>;
    const layers = Children.toArray(stack.props.children) as React.ReactElement<any>[];

    expect(surface.props.style.opacity).toBe(0);
    expect(surface.props.style.transform).toBe("translateY(14px)");
    expect(layers[0]?.props.style.transform).toBeUndefined();
    expect(layers[1]?.props.style.transform).toBeUndefined();
  });

  test("lets overlay mode crossfade whole overlay layers", () => {
    const tree = renderFsCaptionOverlayTree({
      ...createBaseArgs(),
      caption: {
        layout: "overlay",
        overlayCrossfadeTarget: "overlay",
        render: ({ item }: FsCaptionRenderArgs) => (
          <span>{"alt" in item ? item.alt : undefined}</span>
        ),
      },
    }) as React.ReactElement<any>;

    const shells = Children.toArray(tree.props.children) as React.ReactElement<any>[];

    expect(shells).toHaveLength(2);
    expect(shells.every((shell) => shell.props["data-rmg-fs-caption"] === "true")).toBe(true);
    expect(shells.map((shell) => String(shell.props.style.opacity))).toEqual([
      "calc(var(--rmg-fs-caption-overlay-opacity, 1) * 1)",
      "calc(var(--rmg-fs-caption-overlay-opacity, 1) * 0)",
    ]);

    const surfaces = shells.map((shell) => shell.props.children as React.ReactElement<any>);
    expect(surfaces.every((surface) => surface.props["data-rmg-fs-caption-surface"] === "true")).toBe(
      true
    );
    expect(
      surfaces.every(
        (surface) => surface.props.children.props["data-rmg-fs-caption-content"] === "true"
      )
    ).toBe(true);
  });
});
