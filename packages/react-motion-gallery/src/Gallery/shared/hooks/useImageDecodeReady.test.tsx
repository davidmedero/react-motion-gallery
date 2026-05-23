// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { useImageDecodeReady, type ImageDecodeReadyOptions } from "../../../media-ready";

class MockImage extends EventTarget {
  static instances: MockImage[] = [];
  static decodeImpl: (() => Promise<void>) | null = () => Promise.resolve();

  complete = false;
  decoding = "auto";
  naturalWidth = 100;
  sizes = "";
  src = "";
  srcset = "";
  decode?: () => Promise<void>;

  constructor() {
    super();
    MockImage.instances.push(this);
    if (MockImage.decodeImpl) {
      this.decode = vi.fn(MockImage.decodeImpl);
    }
  }
}

function mount(node: React.ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  React.act(() => {
    root.render(node);
  });

  return { container, root };
}

function unmount(root: Root, container: HTMLElement) {
  React.act(() => {
    root.unmount();
  });
  container.remove();
}

async function settle() {
  await React.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function Probe(props: ImageDecodeReadyOptions) {
  const image = useImageDecodeReady(props);

  return (
    <div
      data-probe="true"
      data-ready={image.ready ? "true" : "false"}
      data-loading={image.loading ? "true" : "false"}
      data-error={image.error ? "true" : "false"}
    />
  );
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  MockImage.instances = [];
  MockImage.decodeImpl = () => Promise.resolve();
  vi.stubGlobal("Image", MockImage as unknown as typeof Image);
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useImageDecodeReady", () => {
  test("waits for image load and decode", async () => {
    const { container, root } = mount(<Probe src="/photo.jpg" />);
    const probe = container.querySelector<HTMLElement>("[data-probe]")!;

    expect(probe.dataset.ready).toBe("false");
    expect(probe.dataset.loading).toBe("true");
    expect(MockImage.instances).toHaveLength(1);
    expect(MockImage.instances[0]?.decoding).toBe("async");
    expect(MockImage.instances[0]?.src).toBe("/photo.jpg");

    React.act(() => {
      MockImage.instances[0]?.dispatchEvent(new Event("load"));
    });
    await settle();

    expect(MockImage.instances[0]?.decode).toHaveBeenCalledTimes(1);
    expect(probe.dataset.ready).toBe("true");
    expect(probe.dataset.loading).toBe("false");
    expect(probe.dataset.error).toBe("false");

    unmount(root, container);
  });

  test("falls back to load when decode is unavailable", async () => {
    MockImage.decodeImpl = null;
    const { container, root } = mount(
      <Probe src="/photo.jpg" srcSet="/photo@2x.jpg 2x" sizes="50vw" />
    );

    expect(MockImage.instances[0]?.srcset).toBe("/photo@2x.jpg 2x");
    expect(MockImage.instances[0]?.sizes).toBe("50vw");

    React.act(() => {
      MockImage.instances[0]?.dispatchEvent(new Event("load"));
    });
    await settle();

    const probe = container.querySelector<HTMLElement>("[data-probe]")!;
    expect(probe.dataset.ready).toBe("true");
    expect(probe.dataset.error).toBe("false");

    unmount(root, container);
  });

  test("unblocks after the timeout", async () => {
    vi.useFakeTimers();
    const { container, root } = mount(<Probe src="/slow.jpg" timeoutMs={25} />);
    const probe = container.querySelector<HTMLElement>("[data-probe]")!;

    expect(probe.dataset.ready).toBe("false");

    await React.act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    expect(probe.dataset.ready).toBe("true");
    expect(probe.dataset.loading).toBe("false");
    expect(probe.dataset.error).toBe("false");

    unmount(root, container);
  });

  test("is ready immediately when disabled or empty", async () => {
    const disabled = mount(<Probe src="/photo.jpg" enabled={false} />);
    await settle();
    expect(
      disabled.container.querySelector<HTMLElement>("[data-probe]")?.dataset.ready
    ).toBe("true");
    expect(MockImage.instances).toHaveLength(0);
    unmount(disabled.root, disabled.container);

    const empty = mount(<Probe src="" />);
    await settle();
    expect(empty.container.querySelector<HTMLElement>("[data-probe]")?.dataset.ready).toBe(
      "true"
    );
    expect(MockImage.instances).toHaveLength(0);
    unmount(empty.root, empty.container);
  });

  test("resolves image errors as ready with error state", async () => {
    const { container, root } = mount(<Probe src="/missing.jpg" />);

    React.act(() => {
      MockImage.instances[0]?.dispatchEvent(new Event("error"));
    });
    await settle();

    const probe = container.querySelector<HTMLElement>("[data-probe]")!;
    expect(probe.dataset.ready).toBe("true");
    expect(probe.dataset.loading).toBe("false");
    expect(probe.dataset.error).toBe("true");

    unmount(root, container);
  });
});
