// @vitest-environment jsdom

import * as React from "react";
import { createRoot } from "react-dom/client";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { useEntryInView } from "./useEntryInView";

type RectMode = "visible" | "near" | "offscreen";
type MockIntersectionObserverEntry = Pick<
  IntersectionObserverEntry,
  "target" | "isIntersecting"
>;

function setRect(node: HTMLElement, mode: RectMode) {
  const top = mode === "visible" ? 0 : mode === "near" ? 1000 : 2000;
  const bottom = top + 100;

  node.getBoundingClientRect = () =>
    ({
      top,
      left: 0,
      right: 100,
      bottom,
      width: 100,
      height: 100,
      x: 0,
      y: top,
      toJSON: () => undefined,
    }) as DOMRect;
}

function Probe({
  entryKeys,
  rectMode,
  nearMargin = "0px",
  onState,
}: {
  entryKeys: string[];
  rectMode: RectMode;
  nearMargin?: string;
  onState: (state: { nearView: boolean[]; everInView: boolean[] }) => void;
}) {
  const state = useEntryInView(entryKeys.length, {
    keys: entryKeys,
    nearMargin,
    viewMargin: "0px",
    threshold: 0.01,
  });

  React.useEffect(() => {
    onState({
      nearView: state.nearView,
      everInView: state.everInView,
    });
  }, [onState, state.nearView, state.everInView]);

  return (
    <>
      {entryKeys.map((entryKey, index) => (
        <div
          key={entryKey}
          ref={(node) => {
            if (node) setRect(node, rectMode);
            state.setEntryRef(index)(node);
          }}
        />
      ))}
    </>
  );
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observed = new Set<Element>();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe = (node: Element) => {
    this.observed.add(node);
  };

  unobserve = (node: Element) => {
    this.observed.delete(node);
  };

  disconnect = () => {
    this.observed.clear();
  };

  emit(entries: MockIntersectionObserverEntry[]) {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

describe("useEntryInView", () => {
  beforeAll(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  });

  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", undefined);
    MockIntersectionObserver.instances = [];
  });

  test("keeps visible replacement slots warm and resets offscreen replacements", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const states: Array<{ nearView: boolean[]; everInView: boolean[] }> = [];
    const onState = (state: { nearView: boolean[]; everInView: boolean[] }) => {
      states.push(state);
    };

    await React.act(async () => {
      root.render(
        <Probe entryKeys={["entry-a", "entry-b"]} rectMode="visible" onState={onState} />
      );
    });

    expect(states.at(-1)).toEqual({
      nearView: [true, true],
      everInView: [true, true],
    });

    await React.act(async () => {
      root.render(
        <Probe entryKeys={["entry-c", "entry-d"]} rectMode="visible" onState={onState} />
      );
    });

    expect(states.at(-1)).toEqual({
      nearView: [true, true],
      everInView: [true, true],
    });

    await React.act(async () => {
      root.render(
        <Probe entryKeys={["entry-c", "entry-d"]} rectMode="offscreen" onState={onState} />
      );
    });

    expect(states.at(-1)?.everInView).toEqual([true, true]);

    await React.act(async () => {
      root.render(
        <Probe entryKeys={["entry-e", "entry-f"]} rectMode="offscreen" onState={onState} />
      );
    });

    expect(states.at(-1)).toEqual({
      nearView: [false, false],
      everInView: [false, false],
    });

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("does not promote near-only entries to ever-in-view", async () => {
    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const states: Array<{ nearView: boolean[]; everInView: boolean[] }> = [];
    const onState = (state: { nearView: boolean[]; everInView: boolean[] }) => {
      states.push(state);
    };

    await React.act(async () => {
      root.render(
        <Probe
          entryKeys={["entry-a"]}
          rectMode="near"
          nearMargin="700px 0px"
          onState={onState}
        />
      );
    });

    expect(states[states.length - 1]).toEqual({
      nearView: [true],
      everInView: [false],
    });

    await React.act(async () => {
      root.render(
        <Probe
          entryKeys={["entry-b"]}
          rectMode="near"
          nearMargin="700px 0px"
          onState={onState}
        />
      );
    });

    expect(states[states.length - 1]).toEqual({
      nearView: [true],
      everInView: [false],
    });

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

  test("lets IntersectionObserver own initial visibility without synchronous measuring", async () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const rootEl = document.createElement("div");
    document.body.appendChild(rootEl);
    const root = createRoot(rootEl);
    const states: Array<{ nearView: boolean[]; everInView: boolean[] }> = [];

    function IOBasedProbe() {
      const state = useEntryInView(1, {
        keys: ["entry-a"],
        nearMargin: "700px 0px",
        viewMargin: "0px",
        threshold: 0.01,
      });

      React.useEffect(() => {
        states.push({
          nearView: state.nearView,
          everInView: state.everInView,
        });
      }, [state.nearView, state.everInView]);

      return (
        <div
          ref={(node) => {
            if (node) {
              node.getBoundingClientRect = () => {
                throw new Error("visibility should come from IntersectionObserver");
              };
            }
            state.setEntryRef(0)(node);
          }}
        />
      );
    }

    await React.act(async () => {
      root.render(<IOBasedProbe />);
    });

    expect(states.at(-1)).toEqual({
      nearView: [false],
      everInView: [false],
    });
    expect(MockIntersectionObserver.instances).toHaveLength(2);

    await React.act(async () => {
      MockIntersectionObserver.instances.forEach((observer) => {
        const node = Array.from(observer.observed)[0];
        expect(node).toBeDefined();
        observer.emit([{ target: node as Element, isIntersecting: true }]);
      });
    });

    expect(states.at(-1)).toEqual({
      nearView: [true],
      everInView: [true],
    });

    await React.act(async () => {
      root.unmount();
    });
    rootEl.remove();
  });

});
