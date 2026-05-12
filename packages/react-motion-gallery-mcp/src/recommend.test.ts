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
    expect(result.install.optionalVideoPeers).toContain("plyr");
    expect(result.gotchas.some((gotcha) => gotcha.includes('"use client"'))).toBe(true);
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
