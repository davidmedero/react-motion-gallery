import { describe, expect, test } from "vitest";

import { resolveFullscreenZoomPanBoundsMode } from "./zoomPanRuntime";

describe("fullscreen zoom-pan bounds mode", () => {
  test("defaults dialog fullscreen to media pane bounds", () => {
    expect(
      resolveFullscreenZoomPanBoundsMode({
        fullscreenDialogEnabled: true,
      })
    ).toBe("media");
  });

  test("keeps layout bounds as the non-dialog fullscreen default", () => {
    expect(
      resolveFullscreenZoomPanBoundsMode({
        fullscreenDialogEnabled: false,
      })
    ).toBe("layout");
  });

  test("uses the configured bounds mode when provided", () => {
    expect(
      resolveFullscreenZoomPanBoundsMode({
        configured: "layout",
        fullscreenDialogEnabled: true,
      })
    ).toBe("layout");

    expect(
      resolveFullscreenZoomPanBoundsMode({
        configured: "media",
        fullscreenDialogEnabled: false,
      })
    ).toBe("media");
  });
});
