import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

function read(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("slider reveal stagger wiring", () => {
  test("assigns slide reveal indices for the built-in stagger CSS", () => {
    const css = read("./Slider.module.css");
    const coreEngine = read("./SliderCoreEngine.tsx");
    const legacyEngine = read("./SliderEngine.tsx");

    expect(css).toContain(".fade_container [data-rmg-idx] > *");
    expect(css).toContain("var(--rmg-reveal-index, 0) * var(--rmg-reveal-stagger, 60ms)");

    expect(coreEngine).toContain("data-rmg-idx={String(normIdx)}");
    expect(coreEngine).toContain('["--rmg-reveal-index" as any]: normIdx');

    expect(legacyEngine).toContain("['data-rmg-idx' as any]: String(normIdx)");
    expect(legacyEngine).toContain("['--rmg-reveal-index' as any]: normIdx");
  });
});
