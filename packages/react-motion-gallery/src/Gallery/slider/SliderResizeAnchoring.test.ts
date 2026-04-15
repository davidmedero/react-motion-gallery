import { describe, expect, test } from "vitest";

import { buildSliderScrollSnaps } from "./layoutStability";
import { shouldReanchorSliderOnResize } from "./Slider";

function readSnapForIndex(args: {
  targets: number[];
  alignSizes: number[];
  viewport: number;
  index: number;
  centerAlign?: boolean;
}) {
  const { index, ...snapArgs } = args;
  return buildSliderScrollSnaps(snapArgs)[index];
}

describe("slider resize anchoring", () => {
  test("reanchors fixed-cell layouts after resize even when looping is off", () => {
    expect(
      shouldReanchorSliderOnResize({
        wrap: false,
        centerAlign: false,
        cellsPerSlide: 3,
      })
    ).toBe(true);

    const beforeResize = readSnapForIndex({
      targets: [0, 320, 640],
      alignSizes: [300, 300, 300],
      viewport: 960,
      index: 1,
    });
    const afterResize = readSnapForIndex({
      targets: [0, 240, 480],
      alignSizes: [220, 220, 220],
      viewport: 720,
      index: 1,
    });

    const clampedOldOffset = Math.max(
      Math.min(beforeResize, Math.max(0, -240, -480)),
      Math.min(0, -240, -480)
    );

    expect(beforeResize).toBe(-320);
    expect(afterResize).toBe(-240);
    expect(clampedOldOffset).toBe(-320);
    expect(clampedOldOffset).not.toBe(afterResize);
  });

  test("keeps looped layouts on index-based anchoring during resize", () => {
    expect(
      shouldReanchorSliderOnResize({
        wrap: true,
        centerAlign: false,
      })
    ).toBe(true);
  });

  test("keeps fixed-cell pages on the same slide across repeated resizes", () => {
    expect(
      shouldReanchorSliderOnResize({
        wrap: false,
        centerAlign: false,
        cellsPerSlide: 4,
      })
    ).toBe(true);

    const targetsByResize = [
      [0, 320, 640],
      [0, 240, 480],
      [0, 160, 320],
      [0, 320, 640],
    ];
    const alignSizesByResize = [
      [300, 300, 300],
      [220, 220, 220],
      [140, 140, 140],
      [300, 300, 300],
    ];
    const viewports = [960, 720, 480, 960];

    const positions = viewports.map((viewport, step) =>
      readSnapForIndex({
        targets: targetsByResize[step]!,
        alignSizes: alignSizesByResize[step]!,
        viewport,
        index: 1,
      })
    );

    expect(positions).toEqual([-320, -240, -160, -320]);
  });

  test("leaves non-loop freeform layouts on clamp-based resize behavior", () => {
    expect(
      shouldReanchorSliderOnResize({
        wrap: false,
        centerAlign: false,
      })
    ).toBe(false);
  });
});
