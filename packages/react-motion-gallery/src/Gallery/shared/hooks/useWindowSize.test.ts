import { afterEach, describe, expect, test, vi } from "vitest";

import { readWindowSize } from "./useWindowSize";

describe("readWindowSize", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("uses window.innerWidth so fullscreen breakpoints are not shifted by scrollbars", () => {
    vi.stubGlobal("window", {
      innerWidth: 1214,
      innerHeight: 720,
    } as any);
    vi.stubGlobal("document", {
      documentElement: {
        clientWidth: 1199,
      },
    } as any);

    expect(readWindowSize()).toEqual({
      width: 1214,
      height: 720,
    });
  });
});
