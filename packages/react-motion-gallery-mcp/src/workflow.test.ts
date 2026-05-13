import { describe, expect, test } from "vitest";

import { classifyGalleryWorkflow } from "./workflow.js";

describe("workflow classification", () => {
  test("classifies layout-only requests", () => {
    const result = classifyGalleryWorkflow({
      goal: "Build a responsive gallery slider",
      layoutHint: "slider",
    });

    expect(result.mode).toBe("layoutOnly");
    expect(result.recommendedTools).not.toContain("scaffold_skeleton_text");
  });

  test("classifies non-text skeleton requests", () => {
    const result = classifyGalleryWorkflow({
      goal: "Build a product grid with image placeholders while loading",
      layoutHint: "grid",
    });

    expect(result.mode).toBe("layoutWithNonTextSkeleton");
  });

  test("classifies hand-authored text skeleton requests", () => {
    const result = classifyGalleryWorkflow({
      goal: "Build a card layout with simple text skeleton lines",
      layoutHint: "custom",
    });

    expect(result.mode).toBe("layoutWithHandAuthoredTextSkeleton");
    expect(result.recommendedTools).not.toContain("scaffold_skeleton_text");
  });

  test("classifies browser-measured text skeleton requests", () => {
    const result = classifyGalleryWorkflow({
      goal: "Build a masonry layout where skeleton text matches real responsive copy",
      layoutHint: "masonry",
    });

    expect(result.mode).toBe("layoutWithBrowserMeasuredTextSkeleton");
    expect(result.recommendedResources).toContain("rmg://guides/browser-measured-skeletons");
    expect(result.recommendedTools).toContain("scaffold_skeleton_text");
  });

  test("classifies existing layout skeleton requests as retrofits", () => {
    const result = classifyGalleryWorkflow({
      goal: "Add skeleton loading to the existing gallery",
      hasExistingLayout: true,
    });

    expect(result.mode).toBe("skeletonRetrofit");
  });
});
