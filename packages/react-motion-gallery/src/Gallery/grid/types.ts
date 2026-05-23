import type { ResponsiveNumber } from "../shared/responsive";

export type RevealOptions = {
  renderReveal?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    content: React.ReactNode
  ) => React.ReactNode;
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  staggerLimit?: number;
};

type FullscreenTrigger = 'item' | 'media';

export type GridSpan = number | "full";
export type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
export type ResponsiveGridTemplate = string | Record<string, string>;

export type GridPluginKind = "lazy-load";

export type GridPluginItemRenderArgs = {
  index: number;
  key: React.Key;
  itemProps: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
  registerExpandableImage: (index: number, node: HTMLImageElement | null) => void;
  revealedIndicesRef: React.RefObject<Set<number>>;
};

export type GridPlugin = {
  readonly __rmgGridPlugin: true;
  readonly kind: GridPluginKind;
  readonly options?: unknown;
  readonly blocksReady?: boolean;
  renderItem?: (
    args: GridPluginItemRenderArgs,
    options?: unknown
  ) => React.ReactNode;
};

export type GridItemProps = {
  span?: ResponsiveGridSpan;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type GridHandle = {
  getRootNode: () => HTMLElement | null;
  getItemNodes: () => HTMLElement[];
  isReady: () => boolean;
  onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};

export type GridOptions = {
  columns?: ResponsiveNumber;
  templateColumns?: ResponsiveGridTemplate;
  minColumnWidth?: number | string;
  gap?: ResponsiveNumber;
  rootClassName?: string;
  itemClassName?: string;
  fullscreenTrigger?: FullscreenTrigger;
  plugins?: GridPlugin[];
  reveal?: RevealOptions;
};
