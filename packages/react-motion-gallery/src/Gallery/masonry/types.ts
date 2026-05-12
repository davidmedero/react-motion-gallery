import { type ResponsiveNumber } from "../shared/responsive";

export type IntroOptions = {
  renderIntro?: (
    args: { active: boolean; containerProps: React.HTMLAttributes<HTMLDivElement> },
    content: React.ReactNode
  ) => React.ReactNode;
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  staggerLimit?: number;
};

export type FullscreenTrigger = "item" | "media";

export type MasonrySpan = number | "full";
export type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;

export type MasonryPluginKind = "lazy-load";

export type MasonryPluginItemRenderArgs = {
  index: number;
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
  renderItem?: (
    args: MasonryPluginItemRenderArgs,
    options?: unknown
  ) => React.ReactNode;
};

export type MasonryItemProps = {
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
  intro?: IntroOptions;
};
