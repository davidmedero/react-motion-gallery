import { describe, expect, test } from "vitest";

import { resolveFullscreenDialogSwitchTransitionOptions } from "./dialogTransitionTiming";

describe("fullscreen dialog switch transition timing", () => {
  test("uses switch opacity timing before legacy dialog opacity timing", () => {
    const transition = resolveFullscreenDialogSwitchTransitionOptions({
      dialog: {
        opacityDuration: 360,
        opacityEasing: "ease-out",
        switchOpacityDuration: 140,
        switchOpacityEasing: "linear",
      },
      effects: {
        introDuration: { fade: 500 },
        introEasing: "ease-in",
      },
    });

    expect(transition).toEqual({
      durationMs: 140,
      easing: "linear",
    });
  });

  test("uses per-call transition options before switch opacity timing", () => {
    const transition = resolveFullscreenDialogSwitchTransitionOptions({
      options: {
        durationMs: 80,
        easing: "cubic-bezier(.2,.7,.2,1)",
      },
      dialog: {
        opacityDuration: 360,
        opacityEasing: "ease-out",
        switchOpacityDuration: 140,
        switchOpacityEasing: "linear",
      },
      effects: {
        introDuration: { fade: 500 },
        introEasing: "ease-in",
      },
    });

    expect(transition).toEqual({
      durationMs: 80,
      easing: "cubic-bezier(.2,.7,.2,1)",
    });
  });

  test("falls back to legacy dialog opacity timing when switch timing is omitted", () => {
    const transition = resolveFullscreenDialogSwitchTransitionOptions({
      dialog: {
        opacityDuration: 360,
        opacityEasing: "ease-out",
      },
      effects: {
        introDuration: { fade: 500 },
        introEasing: "ease-in",
      },
    });

    expect(transition).toEqual({
      durationMs: 360,
      easing: "ease-out",
    });
  });

  test("falls back to intro fade timing when dialog timing is omitted", () => {
    const transition = resolveFullscreenDialogSwitchTransitionOptions({
      dialog: {},
      effects: {
        introDuration: { transform: 700, fade: 500 },
        introEasing: { transform: "ease-in", fade: "ease-out" },
      },
    });

    expect(transition).toEqual({
      durationMs: 500,
      easing: "ease-out",
    });
  });
});
