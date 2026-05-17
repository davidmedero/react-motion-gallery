import { describe, expect, test } from "vitest";

import {
  getSkeletonCacheCookieName,
  parseSkeletonCacheCookie,
  serializeSkeletonCacheSnapshot,
  validateSkeletonCacheSnapshot,
  type SkeletonCacheSnapshot,
} from "./cache";

const baseSnapshot: SkeletonCacheSnapshot = {
  version: 1,
  key: "masonry-horizontal-order",
  scopeId: "scope-a",
  kind: "masonry",
  routeKey: "/demos?demo=masonry-horizontal-order",
  createdAt: 1000,
  widthBucketMin: 1140,
  viewportWidth: 1280,
  layoutWidthPx: 960,
  masonry: {
    variantKey: "c4_g18",
    shellHeightPx: 640,
    itemHeightsPx: [120, 160],
  },
  text: {
    title: {
      lines: 1,
      barWidths: ["220px"],
      lineWidthsPx: [220],
      barHeight: 16,
      lineHeight: 1.2,
    },
    body: {
      lines: 2,
      barWidths: ["280px", "140px"],
      lineWidthsPx: [280, 140],
      barHeight: 14,
      lineHeight: 1.5,
    },
  },
};

describe("skeleton cache cookies", () => {
  test("generates stable cookie names with a key hash", () => {
    expect(getSkeletonCacheCookieName("masonry-horizontal-order")).toMatch(
      /^rmg_skel_cache_masonry-horizontal-order_[a-z0-9]+$/
    );
    expect(getSkeletonCacheCookieName("masonry horizontal/order")).toBe(
      getSkeletonCacheCookieName("masonry horizontal/order")
    );
  });

  test("round-trips valid snapshots from encoded cookie values", () => {
    const serialized = serializeSkeletonCacheSnapshot(baseSnapshot);
    const raw = encodeURIComponent(serialized);
    const parsed = parseSkeletonCacheCookie(raw, {
      key: baseSnapshot.key,
      scopeId: baseSnapshot.scopeId,
      kind: "masonry",
      routeKey: baseSnapshot.routeKey,
      ttlMs: 5000,
      now: 1200,
      textIds: ["title", "body"],
      itemCount: 2,
      variantKeys: ["c4_g18"],
      widthBucketMin: 1140,
    });

    expect(parsed).toEqual(baseSnapshot);
    expect(serialized.length).toBeLessThan(JSON.stringify(baseSnapshot).length);
    expect(serialized).not.toContain("lineWidthsPx");
    expect(serialized).not.toContain("shellHeightPx");
  });

  test("round-trips every skeleton cache kind through compact serialization", () => {
    for (const kind of ["skeleton", "slider", "grid", "masonry", "entries"] as const) {
      const snapshot: SkeletonCacheSnapshot = {
        ...baseSnapshot,
        kind,
        masonry: kind === "masonry" ? baseSnapshot.masonry : undefined,
      };
      const parsed = parseSkeletonCacheCookie(
        encodeURIComponent(serializeSkeletonCacheSnapshot(snapshot)),
        {
          key: snapshot.key,
          scopeId: snapshot.scopeId,
          kind,
          routeKey: snapshot.routeKey,
          ttlMs: 5000,
          now: 1200,
          textIds: ["title", "body"],
        }
      );

      expect(parsed?.kind).toBe(kind);
      expect(parsed?.text.body.lines).toBe(2);
    }
  });

  test("rejects expired and mismatched snapshots", () => {
    expect(
      validateSkeletonCacheSnapshot(baseSnapshot, {
        ttlMs: 100,
        now: 1200,
      })
    ).toBeNull();

    expect(
      validateSkeletonCacheSnapshot(baseSnapshot, {
        ttlMs: 5000,
        now: 1200,
        routeKey: "/other",
      })
    ).toBeNull();

    expect(
      validateSkeletonCacheSnapshot(baseSnapshot, {
        ttlMs: 5000,
        now: 1200,
        scopeId: "scope-b",
      })
    ).toBeNull();

    expect(
      validateSkeletonCacheSnapshot(baseSnapshot, {
        ttlMs: 5000,
        now: 1200,
        textIds: ["title", "missing"],
      })
    ).toBeNull();
  });

  test("silently rejects malformed or unsafe payloads", () => {
    expect(parseSkeletonCacheCookie("{nope")).toBeNull();
    expect(
      parseSkeletonCacheCookie(
        JSON.stringify({
          ...baseSnapshot,
          text: {
            title: {
              lines: 1,
              barWidths: ["1px;background:red"],
            },
          },
        })
      )
    ).toBeNull();
    expect(
      parseSkeletonCacheCookie(JSON.stringify({ ...baseSnapshot, version: 2 }))
    ).toBeNull();
  });
});
