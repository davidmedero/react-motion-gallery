import * as React from "react";
import { describe, expect, test } from "vitest";

import { computeSliderChildrenKey } from "./childrenSignature";

function Slide({
  src,
  alt,
  tone,
}: {
  src: string;
  alt: string;
  tone: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        borderRadius: 12,
        outlineColor: tone,
      }}
    />
  );
}

describe("slider children signature", () => {
  test("stays stable for equivalent recreated slide elements", () => {
    const first = computeSliderChildrenKey(
      <>
        <Slide key="a" src="/one.jpg" alt="One" tone="#111111" />
        <Slide key="b" src="/two.jpg" alt="Two" tone="#222222" />
      </>
    );

    const second = computeSliderChildrenKey(
      <>
        <Slide key="a" src="/one.jpg" alt="One" tone="#111111" />
        <Slide key="b" src="/two.jpg" alt="Two" tone="#222222" />
      </>
    );

    expect(second).toBe(first);
  });

  test("changes when slide props change", () => {
    const first = computeSliderChildrenKey(
      <>
        <Slide key="a" src="/one.jpg" alt="One" tone="#111111" />
      </>
    );

    const second = computeSliderChildrenKey(
      <>
        <Slide key="a" src="/one-updated.jpg" alt="One" tone="#111111" />
      </>
    );

    expect(second).not.toBe(first);
  });
});
