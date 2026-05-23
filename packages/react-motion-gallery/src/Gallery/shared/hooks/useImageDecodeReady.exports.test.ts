import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as rootEntry from "../../../index";
import * as mediaReadyEntry from "../../../media-ready";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("image decode readiness public entries", () => {
  test("exports useImageDecodeReady from the root and media ready subpath", () => {
    expect(packageJson.exports["./media/ready"]).toBeDefined();
    expect(mediaReadyEntry.useImageDecodeReady).toBeTypeOf("function");
    expect(rootEntry.useImageDecodeReady).toBe(mediaReadyEntry.useImageDecodeReady);
  });
});
