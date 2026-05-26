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
import { useSkeletonRevealGate } from '../shared/loading/skeletonRevealGate';
import { RmgSlideProvider } from '../shared/slideContext';
import { createRmgSlideStoreBag } from '../shared/slideStoreBag';
import { buildStableScopeId } from '../shared/stableScope';
import {
  isResponsiveGridSpanMap,
  normalizeResponsiveGridSpanRules,
  resolveGridColumnFromSpan,
  resolveInlineGridItemSpanStyle,
  type GridCell,
  type GridItemLayoutMeta,
} from './item';
import {
  RevealOptions,
  ResponsiveGridTemplate,
  type GridFullscreenTrigger,
  type GridHandle,
  type GridPlugin,
} from './types';

type GridOptions = {
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  fullscreenTrigger?: GridFullscreenTrigger;
  plugins?: GridPlugin[];
};

export type GridLayoutProps = {
  cells: GridCell[];
  grid: GridOptions;
  breakpoints?: BreakpointMap;
  viewportWidth: number;
  reveal: RevealOptions;
  gridItemBaseClass?: string;
  revealReady?: boolean;
  renderMode?: 'wrap' | 'passthrough';
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function isGridPlugin(value: unknown): value is GridPlugin {
  return (
    typeof value === 'object' &&
    value != null &&
    (value as GridPlugin).__rmgGridPlugin === true
  );
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
  revealStyle: React.CSSProperties & Record<string, any>;
}) {
  const { originalStyle, layoutMeta, allowSpan, revealStyle } = args;

  return {
    ...(originalStyle || {}),
    ...(resolveInlineGridItemSpanStyle({
      span: layoutMeta?.span,
      allowSpan,
    }) || {}),
    ...(layoutMeta?.style || {}),
    ...revealStyle,
  };
}
export const GridLayout = React.forwardRef<GridHandle, GridLayoutProps>(function GridLayout(
  {
    cells,
    grid,
    breakpoints,
    viewportWidth,
    reveal,
    gridItemBaseClass = 'rmg__grid-item',
    revealReady = true,
    renderMode,
  },
  forwardedRef
) {
  const breakpointMap = breakpoints ?? BREAKPOINT_MAP;
  const gridRootRef = React.useRef<HTMLDivElement | null>(null);
  const skeletonRevealGate = useSkeletonRevealGate();
  const layoutStoreBag = React.useMemo(() => createRmgSlideStoreBag(), []);
  const [inView, setInView] = React.useState(false);
  const [mediaReady, setMediaReady] = React.useState(false);
  const revealedIndicesRef = React.useRef(new Set<number>());
  const readySubsRef = React.useRef(new Set<(nodes: HTMLElement[]) => void>());
  const readyRef = React.useRef(false);

  const pluginEntries = React.useMemo(
    () => (grid.plugins ?? []).filter(isGridPlugin),
    [grid.plugins]
  );
  const pluginItemEntry = React.useMemo(
    () => pluginEntries.find((plugin) => plugin.renderItem),
    [pluginEntries]
  );
  const pluginBlocksMediaReady = React.useMemo(
    () => pluginEntries.some((plugin) => plugin.blocksReady),
    [pluginEntries]
  );
  const noopRegisterExpandableImage = React.useCallback(
    (_index: number, _node: HTMLImageElement | null) => {},
    []
  );

  useInViewOnce(true, gridRootRef as any, () => setInView(true));
  useMediaReady(!pluginBlocksMediaReady, gridRootRef as any, setMediaReady);

  const renderModeProp = renderMode ?? 'wrap';

  const fullscreenTrigger: GridFullscreenTrigger = grid.fullscreenTrigger ?? 'media';

  const [clientReady, setClientReady] = React.useState(false);

  React.useEffect(() => {
    setClientReady(true);
  }, []);

  const contentReady = pluginBlocksMediaReady ? clientReady : mediaReady;
  const revealDisabled = reveal.disabled === true;
  const revealActive =
    revealDisabled ||
    (contentReady && inView && revealReady && (skeletonRevealGate ?? true));

  const getItemNodes = React.useCallback(() => {
    const root = gridRootRef.current;
    if (!root) return [];

    return Array.from(root.querySelectorAll('[data-rmg-idx]')).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );
  }, []);

  const handle = React.useMemo<GridHandle>(
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

  React.useImperativeHandle(
    forwardedRef,
    () => handle,
    [handle]
  );

  React.useEffect(() => {
    readyRef.current = contentReady;
    if (!contentReady) return;

    const nodes = getItemNodes();
    readySubsRef.current.forEach((fn) => fn(nodes));
  }, [contentReady, getItemNodes]);

  React.useEffect(() => {
    revealedIndicesRef.current.clear();
  }, [cells.length]);

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
    () => cx(gridItemBaseClass, styles.gridItem, styles.revealItem, grid.itemClassName),
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

      const revealStyle: React.CSSProperties & Record<string, any> = {
        ['--rmg-reveal-index' as any]: index,
      };

      const itemClassName = cx(baseItemClassName, layoutMeta?.className);
      const itemStyle = buildGridItemHostStyle({
        layoutMeta,
        allowSpan: hasExplicitTracks,
        revealStyle,
      });

      if (pluginItemEntry?.renderItem) {
        const itemProps = {
          'data-rmg-idx': index,
          'data-rmg-grid-item-key': cell.id,
          className: itemClassName,
          style: itemStyle,
        } as React.HTMLAttributes<HTMLDivElement>;

        return pluginItemEntry.renderItem(
          {
            index,
            key: cell.id,
            itemProps,
            children: scopedOriginal,
            registerExpandableImage: noopRegisterExpandableImage,
            revealedIndicesRef,
          },
          pluginItemEntry.options
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

      return React.cloneElement(originalEl, {
        key: cell.id,
        'data-rmg-idx': index,
        'data-rmg-grid-item-key': cell.id,
        className: cx(itemClassName, origProps.className),
        style: buildGridItemHostStyle({
          originalStyle: origProps.style,
          layoutMeta,
          allowSpan: hasExplicitTracks,
          revealStyle,
        }),
        onClick: origProps.onClick,
        onKeyDown: origProps.onKeyDown,
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
    pluginItemEntry,
    renderModeProp,
    baseItemClassName,
    hasExplicitTracks,
    noopRegisterExpandableImage,
    layoutStoreBag,
  ]);

  const containerProps: React.HTMLAttributes<HTMLDivElement> = React.useMemo(
    () => ({
      className: cx(
        styles.gridRoot,
        !revealDisabled && styles.revealContainer,
        !revealDisabled && revealActive && styles.revealActive,
        grid.rootClassName
      ),
      'data-rmg-grid-node': 'true',
      style: {
        ...gridStyle,
        ['--rmg-reveal-stagger' as any]: `${reveal.staggerMs}ms`,
        ['--rmg-reveal-duration' as any]: `${reveal.durationMs}ms`,
        ['--rmg-reveal-easing' as any]: reveal.easing,
      },
      'aria-busy': contentReady ? undefined : true,
    }),
    [
      grid.rootClassName,
      gridStyle,
      reveal.staggerMs,
      reveal.durationMs,
      reveal.easing,
      revealDisabled,
      revealActive,
      contentReady,
      revealReady,
    ]
  );

  const inner = (
    <div ref={gridRootRef} {...containerProps}>
      {gridChildren}
    </div>
  );

  const revealWrapped = reveal.renderReveal
    ? reveal.renderReveal({ active: revealActive, containerProps }, inner)
    : inner;

  const pluginHost = React.useMemo(
    () => ({
      handle,
      itemCount: cells.length,
      ready: contentReady,
      fullscreenTrigger,
    }),
    [cells.length, contentReady, fullscreenTrigger, handle]
  );

  return (
    <div
      className={styles.gridShell}
      data-rmg-grid-scope={gridScope}
    >
      {responsiveCssText ? (
        <style dangerouslySetInnerHTML={{ __html: responsiveCssText }} />
      ) : null}
      {revealWrapped}
      {pluginEntries.map((plugin, index) => {
        const Runtime = plugin.Runtime;
        return Runtime ? (
          <Runtime
            key={`${plugin.kind}-${index}`}
            host={pluginHost}
            options={plugin.options}
          />
        ) : null;
      })}
    </div>
  );
});
