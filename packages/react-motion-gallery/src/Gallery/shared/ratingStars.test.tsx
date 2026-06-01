import { readFileSync } from "node:fs";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import * as rootEntry from "../../index";
import * as ratingStarsEntry from "../../rating-stars";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
) as { exports: Record<string, unknown> };

describe("RatingStars public entry", () => {
  test("exports from the neutral subpath and root entry", () => {
    expect(packageJson.exports["./rating-stars"]).toBeDefined();
    expect(packageJson.exports["./entries/rating-stars"]).toBeUndefined();

    expect(ratingStarsEntry.RatingStars).toBeDefined();
    expect(rootEntry.RatingStars).toBe(ratingStarsEntry.RatingStars);
  });

  test("renders an accessible rating display", () => {
    const markup = renderToStaticMarkup(
      <ratingStarsEntry.RatingStars
        value={4.6}
        fillMode="floor"
        reviewCount={1248}
      />
    );

    expect(markup).toContain('data-rmg-rating-stars="true"');
    expect(markup).toContain('aria-label="4.6 out of 5, 1,248 reviews"');
    expect(markup).toContain('data-state="full"');
  });

  test("renders fractional values as a clipped star fill", () => {
    const markup = renderToStaticMarkup(
      <ratingStarsEntry.RatingStars value={3.25} showValue={false} />
    );

    expect(markup.match(/data-state="full"/g)).toHaveLength(3);
    expect(markup.match(/data-state="partial"/g)).toHaveLength(1);
    expect(markup.match(/data-state="empty"/g)).toHaveLength(1);
    expect(markup).toContain('data-fill="0.25"');
    expect(markup).toContain('<clipPath');
    expect(markup).toContain('x="2"');
    expect(markup).toContain('width="7.1"');
  });
});
