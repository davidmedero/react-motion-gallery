import type { LoadingForceOptions } from "../shared/loading/force";
import type { ResponsiveNumber } from "../shared/responsive";
import type { SkeletonCacheOptions } from "../skeleton/cache";
import type { GridSkeletonSpec } from "../skeleton/grid";

export type RevealOptions = {
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  disabled?: boolean;
  staggerLimit?: number;
};

export type GridLoadingSkeletonArgs = {
  index: number;
  key: React.Key;
  revealKey?: React.Key;
  placeholder: boolean;
  ready: boolean;
};

export type GridLoadingOptions = {
  enabled?: boolean;
  active?: boolean;
  count?: number;
  skeleton?:
    | GridSkeletonSpec
    | ((args: GridLoadingSkeletonArgs) => React.ReactNode);
  cache?: SkeletonCacheOptions;
  force?: LoadingForceOptions;
  timing?: {
    enterMs?: number;
    minVisibleMs?: number;
    exitMs?: number;
  };
  animate?: boolean;
  waitForMedia?: boolean;
  decodeTimeoutMs?: number;
  rootMargin?: string;
  threshold?: number;
  keepSkeletonMounted?: boolean;
  rememberRevealed?: boolean;
};

export type GridFullscreenTrigger = 'item' | 'media';

export type GridSpan = number | "full";
export type ResponsiveGridSpan = GridSpan | Record<string, GridSpan>;
export type ResponsiveGridTemplate = string | Record<string, string>;

export type GridPluginKind =
  | "lazy-load"
  | "fullscreen"
  | "pagination"
  | "load-more"
  | "infinite-scroll"
  | "virtualization";

export type GridPluginItemRenderArgs = {
  index: number;
  key: React.Key;
  itemProps: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
  registerExpandableImage: (index: number, node: HTMLImageElement | null) => void;
  revealedIndicesRef: React.RefObject<Set<number>>;
};

export type GridPluginHost = {
  handle: GridHandle | null;
  itemCount: number;
  visibleItemCount: number;
  ready: boolean;
  fullscreenTrigger: GridFullscreenTrigger;
};

export type GridPluginRuntimeProps = {
  host: GridPluginHost;
  options?: unknown;
};

export type GridPlugin = {
  readonly __rmgGridPlugin: true;
  readonly kind: GridPluginKind;
  readonly options?: unknown;
  readonly blocksReady?: boolean;
  readonly Runtime?: React.ComponentType<GridPluginRuntimeProps>;
  renderItem?: (
    args: GridPluginItemRenderArgs,
    options?: unknown
  ) => React.ReactNode;
};

export type GridItemProps = {
  span?: ResponsiveGridSpan;
  revealKey?: React.Key;
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
  fullscreenTrigger?: GridFullscreenTrigger;
  plugins?: GridPlugin[];
  reveal?: RevealOptions;
  loading?: GridLoadingOptions;
};
