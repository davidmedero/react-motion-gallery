import { describe, expect, test } from "vitest";

import {
  shouldRebaseSliderVideoCloneAtOrigin,
  SLIDER_VIDEO_CLONE_ORIGIN_REBASE_THRESHOLD_PX,
} from "./videoCloneRebase";

describe("slider video clone origin rebase", () => {
  test("rebases first-slide clone vectors once they are within one pixel of the origin", () => {
    expect(
      shouldRebaseSliderVideoCloneAtOrigin({
        wrap: true,
        contentSize: 1000,
        location: -999,
        selectedIndex: 0,
      })
    ).toBe(true);

    expect(
      shouldRebaseSliderVideoCloneAtOrigin({
        wrap: true,
        contentSize: 1000,
        location: -998.9,
        selectedIndex: 0,
      })
    ).toBe(false);
  });

  test("uses the first snap as the loop origin", () => {
    expect(
      shouldRebaseSliderVideoCloneAtOrigin({
        wrap: true,
        contentSize: 1000,
        location: -970.5,
        origin: 30,
        selectedIndex: 0,
      })
    ).toBe(true);
  });

  test("stays scoped to wrapped first-slide candidates", () => {
    expect(
      shouldRebaseSliderVideoCloneAtOrigin({
        wrap: false,
        contentSize: 1000,
        location: -999,
        selectedIndex: 0,
      })
    ).toBe(false);

    expect(
      shouldRebaseSliderVideoCloneAtOrigin({
        wrap: true,
        contentSize: 1000,
        location: -999,
        selectedIndex: 1,
      })
    ).toBe(false);

    expect(SLIDER_VIDEO_CLONE_ORIGIN_REBASE_THRESHOLD_PX).toBe(1);
  });
});
