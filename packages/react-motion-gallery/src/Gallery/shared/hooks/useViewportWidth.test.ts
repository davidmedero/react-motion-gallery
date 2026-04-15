import { afterEach, describe, expect, test, vi } from "vitest";

import { readViewportWidth } from "./useViewportWidth";

describe("readViewportWidth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("prefers window.innerWidth so JS breakpoints match CSS media queries", () => {
    vi.stubGlobal("window", {
      innerWidth: 514,
    } as any);
    vi.stubGlobal("document", {
      documentElement: {
        clientWidth: 499,
      },
    } as any);

    expect(readViewportWidth()).toBe(514);
  });

  test("falls back to documentElement.clientWidth when window.innerWidth is unavailable", () => {
    vi.stubGlobal("window", {
      innerWidth: 0,
    } as any);
    vi.stubGlobal("document", {
      documentElement: {
        clientWidth: 640,
      },
    } as any);

    expect(readViewportWidth()).toBe(640);
  });
});
