import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as gridEntry from "../../grid";
import * as gridReadyEntry from "../../grid-ready";
import * as gridLazyLoadEntry from "../../grid-lazy-load";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("grid public entries", () => {
  test("exports grid readiness through the grid entry and dedicated subpath", () => {
    expect(gridEntry.Grid).toBeDefined();
    expect(gridEntry.default).toBe(gridEntry.Grid);
    expect(gridEntry.useGridReady).toBeTypeOf("function");
    expect(packageJson.exports["./grid/ready"]).toBeDefined();
    expect(gridReadyEntry.useGridReady).toBe(gridEntry.useGridReady);
  });

  test("exports grid lazy-load as a dedicated plugin subpath", () => {
    expect(packageJson.exports["./grid/lazy-load"]).toBeDefined();
    expect(gridLazyLoadEntry.gridLazyLoad).toBeTypeOf("function");
    expect(gridLazyLoadEntry.gridLazyLoad()).toMatchObject({
      __rmgGridPlugin: true,
      kind: "lazy-load",
      blocksReady: true,
    });
    expect(gridLazyLoadEntry.gridLazyLoad({ enabled: false })).toMatchObject({
      __rmgGridPlugin: true,
      kind: "lazy-load",
      blocksReady: false,
    });
  });
});
