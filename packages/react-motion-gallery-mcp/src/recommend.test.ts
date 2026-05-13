import { describe, expect, test } from "vitest";

import { recommendPattern, searchDemos } from "./recommend.js";

describe("recommendations", () => {
  test("scores masonry video fullscreen requirements toward masonry demos and components", () => {
    const result = recommendPattern({
      goal: "balanced masonry with video cards, fullscreen, and skeleton loading",
      layout: "masonry",
      mediaKinds: ["video"],
      framework: "next",
    });

    expect(result.recommendedComponents[0]?.id).toBe("masonry");
    expect(result.recommendedDemos[0]?.categoryId).toBe("masonry");
    expect(result.workflow.mode).toBe("layoutWithNonTextSkeleton");
    expect(result.install.optionalVideoPeers).toContain("plyr");
    expect(result.gotchas.some((gotcha) => gotcha.includes('"use client"'))).toBe(true);
  });

  test("does not recommend skeleton tools for layout-only requests", () => {
    const result = recommendPattern({
      goal: "responsive slider with fullscreen thumbnails",
      layout: "slider",
    });

    expect(result.workflow.mode).toBe("layoutOnly");
    expect(result.workflow.recommendedTools).not.toContain("scaffold_skeleton_text");
  });

  test("routes measured text goals toward browser-measured skeleton resources", () => {
    const result = recommendPattern({
      goal: "masonry cards where skeleton text matches real responsive copy",
      layout: "masonry",
    });

    expect(result.workflow.mode).toBe("layoutWithBrowserMeasuredTextSkeleton");
    expect(result.workflow.recommendedResources).toContain(
      "rmg://guides/browser-measured-skeletons"
    );
  });

  test("searches demos by category and tags", () => {
    const demos = searchDemos({
      category: "slider",
      tags: ["fullscreen-thumbnails"],
      query: "fullscreen",
    });

    expect(demos.map((demo) => demo.id)).toContain("slider-thumbnails");
  });
});
