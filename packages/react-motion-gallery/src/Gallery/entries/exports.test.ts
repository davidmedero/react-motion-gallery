import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import * as entriesCacheEntry from "../../entries-cache";
import * as entriesEntry from "../../entries";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("entries public entries", () => {
  test("exports default and cached entries subpaths", () => {
    expect(packageJson.exports["./entries"]).toBeDefined();
    expect(packageJson.exports["./entries/cache"]).toBeDefined();

    expect(entriesEntry.Entries).toBeTypeOf("function");
    expect(entriesEntry.default).toBe(entriesEntry.Entries);

    expect(entriesCacheEntry.CachedEntries).toBeTypeOf("function");
    expect(entriesCacheEntry.Entries).toBe(entriesCacheEntry.CachedEntries);
    expect(entriesCacheEntry.default).toBe(entriesCacheEntry.CachedEntries);
    expect(entriesCacheEntry.flattenEntries).toBe(entriesEntry.flattenEntries);
  });
});
