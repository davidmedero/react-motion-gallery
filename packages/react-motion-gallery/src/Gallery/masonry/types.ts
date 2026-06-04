import { type ResponsiveNumber } from "../shared/responsive";
import type { LoadingForceOptions } from "../shared/loading/force";
import type { MasonrySkeletonSpec } from "../skeleton/MasonrySkeleton";

export type RevealOptions = {
  renderReveal?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    content: React.ReactNode
  ) => React.ReactNode;
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  disabled?: boolean;
  staggerLimit?: number;
};

export type FullscreenTrigger = "item" | "media";

export type MasonrySpan = number | "full";
export type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;

export type MasonryLoadingSkeletonArgs = {
  index: number;
  itemIndex?: number;
  key: React.Key;
  revealKey?: React.Key;
  placeholder: boolean;
  ready: boolean;
  span?: ResponsiveMasonrySpan;
  width?: number;
  height?: number;
};

export type MasonryLoadingOptions = {
  enabled?: boolean;
  active?: boolean;
  count?: number;
  skeleton?:
    | MasonrySkeletonSpec
    | ((args: MasonryLoadingSkeletonArgs) => React.ReactNode);
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

export type MasonryPluginKind =
  | "lazy-load"
  | "pagination"
  | "load-more"
  | "infinite-scroll"
  | "virtualization";

export type MasonryPluginItemRenderArgs = {
  index: number;
  itemIndex?: number;
  itemRef: React.Ref<HTMLDivElement>;
  itemProps: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
  revealedIndicesRef: React.RefObject<Set<number>>;
};

export type MasonryPlugin = {
  readonly __rmgMasonryPlugin: true;
  readonly kind: MasonryPluginKind;
  readonly options?: unknown;
  readonly blocksReady?: boolean;
  readonly Runtime?: React.ComponentType<MasonryPluginRuntimeProps>;
  renderItem?: (
    args: MasonryPluginItemRenderArgs,
    options?: unknown
  ) => React.ReactNode;
};

export type MasonryPluginHost = {
  handle: MasonryHandle | null;
  itemCount: number;
  ready: boolean;
};

export type MasonryPluginRuntimeProps = {
  host: MasonryPluginHost;
  options?: unknown;
};

export type MasonryItemProps = {
  span?: ResponsiveMasonrySpan;
  revealKey?: React.Key;
  placeholder?: boolean;
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
  initialHeights?: ReadonlyArray<number | undefined>;
  placement?: "balanced" | "roundRobin" | "horizontalOrder";
  fullscreenTrigger?: FullscreenTrigger;
  itemWrapClassName?: string;
  itemWrapStyle?: React.CSSProperties;
  as?: React.ElementType;
  rootRef?: React.Ref<HTMLDivElement>;
  classNames?: {
    root?: string;
    column?: string;
    item?: string;
  };
  plugins?: MasonryPlugin[];
  reveal?: RevealOptions;
  loading?: MasonryLoadingOptions;
};
