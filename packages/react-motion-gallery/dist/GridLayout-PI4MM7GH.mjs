import { useInViewOnce, useMediaReady } from './chunk-5N4BKPSV.mjs';
import { Gallery_default } from './chunk-SAZMF4ZD.mjs';
import { resolveNumberFromResponsive } from './chunk-AD5YPMDD.mjs';
import * as React from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

function GridLayout({
  cells,
  grid,
  breakpoints,
  viewportWidth,
  loading,
  intro,
  enableFullscreen,
  onOpen,
  registerExpandableImg,
  gridItemBaseClass = "rmg__grid-item",
  renderMode
}) {
  const gridRootRef = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);
  useInViewOnce(true, gridRootRef, () => setInView(true));
  useMediaReady(true, gridRootRef, setMediaReady);
  const isLoading = loading.isLoading ?? !mediaReady;
  const introActive = !isLoading && inView;
  const minWidth = typeof grid.minColumnWidth === "number" ? `${grid.minColumnWidth}px` : grid.minColumnWidth ?? "160px";
  const gapVal = React.useMemo(() => {
    if (typeof grid.gap === "string" && Number.isNaN(parseFloat(grid.gap))) return grid.gap;
    const raw = resolveNumberFromResponsive(
      grid.gap,
      typeof grid.gap === "number" ? grid.gap : 8,
      viewportWidth,
      breakpoints
    );
    const px = Math.max(0, raw | 0);
    return `${px}px`;
  }, [grid.gap, viewportWidth, breakpoints]);
  const resolvedGridColumnCount = React.useMemo(() => {
    if (grid.columns == null) return void 0;
    const raw = resolveNumberFromResponsive(grid.columns, 1, viewportWidth, breakpoints);
    return Math.max(1, raw | 0);
  }, [grid.columns, viewportWidth, breakpoints]);
  const gridStyle = {
    ["--rmg-grid-min"]: minWidth,
    ["--rmg-grid-gap"]: gapVal
  };
  if (resolvedGridColumnCount && resolvedGridColumnCount > 0) {
    gridStyle.gridTemplateColumns = `repeat(${resolvedGridColumnCount}, minmax(0, 1fr))`;
  }
  const skeletonCount = cells.length;
  const defaultGridSkeleton = /* @__PURE__ */ jsx("div", { className: Gallery_default.gridSkeletonOverlay, children: /* @__PURE__ */ jsx(
    "div",
    {
      className: [Gallery_default.gridSkeletonGrid, grid.rootClassName || ""].filter(Boolean).join(" "),
      style: gridStyle,
      children: Array.from({ length: skeletonCount }).map((_, i) => /* @__PURE__ */ jsx("div", { className: Gallery_default.gridSkeletonItem }, `rmg-grid-skel-${i}`))
    }
  ) });
  const loadingNode = isLoading ? loading.renderLoading ? loading.renderLoading({ layout: "grid", count: skeletonCount }) : defaultGridSkeleton : null;
  const renderModeProp = renderMode ?? "wrap";
  const gridChildren = React.useMemo(() => {
    return cells.map((cell, index) => {
      const original = cell.node;
      const introStyle = {
        ["--rmg-intro-index"]: index
      };
      const baseClassName = [
        gridItemBaseClass,
        Gallery_default.gridItem,
        Gallery_default.introItem,
        grid.itemClassName || ""
      ].filter(Boolean).join(" ");
      if (renderModeProp === "passthrough") {
        return /* @__PURE__ */ jsx(
          "div",
          {
            "data-rmg-idx": index,
            className: baseClassName,
            style: introStyle,
            children: original
          },
          cell.id
        );
      }
      if (!React.isValidElement(original)) {
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "data-rmg-idx": index,
            className: baseClassName,
            style: introStyle,
            onClick: (e) => {
              e.preventDefault();
              if (!enableFullscreen) return;
              onOpen(index, e.currentTarget);
            },
            children: original
          },
          cell.id
        );
      }
      const originalEl = original;
      const origProps = originalEl.props ?? {};
      const origRef = originalEl.ref;
      const mergedRef = (node) => {
        if (typeof origRef === "function") origRef(node);
        else if (origRef && typeof origRef === "object") origRef.current = node;
        registerExpandableImg(index, node);
      };
      const mergedOnClick = (e) => {
        origProps.onClick?.(e);
        if (e.defaultPrevented) return;
        if (!enableFullscreen) return;
        onOpen(index, e.currentTarget);
      };
      return React.cloneElement(originalEl, {
        key: cell.id,
        ref: mergedRef,
        onClick: mergedOnClick,
        "data-rmg-idx": index,
        className: [baseClassName, origProps.className || ""].filter(Boolean).join(" "),
        style: { ...origProps.style || {}, ...introStyle }
      });
    });
  }, [
    cells,
    enableFullscreen,
    onOpen,
    registerExpandableImg,
    grid.itemClassName,
    gridItemBaseClass,
    renderModeProp
  ]);
  React.useLayoutEffect(() => {
    if (renderModeProp !== "passthrough") return;
    const root = gridRootRef.current;
    if (!root) return;
    for (let i = 0; i < cells.length; i++) {
      const host = root.querySelector(`[data-rmg-idx="${i}"]`);
      if (!host) {
        registerExpandableImg(i, null);
        continue;
      }
      const img = host.querySelector("img");
      registerExpandableImg(i, img ?? host);
    }
    return () => {
      for (let i = 0; i < cells.length; i++) registerExpandableImg(i, null);
    };
  }, [renderModeProp, cells.length, registerExpandableImg]);
  const containerProps = {
    className: [
      Gallery_default.gridRoot,
      Gallery_default.introContainer,
      introActive ? Gallery_default.introActive : "",
      grid.rootClassName || ""
    ].filter(Boolean).join(" "),
    style: {
      ...gridStyle,
      ["--rmg-intro-stagger"]: `${intro.staggerMs}ms`,
      ["--rmg-intro-transform"]: intro.transform,
      ["--rmg-intro-duration"]: `${intro.durationMs}ms`,
      ["--rmg-intro-easing"]: intro.easing
    },
    "aria-busy": isLoading ? true : void 0
  };
  const inner = /* @__PURE__ */ jsx("div", { ref: gridRootRef, ...containerProps, children: gridChildren });
  const introWrapped = intro.renderIntro ? intro.renderIntro({ active: introActive, containerProps }, inner) : inner;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    loadingNode,
    introWrapped
  ] });
}

export { GridLayout };
//# sourceMappingURL=GridLayout-PI4MM7GH.mjs.map
//# sourceMappingURL=GridLayout-PI4MM7GH.mjs.map