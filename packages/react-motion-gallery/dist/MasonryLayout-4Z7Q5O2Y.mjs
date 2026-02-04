import { useInViewOnce, useMediaReady } from './chunk-5N4BKPSV.mjs';
import { Gallery_default } from './chunk-SAZMF4ZD.mjs';
import { resolveNumberFromResponsive, parseNumberLike } from './chunk-AD5YPMDD.mjs';
import * as React from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

var Masonry = ({
  items,
  masonryColumns,
  masonryGap,
  masonryPlacement = "balanced",
  masonryEstimatedItemHeight = 0,
  masonryClassNames,
  masonryStyle,
  masonryAs: RootComponent = "div",
  masonryRootRef,
  breakpoints
}) => {
  const DEFAULT_MASONRY_COLUMNS = 4;
  const DEFAULT_MASONRY_GAP_PX = 8;
  const [viewportWidth, setViewportWidth] = React.useState(() => {
    if (typeof window === "undefined") return 0;
    return window.innerWidth;
  });
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [heights, setHeights] = React.useState(
    () => items.map(() => masonryEstimatedItemHeight)
  );
  React.useEffect(() => {
    setHeights((prev) => {
      const next = [];
      for (let i = 0; i < items.length; i++) {
        next[i] = prev[i] ?? masonryEstimatedItemHeight;
      }
      return next;
    });
  }, [items.length, masonryEstimatedItemHeight]);
  const columnCount = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryColumns,
      DEFAULT_MASONRY_COLUMNS,
      viewportWidth,
      breakpoints
    );
    return Math.max(1, raw | 0);
  }, [masonryColumns, viewportWidth, breakpoints]);
  const gapPx = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonryGap,
      DEFAULT_MASONRY_GAP_PX,
      viewportWidth,
      breakpoints
    );
    return Math.max(0, parseNumberLike(raw, DEFAULT_MASONRY_GAP_PX));
  }, [masonryGap, viewportWidth, breakpoints]);
  const [colIndex, setColIndex] = React.useState(
    () => items.map(
      (_, i) => masonryPlacement === "roundRobin" ? i % Math.max(1, columnCount) : 0
    )
  );
  React.useEffect(() => {
    const layout = new Array(items.length);
    if (masonryPlacement === "roundRobin") {
      for (let i = 0; i < items.length; i++) {
        layout[i] = i % columnCount;
      }
    } else {
      const colHeights = new Array(columnCount).fill(0);
      for (let i = 0; i < items.length; i++) {
        const h = heights[i] ?? masonryEstimatedItemHeight;
        let minCol = 0;
        let minVal = colHeights[0];
        for (let c = 1; c < columnCount; c++) {
          if (colHeights[c] < minVal) {
            minVal = colHeights[c];
            minCol = c;
          }
        }
        layout[i] = minCol;
        colHeights[minCol] += h + gapPx;
      }
    }
    setColIndex(layout);
  }, [
    items.length,
    heights,
    columnCount,
    masonryPlacement,
    gapPx,
    masonryEstimatedItemHeight
  ]);
  const handleHeight = React.useCallback((index, height) => {
    setHeights((prev) => {
      const old = prev[index];
      if (old === height) return prev;
      const next = prev.slice();
      next[index] = height;
      return next;
    });
  }, []);
  const columnsChildren = React.useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    items.forEach((child, index) => {
      let c = colIndex[index];
      if (c == null || c < 0 || c >= columnCount) {
        c = masonryPlacement === "roundRobin" ? index % columnCount : 0;
      }
      cols[c].push(
        /* @__PURE__ */ jsx(
          MasonryItem,
          {
            index,
            onHeight: handleHeight,
            className: masonryClassNames?.item,
            gapPx,
            children: child
          },
          index
        )
      );
    });
    return cols;
  }, [
    items,
    colIndex,
    columnCount,
    masonryPlacement,
    handleHeight,
    gapPx,
    masonryClassNames?.item
  ]);
  return /* @__PURE__ */ jsx(
    RootComponent,
    {
      ref: masonryRootRef,
      className: masonryClassNames?.root,
      style: {
        display: "flex",
        alignItems: "flex-start",
        columnGap: gapPx,
        rowGap: 0,
        width: "100%",
        ...masonryStyle || {}
      },
      children: columnsChildren.map((colChildren, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: masonryClassNames?.column,
          style: {
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column"
          },
          children: colChildren
        },
        i
      ))
    }
  );
};
var MasonryItem = ({
  index,
  onHeight,
  className,
  gapPx,
  children
}) => {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => onHeight(index, el.offsetHeight);
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeight(index, entry.contentRect.height);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
    return;
  }, [index, onHeight]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className,
      "data-rmg-idx": index,
      style: {
        marginBottom: gapPx,
        ["--rmg-intro-index"]: index
      },
      children
    }
  );
};
var DefaultMasonrySkeleton = ({
  count,
  columnCount,
  gapPx,
  classNames
}) => {
  const cols = Array.from(
    { length: Math.max(1, columnCount | 0) },
    () => []
  );
  const ratios = [55, 90, 130, 75];
  for (let i = 0; i < count; i++) {
    const pb = ratios[i % ratios.length];
    const colIdx = i % cols.length;
    cols[colIdx].push(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: classNames?.item,
          style: {
            paddingBottom: `${pb}%`,
            marginBottom: gapPx
          }
        },
        `rmg-mskel-${i}`
      )
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: classNames?.root,
      style: {
        display: "flex",
        alignItems: "flex-start",
        columnGap: gapPx,
        rowGap: 0,
        width: "100%"
      },
      children: cols.map((children, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: classNames?.column,
          style: {
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column"
          },
          children
        },
        i
      ))
    }
  );
};
function assignRef(ref, value) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}
function MasonryLayout({
  items,
  masonry,
  breakpoints,
  viewportWidth,
  loading,
  intro,
  skeletonCount
}) {
  const localRootRef = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);
  useInViewOnce(true, localRootRef, () => setInView(true));
  useMediaReady(true, localRootRef, setMediaReady);
  const isLoading = loading.isLoading ?? !mediaReady;
  const introActive = !isLoading && inView;
  const DEFAULT_MASONRY_COLUMNS = 4;
  const DEFAULT_MASONRY_GAP_PX = 8;
  const masonryColumnCount = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonry.columns,
      DEFAULT_MASONRY_COLUMNS,
      viewportWidth,
      breakpoints
    );
    return Math.max(1, raw | 0);
  }, [masonry.columns, viewportWidth, breakpoints]);
  const masonryGapPx = React.useMemo(() => {
    const raw = resolveNumberFromResponsive(
      masonry.gap,
      DEFAULT_MASONRY_GAP_PX,
      viewportWidth,
      breakpoints
    );
    return Math.max(0, parseNumberLike(raw, DEFAULT_MASONRY_GAP_PX));
  }, [masonry.gap, viewportWidth, breakpoints]);
  const defaultMasonrySkeleton = /* @__PURE__ */ jsx("div", { className: Gallery_default.gridSkeletonOverlay, children: /* @__PURE__ */ jsx(
    DefaultMasonrySkeleton,
    {
      count: skeletonCount,
      columnCount: masonryColumnCount,
      gapPx: masonryGapPx,
      classNames: {
        root: Gallery_default.gridSkeletonMasonryRoot,
        column: Gallery_default.gridSkeletonMasonryCol,
        item: Gallery_default.gridSkeletonItem
      }
    }
  ) });
  const loadingNode = isLoading ? loading.renderLoading ? loading.renderLoading({ layout: "masonry", count: skeletonCount }) : defaultMasonrySkeleton : null;
  const masonryRootClassName = [
    Gallery_default.masonryRoot,
    Gallery_default.introContainer,
    introActive ? Gallery_default.introActive : "",
    masonry.classNames?.root || ""
  ].filter(Boolean).join(" ");
  const mergedRootRef = React.useCallback((node) => {
    localRootRef.current = node;
    assignRef(masonry.rootRef, node);
  }, [masonry.rootRef]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    loadingNode,
    /* @__PURE__ */ jsx(
      Masonry,
      {
        items,
        masonryColumns: masonry.columns,
        masonryGap: masonry.gap,
        masonryPlacement: masonry.placement ?? "balanced",
        masonryEstimatedItemHeight: masonry.estimatedItemHeight,
        masonryClassNames: {
          root: masonryRootClassName,
          column: [Gallery_default.masonryCol, masonry.classNames?.column].filter(Boolean).join(" "),
          item: [Gallery_default.masonryItem, masonry.classNames?.item].filter(Boolean).join(" ")
        },
        masonryStyle: {
          ["--rmg-intro-stagger"]: `${intro.staggerMs}ms`,
          ["--rmg-intro-transform"]: intro.transform,
          ["--rmg-intro-duration"]: `${intro.durationMs}ms`,
          ["--rmg-intro-easing"]: intro.easing
        },
        masonryAs: masonry.as ?? "div",
        masonryRootRef: mergedRootRef,
        breakpoints
      }
    )
  ] });
}

export { MasonryLayout };
//# sourceMappingURL=MasonryLayout-4Z7Q5O2Y.mjs.map
//# sourceMappingURL=MasonryLayout-4Z7Q5O2Y.mjs.map