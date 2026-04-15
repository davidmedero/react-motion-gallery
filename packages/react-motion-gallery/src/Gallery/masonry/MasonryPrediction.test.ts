import { describe, expect, test } from "vitest";

import {
  buildActiveMasonrySeedHeights,
  buildMasonrySkeletonPrediction,
  resolveActiveMasonryPredictionVariant,
  resolveActiveFlexStateKey,
} from "./prediction";

describe("shared masonry skeleton prediction", () => {
  test("resolves the active responsive masonry variant from viewport width", () => {
    expect(
      resolveActiveFlexStateKey(
        [
          { minWidth: 0, columns: 1, gapPx: 12, key: "c1_g12" },
          { minWidth: 720, columns: 2, gapPx: 12, key: "c2_g12" },
          { minWidth: 1140, columns: 3, gapPx: 18, key: "c3_g18" },
        ],
        1280
      )
    ).toBe("c3_g18");

    expect(
      resolveActiveFlexStateKey(
        [
          { minWidth: 0, columns: 1, gapPx: 12, key: "c1_g12" },
          { minWidth: 720, columns: 2, gapPx: 12, key: "c2_g12" },
          { minWidth: 1140, columns: 3, gapPx: 18, key: "c3_g18" },
        ],
        900
      )
    ).toBe("c2_g12");
  });

  test("predicts legacy masonry placeholder heights and balanced columns deterministically", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 4,
      columns: { 0: 1, 720: 2, 1140: 3 },
      gap: { 0: 12, 1140: 18 },
      ratios: [100, 150, 90, 130],
      placement: "balanced",
    });

    const active = resolveActiveMasonryPredictionVariant(prediction.variants, 1024);

    expect(active?.state.key).toBe("c2_g12");
    expect(active?.items.map((item) => item.height)).toEqual([240, 360, 216, 312]);
    expect(active?.items.map((item) => item.columnIndex)).toEqual([0, 1, 0, 1]);
  });

  test("predicts structured slot-based masonry shell heights deterministically", () => {
    const prediction = buildMasonrySkeletonPrediction({
      count: 1,
      spec: {
        ratios: [55],
        layout: {
          kind: "masonry",
          itemWrapStyle: {
            padding: 12,
          },
          item: {
            kind: "col",
            style: {
              gap: 12,
              padding: 14,
            },
            children: [
              {
                kind: "rect",
                style: {
                  width: "100%",
                  height: 180,
                },
              },
              {
                kind: "text",
                fontSize: 18,
                lineHeight: 1.35,
                lines: 2,
                style: {
                  width: "88%",
                },
              },
              {
                kind: "text",
                fontSize: 14,
                lineHeight: 1.55,
                lines: 3,
                style: {
                  width: "100%",
                },
              },
            ],
          },
        },
      },
    });

    expect(prediction.variants[0]?.items[0]?.height).toBe(370);
  });

  test("builds live seed heights only for balanced masonry", () => {
    expect(
      buildActiveMasonrySeedHeights({
        viewportWidth: 1024,
        count: 3,
        placement: "roundRobin",
        ratios: [80, 90, 100],
      })
    ).toBeUndefined();

    expect(
      buildActiveMasonrySeedHeights({
        viewportWidth: 1024,
        count: 2,
        columns: { 0: 1, 720: 2, 1140: 3 },
        gap: 12,
        placement: "balanced",
        ratios: [80, 100],
      })
    ).toEqual([192, 240]);
  });
});
