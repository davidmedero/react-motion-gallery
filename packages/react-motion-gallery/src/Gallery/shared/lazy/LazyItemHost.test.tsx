// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { LazyItemHost } from "./LazyItemHost";

let root: Root | null = null;
let host: HTMLDivElement | null = null;
const previousActEnvironment = (globalThis as any).IS_REACT_ACT_ENVIRONMENT;

async function render(node: React.ReactNode) {
  if (!host) {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  }

  await React.act(async () => {
    root?.render(node);
  });
}

function lazyHostNode(
  resetKey: React.Key,
  label: string,
  register: (index: number, node: HTMLImageElement | null) => void,
) {
  return (
    <LazyItemHost
      index={0}
      resetKey={resetKey}
      lazyLoad={{ enabled: false }}
      registerExpandableImage={register}
    >
      <article>
        <img src={`/photo-${label}.jpg`} alt={label} />
        <p>{label}</p>
      </article>
    </LazyItemHost>
  );
}

describe("LazyItemHost reset keys", () => {
  beforeAll(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  });

  afterEach(() => {
    React.act(() => {
      root?.unmount();
    });
    root = null;
    host?.remove();
    host = null;
    vi.restoreAllMocks();
  });

  test("does not reset image registration when children rerender with the same reset key", async () => {
    const register = vi.fn();

    await render(lazyHostNode("product-a", "alpha", register));
    expect(register).toHaveBeenCalledTimes(1);
    expect(register.mock.calls[0]?.[1]?.getAttribute("alt")).toBe("alpha");

    await render(lazyHostNode("product-a", "beta", register));
    expect(register).toHaveBeenCalledTimes(1);

    await render(lazyHostNode("product-b", "beta", register));
    expect(register).toHaveBeenCalledTimes(3);
    expect(register.mock.calls[1]).toEqual([0, null]);
    expect(register.mock.calls[2]?.[1]?.getAttribute("alt")).toBe("beta");
  });
});
