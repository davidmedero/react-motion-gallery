// @vitest-environment jsdom

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import {
  Reveal,
  resolveRevealTransform,
  useReveal,
} from "../../reveal";

type ObserverEntry = {
  isIntersecting: boolean;
  intersectionRatio: number;
};

const observerInstances: MockIntersectionObserver[] = [];

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  observed = new Set<Element>();
  disconnected = false;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observerInstances.push(this);
  }

  observe(element: Element) {
    this.observed.add(element);
  }

  unobserve(element: Element) {
    this.observed.delete(element);
  }

  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }

  takeRecords() {
    return [];
  }

  trigger(entry: ObserverEntry) {
    const target = [...this.observed][0] ?? document.body;
    this.callback(
      [
        {
          target,
          time: 0,
          rootBounds: null,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
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
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function stubAnimationFrames() {
  let nextId = 1;
  const callbacks = new Map<number, FrameRequestCallback>();

  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    })
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => {
      callbacks.delete(id);
    })
  );

  return async () => {
    const pending = Array.from(callbacks.values());
    callbacks.clear();
    await React.act(async () => {
      for (const callback of pending) callback(performance.now());
      await Promise.resolve();
    });
  };
}

function stubRect(rect: Partial<DOMRect> = {}) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({
    x: rect.x ?? 0,
    y: rect.y ?? 900,
    left: rect.left ?? 0,
    top: rect.top ?? 900,
    right: rect.right ?? 200,
    bottom: rect.bottom ?? 1000,
    width: rect.width ?? 200,
    height: rect.height ?? 100,
    toJSON: () => ({}),
  } as DOMRect));
}

function stubMotionPreference(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

function HookProbe(props: Parameters<typeof useReveal>[0]) {
  const reveal = useReveal<HTMLDivElement>(props);

  return (
    <div
      ref={reveal.ref}
      data-probe="true"
      data-revealed={reveal.revealed ? "true" : "false"}
      data-in-view={reveal.inView ? "true" : "false"}
      {...reveal.revealProps}
    />
  );
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  observerInstances.length = 0;
  stubRect();
  stubMotionPreference(false);
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useReveal", () => {
  test("reveals when the observed node enters view", async () => {
    const onReveal = vi.fn();
    const { container, root } = mount(<HookProbe onReveal={onReveal} />);
    await settle();

    const probe = container.querySelector<HTMLElement>("[data-probe]");
    expect(probe?.dataset.rmgRevealState).toBe("hidden");
    expect(observerInstances).toHaveLength(1);

    React.act(() => {
      observerInstances[0]!.trigger({ isIntersecting: true, intersectionRatio: 0.7 });
    });

    expect(probe?.dataset.rmgRevealState).toBe("revealed");
    expect(probe?.dataset.revealed).toBe("true");
    expect(onReveal).toHaveBeenCalledTimes(1);

    unmount(root, container);
  });

  test("animates elements that are already visible on mount", async () => {
    stubRect({ y: 24, top: 24, bottom: 124 });
    const flushFrame = stubAnimationFrames();
    const onReveal = vi.fn();
    const { container, root } = mount(<HookProbe onReveal={onReveal} />);

    const probe = container.querySelector<HTMLElement>("[data-probe]");
    expect(probe?.dataset.rmgRevealOwned).toBe("true");
    expect(probe?.dataset.rmgRevealState).toBe("hidden");
    expect(probe?.dataset.rmgRevealInitializing).toBe("true");
    expect(probe?.style.getPropertyValue("--rmg-reveal-opacity-duration")).toBe("520ms");
    expect(probe?.style.getPropertyValue("--rmg-reveal-transform-duration")).toBe("520ms");
    expect(onReveal).not.toHaveBeenCalled();

    await flushFrame();
    expect(probe?.dataset.rmgRevealState).toBe("hidden");
    expect(probe?.dataset.rmgRevealInitializing).toBe("true");

    await flushFrame();
    expect(probe?.dataset.rmgRevealState).toBe("revealed");
    expect(probe?.dataset.rmgRevealInitializing).toBeUndefined();
    expect(onReveal).toHaveBeenCalledTimes(1);

    unmount(root, container);
  });

  test("keeps once reveals visible after leaving view", async () => {
    const { container, root } = mount(<HookProbe once />);
    await settle();
    const probe = container.querySelector<HTMLElement>("[data-probe]");

    React.act(() => {
      observerInstances[0]!.trigger({ isIntersecting: true, intersectionRatio: 0.7 });
      observerInstances[0]!.trigger({ isIntersecting: false, intersectionRatio: 0 });
    });

    expect(probe?.dataset.rmgRevealState).toBe("revealed");
    expect(observerInstances[0]?.disconnected).toBe(true);

    unmount(root, container);
  });

  test("supports reversible reveals when once is false", async () => {
    const onReveal = vi.fn();
    const { container, root } = mount(<HookProbe once={false} onReveal={onReveal} />);
    await settle();
    const probe = container.querySelector<HTMLElement>("[data-probe]");

    React.act(() => {
      observerInstances[0]!.trigger({ isIntersecting: true, intersectionRatio: 0.7 });
    });
    expect(probe?.dataset.rmgRevealState).toBe("revealed");

    React.act(() => {
      observerInstances[0]!.trigger({ isIntersecting: false, intersectionRatio: 0 });
    });
    expect(probe?.dataset.rmgRevealState).toBe("hidden");

    React.act(() => {
      observerInstances[0]!.trigger({ isIntersecting: true, intersectionRatio: 0.7 });
    });
    expect(onReveal).toHaveBeenCalledTimes(2);

    unmount(root, container);
  });

  test("reveals immediately without IntersectionObserver", async () => {
    vi.unstubAllGlobals();
    stubMotionPreference(false);
    const { container, root } = mount(<HookProbe />);
    await settle();

    expect(container.querySelector<HTMLElement>("[data-probe]")?.dataset.rmgRevealState).toBe(
      "revealed"
    );

    unmount(root, container);
  });

  test("reveals immediately for reduced motion and disabled mode", async () => {
    stubMotionPreference(true);
    const reduced = mount(<HookProbe />);
    await settle();
    expect(
      reduced.container.querySelector<HTMLElement>("[data-probe]")?.dataset.rmgRevealReduced
    ).toBe("true");
    expect(
      reduced.container.querySelector<HTMLElement>("[data-probe]")?.dataset.rmgRevealState
    ).toBe("revealed");
    unmount(reduced.root, reduced.container);

    stubMotionPreference(false);
    const disabled = mount(<HookProbe disabled />);
    await settle();
    expect(
      disabled.container.querySelector<HTMLElement>("[data-probe]")?.dataset.rmgRevealDisabled
    ).toBe("true");
    expect(
      disabled.container.querySelector<HTMLElement>("[data-probe]")?.dataset.rmgRevealState
    ).toBe("revealed");
    unmount(disabled.root, disabled.container);
  });

  test("disconnects the observer on cleanup", async () => {
    const { container, root } = mount(<HookProbe />);
    await settle();
    const observer = observerInstances[0]!;

    unmount(root, container);

    expect(observer.disconnected).toBe(true);
  });
});

describe("Reveal", () => {
  test("renders polymorphic markup and merges props", async () => {
    const forwardedRef = React.createRef<HTMLElement>();
    const { container, root } = mount(
      <Reveal
        ref={forwardedRef}
        as="section"
        className="custom"
        style={{ color: "red", transform: "rotate(2deg)" }}
        data-id="example"
        disabled
      >
        Content
      </Reveal>
    );
    await settle();

    const node = container.querySelector<HTMLElement>("[data-id='example']")!;
    expect(node.tagName).toBe("SECTION");
    expect(node.className).toContain("custom");
    expect(node.style.color).toBe("red");
    expect(node.style.getPropertyValue("--rmg-reveal-to-transform")).toBe("rotate(2deg)");
    expect(forwardedRef.current).toBe(node);

    unmount(root, container);
  });

  test("serializes fade and transform styles", async () => {
    const { container, root } = mount(
      <>
        <Reveal as="span" variant="fade" opacityDurationMs={180} disabled>
          Fade
        </Reveal>
        <Reveal
          as="span"
          variant="transform"
          transform={{ x: -16, scale: 0.96, rotate: -2 }}
          staggerIndex={2}
          disabled
        >
          Transform
        </Reveal>
      </>
    );
    await settle();

    const [fade, transform] = Array.from(
      container.querySelectorAll<HTMLElement>("[data-rmg-reveal]")
    );
    expect(fade?.dataset.rmgRevealVariant).toBe("fade");
    expect(fade?.style.getPropertyValue("--rmg-reveal-from-transform")).toBe("none");
    expect(fade?.style.getPropertyValue("--rmg-reveal-opacity-duration")).toBe("180ms");
    expect(transform?.dataset.rmgRevealVariant).toBe("transform");
    expect(transform?.style.getPropertyValue("--rmg-reveal-from-transform")).toContain(
      "translate3d(-16px, 0px, 0px)"
    );
    expect(transform?.style.getPropertyValue("--rmg-reveal-from-transform")).toContain(
      "scale3d(0.96, 0.96, 1)"
    );

    unmount(root, container);
  });

  test("supports shared and property-specific durations", async () => {
    const { container, root } = mount(
      <>
        <Reveal data-id="shared" durationMs={640} disabled />
        <Reveal
          data-id="opacity"
          durationMs={640}
          opacityDurationMs={180}
          disabled
        />
        <Reveal
          data-id="transform"
          durationMs={640}
          transformDurationMs={900}
          disabled
        />
        <Reveal
          data-id="split"
          opacityDurationMs={120}
          transformDurationMs={780}
          disabled
        />
      </>
    );
    await settle();

    const node = (id: string) =>
      container.querySelector<HTMLElement>(`[data-id='${id}']`)!;

    expect(node("shared").style.getPropertyValue("--rmg-reveal-opacity-duration")).toBe(
      "640ms"
    );
    expect(node("shared").style.getPropertyValue("--rmg-reveal-transform-duration")).toBe(
      "640ms"
    );
    expect(node("opacity").style.getPropertyValue("--rmg-reveal-opacity-duration")).toBe(
      "180ms"
    );
    expect(node("opacity").style.getPropertyValue("--rmg-reveal-transform-duration")).toBe(
      "640ms"
    );
    expect(node("transform").style.getPropertyValue("--rmg-reveal-opacity-duration")).toBe(
      "640ms"
    );
    expect(
      node("transform").style.getPropertyValue("--rmg-reveal-transform-duration")
    ).toBe("900ms");
    expect(node("split").style.getPropertyValue("--rmg-reveal-opacity-duration")).toBe(
      "120ms"
    );
    expect(node("split").style.getPropertyValue("--rmg-reveal-transform-duration")).toBe(
      "780ms"
    );

    unmount(root, container);
  });

  test("accepts raw transform strings", async () => {
    const { container, root } = mount(
      <Reveal transform="perspective(700px) rotateX(8deg)" disabled>
        Raw
      </Reveal>
    );
    await settle();

    expect(
      container
        .querySelector<HTMLElement>("[data-rmg-reveal]")
        ?.style.getPropertyValue("--rmg-reveal-from-transform")
    ).toBe("perspective(700px) rotateX(8deg)");

    unmount(root, container);
  });
});

describe("resolveRevealTransform", () => {
  test("builds typed transform strings", () => {
    expect(
      resolveRevealTransform({
        perspective: 900,
        y: 18,
        rotateX: 8,
        skewY: "2deg",
      })
    ).toBe("perspective(900px) translate3d(0px, 18px, 0px) rotateX(8deg) skewY(2deg)");
  });
});
