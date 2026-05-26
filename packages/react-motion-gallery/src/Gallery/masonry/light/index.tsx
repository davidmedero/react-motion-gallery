"use client";

import * as React from "react";

import {
  BREAKPOINT_MAP,
  DEFAULT_SERVER_VIEWPORT_WIDTH,
  type BreakpointMap,
  type ResponsiveNumber,
} from "../../shared/responsive";
import { useInViewOnce } from "../../shared/hooks/useInViewOnce";
import { useViewportWidth } from "../../shared/hooks/useViewportWidth";
import { useSkeletonRevealGate } from "../../shared/loading/skeletonRevealGate";
import styles from "./MasonryLight.module.css";
import {
  buildDimensionedMasonryLayout,
  buildDimensionedMasonryFluidLayout,
  resolveMasonryColumns,
  resolveMasonryGap,
  type MasonryPlacement,
  type MasonrySpan,
  type ResponsiveMasonrySpan,
} from "./placement";
import type { MasonryPlugin } from "./types";

export type {
  MasonryPlacement,
  MasonrySpan,
  ResponsiveMasonrySpan,
} from "./placement";

export type MasonryClassNames = {
  root?: string;
  item?: string;
};

export type MasonryRevealOptions = {
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  disabled?: boolean;
};

export type MasonryItemProps = {
  width: number;
  height: number;
  span?: ResponsiveMasonrySpan;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type MasonryHandle = {
  getRootNode: () => HTMLElement | null;
  getItemNodes: () => HTMLElement[];
  isReady: () => boolean;
  onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};

export type MasonryOptions = {
  columns?: ResponsiveNumber;
  gap?: ResponsiveNumber;
  placement?: MasonryPlacement;
  plugins?: MasonryPlugin[];
  as?: React.ElementType;
  rootRef?: React.Ref<HTMLElement>;
  classNames?: MasonryClassNames;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  breakpoints?: BreakpointMap;
  reveal?: MasonryRevealOptions;
  revealReady?: boolean;
};

type MasonryItemComponent = React.FC<MasonryItemProps> & {
  __rmgLightMasonryItem: true;
};

type MasonryComponent = React.ForwardRefExoticComponent<
  MasonryOptions & React.RefAttributes<MasonryHandle>
> & {
  Item: MasonryItemComponent;
};

type MasonryCell = MasonryItemProps & {
  id: number;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.MutableRefObject<T | null>).current = value;
}

function getItemNodes(root: HTMLElement | null) {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>("[data-rmg-idx]"));
}

function isMasonryPlugin(value: unknown): value is MasonryPlugin {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as MasonryPlugin).__rmgLightMasonryPlugin === true
  );
}

function normalizeReveal(src: MasonryRevealOptions | undefined) {
  return {
    staggerMs: src?.staggerMs ?? 160,
    durationMs: src?.durationMs ?? 600,
    easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
    disabled: src?.disabled === true,
  };
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const commit = (nextWidth: number | undefined) => {
      const next = Number(nextWidth);
      if (!Number.isFinite(next) || next <= 0) return;
      setWidth((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
    };
    const read = () => commit(node.getBoundingClientRect().width);

    read();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", read);
      return () => window.removeEventListener("resize", read);
    }

    const observer = new ResizeObserver((entries) => {
      commit(entries[0]?.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export const MasonryItem = Object.assign(
  function MasonryItem({ children }: MasonryItemProps) {
    return <>{children}</>;
  },
  {
    __rmgLightMasonryItem: true as const,
    displayName: "Masonry.Item",
  }
) as MasonryItemComponent;

function isMasonryItemElement(
  node: React.ReactNode
): node is React.ReactElement<MasonryItemProps> {
  return (
    React.isValidElement(node) &&
    Boolean((node.type as any)?.__rmgLightMasonryItem)
  );
}

function collectCells(children: React.ReactNode): MasonryCell[] {
  return React.Children.toArray(children)
    .filter(isMasonryItemElement)
    .map((child, index) => ({
      id: index,
      width: child.props.width,
      height: child.props.height,
      span: child.props.span,
      className: child.props.className,
      style: child.props.style,
      children: child.props.children,
    }));
}

const MasonryImpl = React.forwardRef<MasonryHandle, MasonryOptions>(
  function MasonryImpl(
    {
      columns,
      gap,
      placement = "balanced",
      plugins,
      as: RootComponent = "div",
      rootRef,
      classNames,
      className,
      style,
      children,
      breakpoints,
      reveal: revealProp,
      revealReady = true,
    },
    forwardedRef
  ) {
    const skeletonRevealGate = useSkeletonRevealGate();
    const rootNodeRef = React.useRef<HTMLElement | null>(null);
    const readySubsRef = React.useRef(new Set<(nodes: HTMLElement[]) => void>());
    const readyRef = React.useRef(false);
    const revealedIndicesRef = React.useRef(new Set<number>());
    const [clientReady, setClientReady] = React.useState(false);
    const [inView, setInView] = React.useState(false);
    const measuredWidth = useElementWidth(rootNodeRef);
    const viewportWidth = useViewportWidth() || DEFAULT_SERVER_VIEWPORT_WIDTH;
    const reveal = React.useMemo(() => normalizeReveal(revealProp), [revealProp]);
    const effectiveBreakpoints = React.useMemo(
      () => ({ ...BREAKPOINT_MAP, ...(breakpoints ?? {}) }),
      [breakpoints]
    );
    const cells = React.useMemo(() => collectCells(children), [children]);
    const activePlugins = React.useMemo(
      () => (plugins ?? []).filter(isMasonryPlugin),
      [plugins]
    );
    const pluginItemEntry = React.useMemo(
      () => activePlugins.find((plugin) => plugin.renderItem),
      [activePlugins]
    );
    const columnCount = resolveMasonryColumns({
      columns,
      viewportWidth,
      breakpointMap: effectiveBreakpoints,
    });
    const gapPx = resolveMasonryGap({
      gap,
      viewportWidth,
      breakpointMap: effectiveBreakpoints,
    });
    const hasMeasuredWidth = measuredWidth > 0;
    const layoutWidth = hasMeasuredWidth ? measuredWidth : viewportWidth;
    const layout = React.useMemo(
      () =>
        buildDimensionedMasonryLayout({
          items: cells,
          columnCount,
          gapPx,
          containerWidth: layoutWidth,
          placement,
          viewportWidth,
          breakpointMap: effectiveBreakpoints,
        }),
      [
        cells,
        columnCount,
        gapPx,
        layoutWidth,
        placement,
        viewportWidth,
        effectiveBreakpoints,
      ]
    );
    const fluidLayout = React.useMemo(
      () =>
        hasMeasuredWidth
          ? null
          : buildDimensionedMasonryFluidLayout({
              items: cells,
              columnCount,
              gapPx,
              placement,
              viewportWidth,
              breakpointMap: effectiveBreakpoints,
            }),
      [
        cells,
        columnCount,
        gapPx,
        hasMeasuredWidth,
        placement,
        viewportWidth,
        effectiveBreakpoints,
      ]
    );
    const ready = cells.length === 0 || measuredWidth > 0;
    const revealActive =
      reveal.disabled ||
      (clientReady && inView && revealReady && (skeletonRevealGate ?? true));

    const onInView = React.useCallback(() => {
      setInView(true);
    }, []);

    const mergedRootRef = React.useCallback(
      (node: HTMLElement | null) => {
        rootNodeRef.current = node;
        assignRef(rootRef, node);
      },
      [rootRef]
    );

    React.useEffect(() => {
      setClientReady(true);
    }, []);

    React.useEffect(() => {
      revealedIndicesRef.current.clear();
    }, [cells.length]);

    useInViewOnce(!reveal.disabled, rootNodeRef, onInView);

    const handle = React.useMemo<MasonryHandle>(
      () => ({
        getRootNode: () => rootNodeRef.current,
        getItemNodes: () => getItemNodes(rootNodeRef.current),
        isReady: () => readyRef.current,
        onReady: (callback) => {
          readySubsRef.current.add(callback);
          return () => {
            readySubsRef.current.delete(callback);
          };
        },
      }),
      []
    );

    const pluginHost = React.useMemo(
      () => ({
        handle,
        itemCount: cells.length,
        ready,
      }),
      [cells.length, handle, ready]
    );

    React.useImperativeHandle(forwardedRef, () => handle, [handle]);

    React.useEffect(() => {
      readyRef.current = ready;
      if (!ready) return;
      const nodes = getItemNodes(rootNodeRef.current);
      readySubsRef.current.forEach((callback) => callback(nodes));
    }, [ready, layout.height]);

    return (
      <RootComponent
        ref={mergedRootRef}
        className={cx(
          styles.root,
          !reveal.disabled && styles.revealContainer,
          !reveal.disabled && revealActive && styles.revealActive,
          classNames?.root,
          className
        )}
        style={{
          height: fluidLayout?.height ?? layout.height,
          ["--rmg-cols" as any]: columnCount,
          ["--rmg-gap" as any]: `${gapPx}px`,
          ["--rmg-reveal-stagger" as any]: `${reveal.staggerMs}ms`,
          ["--rmg-reveal-duration" as any]: `${reveal.durationMs}ms`,
          ["--rmg-reveal-easing" as any]: reveal.easing,
          ...style,
        }}
      >
        {cells.map((cell, index) => {
          const item = layout.items[index];
          const fluidItem = fluidLayout?.items[index];
          if (!item) return null;

          const itemProps = {
            "data-rmg-idx": index,
            className: cx(
              styles.item,
              "rmg__masonry-item",
              classNames?.item,
              cell.className
            ),
            style: {
              top: fluidItem?.top ?? item.top,
              left: fluidItem?.left ?? item.left,
              width: fluidItem?.width ?? item.width,
              height: fluidItem?.height ?? item.height,
              ["--rmg-reveal-index" as any]: index,
              ...cell.style,
            },
          } as React.HTMLAttributes<HTMLDivElement>;

          const itemRef = (_node: HTMLDivElement | null) => {};

          if (pluginItemEntry?.renderItem) {
            return (
              <React.Fragment key={cell.id}>
                {pluginItemEntry.renderItem(
                  {
                    index,
                    itemRef,
                    itemProps,
                    children: cell.children,
                    revealedIndicesRef,
                  },
                  pluginItemEntry.options
                )}
              </React.Fragment>
            );
          }

          return (
            <div
              key={cell.id}
              {...itemProps}
            >
              {cell.children}
            </div>
          );
        })}
        {activePlugins.map((plugin, index) => {
          const Runtime = plugin.Runtime;
          return Runtime ? (
            <Runtime
              key={`${plugin.kind}-${index}`}
              host={pluginHost}
              options={plugin.options}
            />
          ) : null;
        })}
      </RootComponent>
    );
  }
);

const Masonry = Object.assign(MasonryImpl, {
  Item: MasonryItem,
}) as MasonryComponent;

export default Masonry;
export { Masonry };
export type {
  MasonryPlugin,
  MasonryPluginHost,
  MasonryPluginKind,
  MasonryPluginRuntimeProps,
} from "./types";
