import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as zoomPanHoverEntry from "../../zoomPan-hover";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("zoomPan public entries", () => {
  test("exports the hover plugin as a dedicated subpath", () => {
    expect(packageJson.exports["./zoomPan/hover"]).toBeDefined();
    expect(zoomPanHoverEntry.zoomPanHover).toBeTypeOf("function");
    expect(zoomPanHoverEntry.zoomPanHover()).toMatchObject({
      __rmgZoomPanPlugin: true,
      kind: "hover",
    });
  });
});
