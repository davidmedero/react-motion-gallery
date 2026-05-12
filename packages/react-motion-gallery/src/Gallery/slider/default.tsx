/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import SliderCore from "./SliderCore";
import styles from "./Slider.module.css";
import createIndexChannel, { normalizeSliderInitialIndex } from "./sliderSub";
import { DEFAULT_SLIDER } from "./defaults";
import {
  BREAKPOINT_MAP,
  resolveNumberFromResponsive,
} from "../shared/responsiveNumber";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import type { BreakpointMap } from "../shared/responsiveNumber";
import type {
  SliderAutoPlayTimer,
  SliderCoreHandle,
  SliderHandle,
  SliderOptions,
  SliderPlugin,
  SliderPluginHost,
  SliderPluginKind,
  SliderRemoveTarget,
} from "./types";
import type { SliderIndexChannel } from "./sliderSub";

type Props = SliderOptions & {
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  indexChannel?: SliderIndexChannel;
};

type Cell = { id: string; node: React.ReactNode };

type PluginEntry = {
  id: string;
  plugin: SliderPlugin;
};

function toArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.RefObject<T | null>).current = value;
}

function isPlugin(value: unknown): value is SliderPlugin {
  return (
    typeof value === "object" &&
    value != null &&
    (value as SliderPlugin).__rmgSliderPlugin === true
  );
}

const CoreSlider = React.forwardRef<SliderHandle, Props>(function CoreSlider(
  props,
  forwardedRef
) {
  const {
    children,
    breakpoints,
    indexChannel: providedIndexChannel,
    plugins = [],
    ...sliderOptions
  } = props;
  const [internalIndexChannel] = React.useState(() =>
    createIndexChannel(normalizeSliderInitialIndex(props.initialIndex), "instant")
  );
  const resolvedIndexChannel = providedIndexChannel ?? internalIndexChannel;
  const coreHandleRef = React.useRef<SliderCoreHandle | null>(null);
  const publicHandleRef = React.useRef<SliderHandle | null>(null);
  const coreReadyUnsubRef = React.useRef<(() => void) | null>(null);
  const indexUnsubRef = React.useRef<(() => void) | null>(null);
  const hostReadyRef = React.useRef(false);
  const readySubsRef = React.useRef(new Set<(nodes: HTMLElement[]) => void>());
  const readyResolversRef = React.useRef<Array<(nodes: HTMLElement[]) => void>>([]);
  const autoPlayTimerRef = React.useRef<SliderAutoPlayTimer | null>(null);
  const intro = sliderOptions.transitions?.intro;
  const introRef = React.useRef<HTMLDivElement | null>(null);
  const [introInView, setIntroInView] = React.useState(false);
  const [index, setIndex] = React.useState(
    normalizeSliderInitialIndex(props.initialIndex)
  );
  const [coreReady, setCoreReady] = React.useState(false);
  const [handleVersion, setHandleVersion] = React.useState(0);
  const [pluginReady, setPluginReady] = React.useState<Record<string, boolean>>({});

  const pluginEntries = React.useMemo<PluginEntry[]>(() => {
    return plugins.filter(isPlugin).map((plugin, index) => ({
      id: `${plugin.kind}:${index}`,
      plugin,
    }));
  }, [plugins]);

  const pluginKinds = React.useMemo(
    () => new Set(pluginEntries.map((entry) => entry.plugin.kind)),
    [pluginEntries]
  );

  const blockingPluginIds = React.useMemo(
    () =>
      pluginEntries
        .filter((entry) => entry.plugin.blocksReady)
        .map((entry) => entry.id),
    [pluginEntries]
  );

  React.useEffect(() => {
    setPluginReady((prev) => {
      const next: Record<string, boolean> = {};
      for (const entry of pluginEntries) {
        if (!entry.plugin.blocksReady) continue;
        next[entry.id] = prev[entry.id] === true ? true : false;
      }
      return next;
    });
  }, [pluginEntries]);

  const sliderObject = React.useMemo(() => {
    return {
      layout: { ...DEFAULT_SLIDER.layout, ...(sliderOptions.layout ?? {}) },
      direction: { ...DEFAULT_SLIDER.direction, ...(sliderOptions.direction ?? {}) },
      align: sliderOptions.align ?? DEFAULT_SLIDER.align,
      scroll: { ...DEFAULT_SLIDER.scroll, ...(sliderOptions.scroll ?? {}) },
      motion: { ...DEFAULT_SLIDER.motion, ...(sliderOptions.motion ?? {}) },
      elements: sliderOptions.elements,
    };
  }, [sliderOptions]);

  const idSeqRef = React.useRef(0);
  const newId = React.useCallback(() => `rmg-${++idSeqRef.current}`, []);

  const initialCells = React.useMemo<Cell[]>(() => {
    const kids = React.Children.toArray(children);
    return kids.map((node) => ({ id: newId(), node }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [localCellsState, setLocalCellsState] = React.useState<Cell[]>(initialCells);
  const localCellsRef = React.useRef<Cell[]>(initialCells);

  const commitLocalCells = React.useCallback((next: Cell[]) => {
    localCellsRef.current = next;
    setLocalCellsState(next);
  }, []);

  const append = React.useCallback(
    (nodes: React.ReactNode | React.ReactNode[]) => {
      const add = toArray(nodes).map((node) => ({ id: newId(), node }));
      const next = [...localCellsRef.current, ...add];
      commitLocalCells(next);
      return next.length;
    },
    [commitLocalCells, newId]
  );

  const prepend = React.useCallback(
    (nodes: React.ReactNode | React.ReactNode[]) => {
      const add = toArray(nodes).map((node) => ({ id: newId(), node }));
      const next = [...add, ...localCellsRef.current];
      commitLocalCells(next);
      return next.length;
    },
    [commitLocalCells, newId]
  );

  const insert = React.useCallback(
    (index: number, nodes: React.ReactNode | React.ReactNode[]) => {
      const add = toArray(nodes).map((node) => ({ id: newId(), node }));
      const to = Math.max(0, Math.min(index | 0, localCellsRef.current.length));
      const next = [
        ...localCellsRef.current.slice(0, to),
        ...add,
        ...localCellsRef.current.slice(to),
      ];
      commitLocalCells(next);
      return next.length;
    },
    [commitLocalCells, newId]
  );

  const remove = React.useCallback(
    (indexOrPredicate: SliderRemoveTarget) => {
      const arr = localCellsRef.current;
      if (!arr.length) return 0;
      const next =
        typeof indexOrPredicate === "function"
          ? arr.filter((_, index) => !indexOrPredicate(index))
          : (() => {
              const i = Math.max(0, Math.min(indexOrPredicate | 0, arr.length - 1));
              return arr.slice(0, i).concat(arr.slice(i + 1));
            })();
      commitLocalCells(next);
      return next.length;
    },
    [commitLocalCells]
  );

  const replace = React.useCallback(
    (index: number, node: React.ReactNode) => {
      const arr = localCellsRef.current;
      if (!arr.length) return;
      const i = Math.max(0, Math.min(index | 0, arr.length - 1));
      const next = arr.slice();
      next[i] = { id: newId(), node };
      commitLocalCells(next);
    },
    [commitLocalCells, newId]
  );

  const setItems = React.useCallback(
    (nodes: React.ReactNode[]) => {
      const next = (nodes ?? []).map((node) => ({ id: newId(), node }));
      commitLocalCells(next);
      return next.length;
    },
    [commitLocalCells, newId]
  );

  const getHostReady = React.useCallback(() => {
    return (
      coreReady &&
      blockingPluginIds.every((id) => pluginReady[id] === true)
    );
  }, [blockingPluginIds, coreReady, pluginReady]);

  const emitHostReady = React.useCallback(() => {
    const handle = coreHandleRef.current;
    const nodes = handle?.getSlideNodes() ?? [];
    readySubsRef.current.forEach((fn) => fn(nodes));
    readyResolversRef.current.splice(0).forEach((resolve) => resolve(nodes));
  }, []);

  React.useEffect(() => {
    const ready = getHostReady();
    if (!ready || hostReadyRef.current) return;
    hostReadyRef.current = true;
    emitHostReady();
  }, [emitHostReady, getHostReady]);

  React.useEffect(() => {
    if (getHostReady()) return;
    hostReadyRef.current = false;
  }, [getHostReady]);

  const setPluginEntryReady = React.useCallback((id: string, ready: boolean) => {
    setPluginReady((prev) => {
      if (prev[id] === ready) return prev;
      return { ...prev, [id]: ready };
    });
  }, []);

  const setAutoPlayTimer = React.useCallback((timer: SliderAutoPlayTimer | null) => {
    autoPlayTimerRef.current = timer;
  }, []);

  const readAutoPlayTimer = React.useCallback(
    (fallback: () => SliderAutoPlayTimer): SliderAutoPlayTimer => {
      const timer = autoPlayTimerRef.current;
      if (!timer?.active || timer.startedAt == null || timer.speedMs <= 0) {
        return timer ?? fallback();
      }
      const now =
        typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : Date.now();
      const elapsedMs = Math.max(0, now - timer.startedAt);
      const progress = Math.max(0, Math.min(1, elapsedMs / timer.speedMs));
      return {
        ...timer,
        elapsedMs,
        remainingMs: Math.max(0, timer.speedMs - elapsedMs),
        progress,
      };
    },
    []
  );

  const createRipple = React.useCallback(
    (el: HTMLElement) => {
      if (!pluginKinds.has("ripple")) return;
      const old = el.querySelector<HTMLElement>("[data-rmg-ripple]");
      if (old) old.remove();

      const rect = el.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.dataset.rmgRipple = "true";
      ripple.className = styles.ripple;
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${rect.width / 2 - diameter / 2}px`;
      ripple.style.top = `${rect.height / 2 - diameter / 2}px`;
      el.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    },
    [pluginKinds]
  );

  const setSliderHandle = React.useCallback(
    (inst: SliderCoreHandle | null) => {
      coreReadyUnsubRef.current?.();
      indexUnsubRef.current?.();
      coreReadyUnsubRef.current = null;
      indexUnsubRef.current = null;
      coreHandleRef.current = inst;
      setCoreReady(inst?.isReady() === true);

      if (!inst) {
        publicHandleRef.current = null;
        assignRef(forwardedRef, null);
        setHandleVersion((version) => version + 1);
        return;
      }

      coreReadyUnsubRef.current = inst.onReady(() => setCoreReady(true));
      indexUnsubRef.current = inst.subscribeIndex(() => {
        setIndex(inst.getIndex());
      });
      setIndex(inst.getIndex());

      const handle: SliderHandle = {
        ...inst,
        getAutoPlayTimer: () => readAutoPlayTimer(inst.getAutoPlayTimer),
        append,
        prepend,
        insert,
        remove,
        replace,
        setItems,
        onIndexChange: (fn) =>
          inst.subscribeIndex(() => {
            fn(inst.getIndex(), { mode: resolvedIndexChannel.get().mode });
          }),
        onReady: (cb) => {
          readySubsRef.current.add(cb);
          if (hostReadyRef.current) cb(inst.getSlideNodes());
          return () => {
            readySubsRef.current.delete(cb);
          };
        },
        whenReady: () =>
          hostReadyRef.current
            ? Promise.resolve(inst.getSlideNodes())
            : new Promise((resolve) => {
                readyResolversRef.current.push(resolve);
              }),
        isReady: () => hostReadyRef.current,
      };

      publicHandleRef.current = handle;
      assignRef(forwardedRef, handle);
      setHandleVersion((version) => version + 1);
    },
    [
      append,
      forwardedRef,
      insert,
      prepend,
      remove,
      replace,
      readAutoPlayTimer,
      resolvedIndexChannel,
      setItems,
    ]
  );

  React.useEffect(() => {
    return () => {
      coreReadyUnsubRef.current?.();
      indexUnsubRef.current?.();
    };
  }, []);

  const renderedCells = React.useMemo(() => {
    const base = localCellsState.map((cell) => {
      const node = cell.node;
      return React.isValidElement(node) ? (
        React.cloneElement(node as React.ReactElement, { key: cell.id })
      ) : (
        <span key={cell.id} style={{ display: "block" }}>
          {node as any}
        </span>
      );
    });

    return pluginEntries.reduce<React.ReactNode>(
      (next, entry) =>
        entry.plugin.transformChildren
          ? entry.plugin.transformChildren(next, entry.plugin.options)
          : next,
      base
    );
  }, [localCellsState, pluginEntries]);

  const vw = useViewportWidth();
  const effectiveBreakpoints = React.useMemo(
    () => ({ ...BREAKPOINT_MAP, ...(breakpoints || {}) }),
    [breakpoints]
  );
  const resolvedCellsPerSlide = React.useMemo(() => {
    if (sliderObject.layout.cellsPerSlide == null) return undefined;
    const raw = resolveNumberFromResponsive(
      sliderObject.layout.cellsPerSlide,
      1,
      vw,
      effectiveBreakpoints
    );
    return Math.max(1, raw | 0);
  }, [sliderObject.layout.cellsPerSlide, vw, effectiveBreakpoints]);

  const resolvedGap = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      sliderObject.layout.gap,
      20,
      vw,
      effectiveBreakpoints
    );
    return Math.max(0, raw | 0);
  }, [sliderObject.layout.gap, vw, effectiveBreakpoints]);

  React.useEffect(() => {
    if (!intro) return;
    if (intro.inView === true) {
      setIntroInView(true);
      return;
    }

    const node = introRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIntroInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIntroInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [intro]);

  const hostBase = React.useMemo<Omit<SliderPluginHost, "setPluginReady">>(
    () => {
      const handle = publicHandleRef.current;
      const measuredSlideCount = handle?.getInternals().slides.current.length ?? 0;
      const domSlideCount =
        handle
          ?.getSlideNodes()
          .filter((node) => node.getAttribute("data-rmg-clone") !== "true").length ?? 0;
      return {
        handle,
        coreReady,
        index,
        slideCount: measuredSlideCount || domSlideCount || localCellsState.length,
        cellsInView: handle?.cellsInView() ?? [],
        progress: handle?.scrollProgress() ?? 0,
        axis: sliderObject.direction.axis,
        dir: sliderObject.direction.dir,
        loop: sliderObject.scroll.loop === true,
        freeScroll: sliderObject.scroll.freeScroll === true,
        canScrollPrev: handle?.canScrollPrev() ?? false,
        canScrollNext: handle?.canScrollNext() ?? false,
        createRipple,
        hasPlugin: (kind: SliderPluginKind) => pluginKinds.has(kind),
        setAutoPlayTimer,
      };
    },
    [
      coreReady,
      createRipple,
      handleVersion,
      index,
      localCellsState.length,
      pluginKinds,
      setAutoPlayTimer,
      sliderObject.direction.axis,
      sliderObject.direction.dir,
      sliderObject.scroll.freeScroll,
      sliderObject.scroll.loop,
    ]
  );

  const coreNode = (
    <SliderCore
      cellCount={localCellsState.length}
      gap={resolvedGap}
      cellsPerSlide={
        sliderObject.layout.cellsPerSlide != null
          ? resolvedCellsPerSlide ?? 1
          : undefined
      }
      direction={sliderObject.direction}
      align={sliderObject.align}
      scroll={sliderObject.scroll}
      autoHeight={pluginKinds.has("auto-height")}
      motion={sliderObject.motion}
      initialIndex={sliderOptions.initialIndex}
      indexChannel={resolvedIndexChannel}
      indexChannelControlled={!!providedIndexChannel}
      elements={sliderObject.elements}
      ref={setSliderHandle}
    >
      {renderedCells}
    </SliderCore>
  );

  const pluginNodes = pluginEntries.map((entry) => {
    const Runtime = entry.plugin.Runtime;
    const host: SliderPluginHost = {
      ...hostBase,
      setPluginReady: (ready) => setPluginEntryReady(entry.id, ready),
    };

    return (
      <React.Fragment key={entry.id}>
        {Runtime ? <Runtime host={host} options={entry.plugin.options} /> : null}
        {entry.plugin.renderOverlay?.(host, entry.plugin.options)}
      </React.Fragment>
    );
  });

  const withPlugins =
    pluginNodes.length > 0 ? (
      <div className={styles.sliderShell}>
        {coreNode}
        {pluginNodes}
      </div>
    ) : (
      coreNode
    );

  if (!intro) return withPlugins;

  const introActive = introInView;
  const baseContainerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [
      styles.fade_container,
      introActive ? styles.fadeInActive : styles.fadeInStart,
    ].join(" "),
    style: {
      position: "relative",
      ["--rmg-intro-stagger" as any]: `${intro.staggerMs ?? 60}ms`,
      ["--rmg-intro-duration" as any]: `${intro.durationMs ?? 420}ms`,
      ["--rmg-intro-easing" as any]:
        intro.easing ?? "cubic-bezier(.2,.7,.2,1)",
    },
  };

  return (
    <div ref={introRef} {...baseContainerProps}>
      {intro.renderIntro
        ? intro.renderIntro(
            { active: introActive, containerProps: baseContainerProps },
            withPlugins
          )
        : withPlugins}
    </div>
  );
});

export const Slider = React.forwardRef<SliderHandle, Props>(function Slider(
  props,
  forwardedRef
) {
  return <CoreSlider {...props} ref={forwardedRef} />;
});

export default Slider;
