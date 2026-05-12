import * as React from 'react';
import styles from './Grid.module.css';
import {
  BREAKPOINT_MAP,
  effectiveViewportWidth,
  normalizeResponsiveToMinWidthRules,
  resolveNumberFromResponsive,
  type BreakpointMap,
  type ResponsiveNumber,
} from '../shared/responsive';
import { useInViewOnce } from '../shared/hooks/useInViewOnce';
import { useMediaReady } from '../shared/hooks/useMediaReady';
import { LazyItemHost, normalizeLazyLoad } from '../shared/lazy/LazyItemHost';
import { RmgSlideProvider } from '../shared/slideContext';
import { createRmgSlideStoreBag } from '../shared/slideStoreBag';
import { buildStableScopeId } from '../shared/stableScope';
import { useOptionalGalleryCore } from '../core';
import {
  isResponsiveGridSpanMap,
  normalizeResponsiveGridSpanRules,
  resolveGridColumnFromSpan,
  resolveInlineGridItemSpanStyle,
  type GridCell,
  type GridItemLayoutMeta,
} from './item';
import { GridLazyLoadOptions, IntroOptions, ResponsiveGridTemplate, type GridHandle } from './types';

type FullscreenTrigger = 'item' | 'media';

type GridOptions = {
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  fullscreenTrigger?: FullscreenTrigger;
  lazyLoad?: GridLazyLoadOptions;
};

export type GridLayoutProps = {
  cells: GridCell[];
  grid: GridOptions;
  breakpoints?: BreakpointMap;
  viewportWidth: number;
  intro: IntroOptions;
  enableFullscreen: boolean;
  onOpen: (index: number, originEl?: HTMLElement | null) => void;
  registerExpandableImage: (index: number, node: HTMLImageElement | HTMLVideoElement | null) => void;
  gridItemBaseClass?: string;
  renderMode?: 'wrap' | 'passthrough';
};

function isImgEl(el: unknown): el is HTMLImageElement {
  return el instanceof HTMLImageElement;
}

function findImgInside(host: HTMLElement | null): HTMLImageElement | null {
  if (!host) return null;
  if (isImgEl(host)) return host;

  const el = host.querySelector('img');
  return isImgEl(el) ? el : null;
}

function findImgFromClickTarget(target: EventTarget | null): HTMLImageElement | null {
  if (!(target instanceof HTMLElement)) return null;

  const el = target.closest('img');
  return isImgEl(el) ? el : null;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else if (typeof ref === 'object') (ref as any).current = node;
    }
  };
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const warnedGridMessages = new Set<string>();

function warnGridOnce(key: string, message: string) {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return;
  if (warnedGridMessages.has(key)) return;
  warnedGridMessages.add(key);
  console.warn(message);
}

function isResponsiveMap(value: ResponsiveNumber | undefined): value is Record<string, number> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isResponsiveGridTemplateMap(
  value: ResponsiveGridTemplate | undefined
): value is Record<string, string> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function parseBreakpointMinWidth(key: string, breakpointMap: BreakpointMap): number {
  const mapped = breakpointMap[key];
  if (typeof mapped === 'number' && Number.isFinite(mapped)) return mapped;

  const parsed = parseFloat(key);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeResponsiveGridTemplateRules(args: {
  templateColumns: ResponsiveGridTemplate | undefined;
  breakpointMap: BreakpointMap;
}): Array<{ minWidth: number; template: string }> {
  const { templateColumns, breakpointMap } = args;

  if (!isResponsiveGridTemplateMap(templateColumns)) return [];

  const entries = Object.entries(templateColumns)
    .map(([key, template]) => ({
      minWidth: parseBreakpointMinWidth(key, breakpointMap),
      template: typeof template === 'string' ? template.trim() : '',
    }))
    .filter((entry) => entry.template.length > 0)
    .sort((a, b) => a.minWidth - b.minWidth);

  if (entries.length === 0) return [];

  if (entries[0].minWidth > 0) {
    entries.unshift({ minWidth: 0, template: entries[0].template });
  } else if (entries[0].minWidth < 0) {
    entries[0] = { ...entries[0], minWidth: 0 };
  }

  return entries;
}

function resolveGridTemplateFromResponsive(args: {
  templateColumns: ResponsiveGridTemplate | undefined;
  viewportWidth: number;
  breakpointMap: BreakpointMap;
}): string | undefined {
  const { templateColumns, viewportWidth, breakpointMap } = args;

  if (typeof templateColumns === 'string') {
    const trimmed = templateColumns.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  const rules = normalizeResponsiveGridTemplateRules({ templateColumns, breakpointMap });
  if (!rules.length) return undefined;

  const vw = effectiveViewportWidth(viewportWidth);
  let resolved = rules[0]?.template;

  for (const rule of rules) {
    if (vw >= rule.minWidth) resolved = rule.template;
  }

  return resolved;
}

function buildScopedGridResponsiveCss(args: {
  scopeId: string;
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  gap?: ResponsiveNumber;
  breakpointMap: BreakpointMap;
  fallbackGap: number;
}) {
  const { scopeId, columns, templateColumns, gap, breakpointMap, fallbackGap } = args;
  const scopeSelector = `[data-rmg-grid-scope="${scopeId}"]`;
  const targets = `${scopeSelector} [data-rmg-grid-node="true"]`;

  const lines: string[] = [];

  const pushRule = (minWidth: number, declarations: string[]) => {
    if (!declarations.length) return;

    const rule = `${targets}{${declarations.join('')}}`;
    if (minWidth <= 0) {
      lines.push(rule);
      return;
    }

    lines.push(`@media (min-width:${minWidth}px){${rule}}`);
  };

  const templateRules = normalizeResponsiveGridTemplateRules({
    templateColumns,
    breakpointMap,
  });

  if (templateRules.length > 0) {
    for (const rule of templateRules) {
      pushRule(rule.minWidth, [`grid-template-columns:${rule.template};`]);
    }
  } else if (isResponsiveMap(columns)) {
    const rules = normalizeResponsiveToMinWidthRules(columns, 1, breakpointMap);
    for (const rule of rules) {
      pushRule(rule.minWidth, [
        `grid-template-columns:repeat(${Math.max(1, rule.count | 0)}, minmax(0, 1fr));`,
      ]);
    }
  }

  if (isResponsiveMap(gap)) {
    const rules = normalizeResponsiveToMinWidthRules(gap, fallbackGap, breakpointMap);
    for (const rule of rules) {
      pushRule(rule.minWidth, [`--rmg-grid-gap:${Math.max(0, rule.count | 0)}px;`]);
    }
  }

  return lines.join('\n');
}

function buildScopedGridItemSpanCss(args: {
  scopeId: string;
  cells: GridCell[];
  breakpointMap: BreakpointMap;
  allowSpan: boolean;
}) {
  const { scopeId, cells, breakpointMap, allowSpan } = args;
  if (!allowSpan) return '';

  const lines: string[] = [];
  const scopeSelector = `[data-rmg-grid-scope="${scopeId}"]`;

  for (const cell of cells) {
    const span = cell.layoutMeta?.span;
    if (!isResponsiveGridSpanMap(span)) continue;

    const selector = `${scopeSelector} [data-rmg-grid-item-key="${cell.id}"]`;
    const rules = normalizeResponsiveGridSpanRules(span, breakpointMap);

    for (const rule of rules) {
      const gridColumn = resolveGridColumnFromSpan(rule.span);
      if (!gridColumn) continue;

      const cssRule = `${selector}{grid-column:${gridColumn};}`;
      if (rule.minWidth <= 0) {
        lines.push(cssRule);
        continue;
      }

      lines.push(`@media (min-width:${rule.minWidth}px){${cssRule}}`);
    }
  }

  return lines.join('\n');
}

function buildGridItemHostStyle(args: {
  originalStyle?: React.CSSProperties;
  layoutMeta?: GridItemLayoutMeta;
  allowSpan: boolean;
  introStyle: React.CSSProperties & Record<string, any>;
}) {
  const { originalStyle, layoutMeta, allowSpan, introStyle } = args;

  return {
    ...(originalStyle || {}),
    ...(resolveInlineGridItemSpanStyle({
      span: layoutMeta?.span,
      allowSpan,
    }) || {}),
    ...(layoutMeta?.style || {}),
    ...introStyle,
  };
}
export const GridLayout = React.forwardRef<GridHandle, GridLayoutProps>(function GridLayout(
  {
    cells,
    grid,
    breakpoints,
    viewportWidth,
    intro,
    enableFullscreen,
    onOpen,
    registerExpandableImage,
    gridItemBaseClass = 'rmg__grid-item',
    renderMode,
  },
  forwardedRef
) {
  const core = useOptionalGalleryCore();
  const breakpointMap = breakpoints ?? BREAKPOINT_MAP;
  const gridRootRef = React.useRef<HTMLDivElement | null>(null);
  const layoutStoreBag = React.useMemo(() => createRmgSlideStoreBag(), []);
  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);
  const visibleSeenRef = React.useRef(new Set<number>());
  const revealedIndicesRef = React.useRef(new Set<number>());
  const readySubsRef = React.useRef(new Set<(nodes: HTMLElement[]) => void>());
  const readyRef = React.useRef(false);

  const normalizedLazy = React.useMemo(() => normalizeLazyLoad(grid.lazyLoad), [grid.lazyLoad]);
  const lazyEnabled = normalizedLazy.enabled;

  useInViewOnce(true, gridRootRef as any, () => setInView(true));
  useMediaReady(!lazyEnabled, gridRootRef as any, setMediaReady);

  const renderModeProp = renderMode ?? 'wrap';

  const fullscreenTrigger: FullscreenTrigger = grid.fullscreenTrigger ?? 'media';

  const [clientReady, setClientReady] = React.useState(false);

  React.useEffect(() => {
    setClientReady(true);
  }, []);

  const contentReady = lazyEnabled ? clientReady : mediaReady;
  const introActive = contentReady && inView;

  const getItemNodes = React.useCallback(() => {
    const root = gridRootRef.current;
    if (!root) return [];

    return Array.from(root.querySelectorAll('[data-rmg-idx]')).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );
  }, []);

  React.useImperativeHandle(
    forwardedRef,
    () => ({
      getRootNode: () => gridRootRef.current,
      getItemNodes,
      isReady: () => readyRef.current,
      onReady: (callback) => {
        readySubsRef.current.add(callback);
        return () => {
          readySubsRef.current.delete(callback);
        };
      },
    }),
    [getItemNodes]
  );

  React.useEffect(() => {
    readyRef.current = contentReady;
    if (!contentReady) return;

    const nodes = getItemNodes();
    readySubsRef.current.forEach((fn) => fn(nodes));
  }, [contentReady, getItemNodes]);

  React.useEffect(() => {
    visibleSeenRef.current.clear();
  }, [cells.length]);

  React.useEffect(() => {
    revealedIndicesRef.current.clear();
  }, [cells.length]);

  React.useEffect(() => {
    const root = gridRootRef.current;
    if (!root || !core) return;

    const viewportRoot = root.closest('[data-rmg-viewport="true"]') as Element | null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const host = entry.target;
          if (!(host instanceof HTMLElement)) {
            io.unobserve(entry.target);
            continue;
          }

          const idxAttr = host.getAttribute('data-rmg-idx');
          const index = idxAttr != null ? parseInt(idxAttr, 10) : NaN;
          if (!Number.isFinite(index)) {
            io.unobserve(host);
            continue;
          }

          if (!visibleSeenRef.current.has(index)) {
            visibleSeenRef.current.add(index);
            core.notifyBaseVisibleIndex(index);
          }

          io.unobserve(host);
        }
      },
      { root: viewportRoot, rootMargin: '200px', threshold: 0.15 }
    );

    const hosts = Array.from(root.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.hasAttribute('data-rmg-idx')
    );

    hosts.forEach((host) => {
      const idxAttr = host.getAttribute('data-rmg-idx');
      const index = idxAttr != null ? parseInt(idxAttr, 10) : NaN;
      if (!Number.isFinite(index) || visibleSeenRef.current.has(index)) return;
      io.observe(host);
    });

    return () => io.disconnect();
  }, [cells, core, lazyEnabled, renderModeProp]);

  const openFromEvent = React.useCallback(
    (index: number, host: HTMLElement, e: React.SyntheticEvent) => {
      if (!enableFullscreen) return;

      const img =
        fullscreenTrigger === 'media'
          ? findImgFromClickTarget(e.target)
          : findImgInside(host);

      if (!img) return;

      onOpen(index, img);
    },
    [enableFullscreen, fullscreenTrigger, onOpen]
  );

  const onItemClick = React.useCallback(
    (index: number) =>
      (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        openFromEvent(index, e.currentTarget, e);
      },
    [openFromEvent]
  );

  const onItemKeyDown = React.useCallback(
    (index: number) =>
      (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        openFromEvent(index, e.currentTarget, e);
      },
    [openFromEvent]
  );

  const registerFromHostRef = React.useCallback(
    (index: number) =>
      (node: HTMLElement | null) => {
        registerExpandableImage(index, findImgInside(node));
      },
    [registerExpandableImage]
  );

  React.useEffect(() => {
    return () => {
      layoutStoreBag.destroyAll();
    };
  }, [layoutStoreBag]);

  const minWidth =
    typeof grid.minColumnWidth === 'number'
      ? `${grid.minColumnWidth}px`
      : grid.minColumnWidth ?? '160px';

  const fallbackGap =
    typeof grid.gap === 'number' && Number.isFinite(grid.gap)
      ? grid.gap
      : 8;

  const hasResponsiveGap = isResponsiveMap(grid.gap);
  const hasResponsiveTemplateColumns = isResponsiveGridTemplateMap(grid.templateColumns);
  const hasResponsiveColumns = isResponsiveMap(grid.columns);
  const hasExplicitTracks = grid.templateColumns != null || grid.columns != null;

  if (grid.templateColumns != null && (grid.columns != null || grid.minColumnWidth != null)) {
    warnGridOnce(
      'grid-template-columns-precedence',
      '[react-motion-gallery] Grid `templateColumns` overrides `columns` and `minColumnWidth` when they are provided together.'
    );
  }

  if (!hasExplicitTracks && cells.some((cell) => cell.layoutMeta?.span != null)) {
    warnGridOnce(
      'grid-span-autofill-ignored',
      '[react-motion-gallery] Grid item `span` is ignored when the grid is using auto-fill `minColumnWidth` mode. Use `columns` or `templateColumns` to enable spans.'
    );
  }

  const gridScope = React.useMemo(() => {
    return buildStableScopeId('rmg-grid-', {
      columns: grid.columns,
      templateColumns: grid.templateColumns,
      gap: grid.gap,
      breakpointMap,
      fallbackGap,
    });
  }, [grid.columns, grid.templateColumns, grid.gap, breakpointMap, fallbackGap]);

  const gapVal = React.useMemo(() => {
    if (hasResponsiveGap) return undefined;
    if (typeof grid.gap === 'string' && Number.isNaN(parseFloat(grid.gap))) return grid.gap;

    const raw = resolveNumberFromResponsive(
      grid.gap,
      fallbackGap,
      viewportWidth,
      breakpointMap
    );

    return `${Math.max(0, raw | 0)}px`;
  }, [grid.gap, hasResponsiveGap, viewportWidth, breakpointMap, fallbackGap]);

  const resolvedGridTemplateColumns = React.useMemo(
    () =>
      hasResponsiveTemplateColumns
        ? undefined
        : resolveGridTemplateFromResponsive({
            templateColumns: grid.templateColumns,
            viewportWidth,
            breakpointMap,
          }),
    [grid.templateColumns, hasResponsiveTemplateColumns, viewportWidth, breakpointMap]
  );

  const resolvedGridColumnCount = React.useMemo(() => {
    if (grid.templateColumns != null) return undefined;
    if (hasResponsiveColumns) return undefined;
    if (grid.columns == null) return undefined;
    const raw = resolveNumberFromResponsive(grid.columns, 1, viewportWidth, breakpointMap);
    return Math.max(1, raw | 0);
  }, [grid.columns, grid.templateColumns, hasResponsiveColumns, viewportWidth, breakpointMap]);

  const responsiveGridCssText = React.useMemo(
    () =>
      buildScopedGridResponsiveCss({
        scopeId: gridScope,
        columns:
          grid.templateColumns == null && hasResponsiveColumns ? grid.columns : undefined,
        templateColumns: grid.templateColumns,
        gap: hasResponsiveGap ? grid.gap : undefined,
        breakpointMap,
        fallbackGap,
      }),
    [
      gridScope,
      hasResponsiveColumns,
      hasResponsiveTemplateColumns,
      hasResponsiveGap,
      grid.columns,
      grid.templateColumns,
      grid.gap,
      breakpointMap,
      fallbackGap,
    ]
  );

  const responsiveItemCssText = React.useMemo(
    () =>
      buildScopedGridItemSpanCss({
        scopeId: gridScope,
        cells,
        breakpointMap,
        allowSpan: hasExplicitTracks,
      }),
    [gridScope, cells, breakpointMap, hasExplicitTracks]
  );

  const responsiveCssText = React.useMemo(
    () => [responsiveGridCssText, responsiveItemCssText].filter(Boolean).join('\n'),
    [responsiveGridCssText, responsiveItemCssText]
  );

  const gridStyle: React.CSSProperties = React.useMemo(() => {
    const style: React.CSSProperties = {
      ['--rmg-grid-min' as any]: minWidth,
    };

    if (gapVal != null) {
      (style as any)['--rmg-grid-gap'] = gapVal;
    }

    if (resolvedGridTemplateColumns) {
      style.gridTemplateColumns = resolvedGridTemplateColumns;
    } else if (resolvedGridColumnCount && resolvedGridColumnCount > 0) {
      style.gridTemplateColumns = `repeat(${resolvedGridColumnCount}, minmax(0, 1fr))`;
    }

    return style;
  }, [minWidth, gapVal, resolvedGridTemplateColumns, resolvedGridColumnCount]);

  const baseItemClassName = React.useMemo(
    () => cx(gridItemBaseClass, styles.gridItem, styles.introItem, grid.itemClassName),
    [gridItemBaseClass, grid.itemClassName]
  );

  const gridChildren = React.useMemo(() => {
    return cells.map((cell, index) => {
      const original = cell.node;
      const layoutMeta = cell.layoutMeta;
      const scopedOriginal = (
        <RmgSlideProvider
          value={{ normIdx: index, isClone: false, storeBag: layoutStoreBag }}
        >
          {original as any}
        </RmgSlideProvider>
      );

      const introStyle: React.CSSProperties & Record<string, any> = {
        ['--rmg-intro-index' as any]: index,
      };

      const itemClassName = cx(baseItemClassName, layoutMeta?.className);
      const itemStyle = buildGridItemHostStyle({
        layoutMeta,
        allowSpan: hasExplicitTracks,
        introStyle,
      });

      if (lazyEnabled) {
        const originalEl = React.isValidElement(original)
          ? (original as React.ReactElement<any>)
          : null;

        const origProps = (originalEl?.props ?? {}) as {
          onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
          tabIndex?: number;
          ['aria-label']?: string;
        };

        const mergedOnClick: React.MouseEventHandler<HTMLElement> | undefined = enableFullscreen
          ? (e) => {
              if (e.defaultPrevented) return;
              onItemClick(index)(e);
            }
          : undefined;

        const mergedOnKeyDown: React.KeyboardEventHandler<HTMLElement> | undefined = enableFullscreen
          ? (e) => {
              origProps.onKeyDown?.(e);
              if ((e as any).defaultPrevented) return;
              onItemKeyDown(index)(e);
            }
          : undefined;

        return (
          <LazyItemHost
            key={cell.id}
            index={index}
            data-rmg-idx={index}
            data-rmg-grid-item-key={cell.id}
            className={itemClassName}
            style={itemStyle}
            lazyLoad={grid.lazyLoad}
            registerExpandableImage={registerExpandableImage as any}
            revealedIndicesRef={revealedIndicesRef}
            onClick={mergedOnClick}
            onKeyDown={mergedOnKeyDown}
            tabIndex={enableFullscreen ? (origProps.tabIndex ?? 0) : undefined}
            aria-label={
              enableFullscreen
                ? (origProps['aria-label'] ?? `View image ${index + 1}`)
                : undefined
            }
          >
            {scopedOriginal}
          </LazyItemHost>
        );
      }

      if (renderModeProp === 'passthrough') {
        return (
          <div
            key={cell.id}
            data-rmg-idx={index}
            data-rmg-grid-item-key={cell.id}
            className={itemClassName}
            style={itemStyle}
          >
            {scopedOriginal}
          </div>
        );
      }

      if (!React.isValidElement(original) || typeof (original as any).type !== 'string') {
        return (
          <div
            key={cell.id}
            data-rmg-idx={index}
            data-rmg-grid-item-key={cell.id}
            className={itemClassName}
            style={itemStyle}
            onClick={onItemClick(index)}
            onKeyDown={onItemKeyDown(index)}
            tabIndex={0}
            aria-label={`View image ${index + 1}`}
            ref={registerFromHostRef(index) as any}
          >
            {scopedOriginal}
          </div>
        );
      }

      const originalEl = original as React.ReactElement<any>;

      const origProps = (originalEl.props ?? {}) as {
        onClick?: React.MouseEventHandler<HTMLElement>;
        onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
        className?: string;
        style?: React.CSSProperties;
      };

      const origRef = (originalEl as any).ref as React.Ref<HTMLElement> | undefined;

      const mergedOnClick: React.MouseEventHandler<HTMLElement> = (e) => {
        origProps.onClick?.(e);
        if (e.defaultPrevented) return;
        onItemClick(index)(e);
      };

      const mergedOnKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
        origProps.onKeyDown?.(e);
        if ((e as any).defaultPrevented) return;
        onItemKeyDown(index)(e);
      };

      const mergedRef = mergeRefs<HTMLElement>(origRef, registerFromHostRef(index));

      return React.cloneElement(originalEl, {
        key: cell.id,
        ref: mergedRef,
        'data-rmg-idx': index,
        'data-rmg-grid-item-key': cell.id,
        className: cx(itemClassName, origProps.className),
        style: buildGridItemHostStyle({
          originalStyle: origProps.style,
          layoutMeta,
          allowSpan: hasExplicitTracks,
          introStyle,
        }),
        onClick: mergedOnClick,
        onKeyDown: mergedOnKeyDown,
        tabIndex: originalEl.props?.tabIndex ?? 0,
        'aria-label': originalEl.props?.['aria-label'] ?? `View image ${index + 1}`,
        children:
          originalEl.props?.children === undefined ? undefined : (
            <RmgSlideProvider
              value={{ normIdx: index, isClone: false, storeBag: layoutStoreBag }}
            >
              {originalEl.props.children}
            </RmgSlideProvider>
          ),
      });
    });
  }, [
    cells,
    lazyEnabled,
    grid.lazyLoad,
    renderModeProp,
    baseItemClassName,
    hasExplicitTracks,
    enableFullscreen,
    onItemClick,
    onItemKeyDown,
    registerExpandableImage,
    registerFromHostRef,
    layoutStoreBag,
  ]);

  React.useLayoutEffect(() => {
    if (renderModeProp !== 'passthrough' || lazyEnabled) return;

    const root = gridRootRef.current;
    if (!root) return;

    for (let i = 0; i < cells.length; i++) {
      const host = root.querySelector(`[data-rmg-idx="${i}"]`) as HTMLElement | null;
      registerExpandableImage(i, findImgInside(host));
    }

    return () => {
      for (let i = 0; i < cells.length; i++) registerExpandableImage(i, null);
    };
  }, [renderModeProp, lazyEnabled, cells.length, registerExpandableImage]);

  const containerProps: React.HTMLAttributes<HTMLDivElement> = React.useMemo(
    () => ({
      className: cx(
        styles.gridRoot,
        styles.introContainer,
        introActive && styles.introActive,
        grid.rootClassName
      ),
      'data-rmg-grid-node': 'true',
      style: {
        ...gridStyle,
        ['--rmg-intro-stagger' as any]: `${intro.staggerMs}ms`,
        ['--rmg-intro-duration' as any]: `${intro.durationMs}ms`,
        ['--rmg-intro-easing' as any]: intro.easing,
      },
      'aria-busy': contentReady ? undefined : true,
    }),
    [
      grid.rootClassName,
      gridStyle,
      intro.staggerMs,
      intro.durationMs,
      intro.easing,
      introActive,
      contentReady,
    ]
  );

  const inner = (
    <div ref={gridRootRef} {...containerProps}>
      {gridChildren}
    </div>
  );

  const introWrapped = intro.renderIntro
    ? intro.renderIntro({ active: introActive, containerProps }, inner)
    : inner;

  return (
    <div
      className={styles.gridShell}
      data-rmg-grid-scope={gridScope}
    >
      {responsiveCssText ? (
        <style dangerouslySetInnerHTML={{ __html: responsiveCssText }} />
      ) : null}
      {introWrapped}
    </div>
  );
});
