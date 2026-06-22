import { ElementStyle } from "../shared/types/elements";
import { MediaItem } from "../shared/types/media";
import type { LoadingForceOptions } from "../shared/loading/force";
import type {
  ResponsiveCaptionPlacement,
  ResponsiveLength,
} from "../shared/responsive";
import type {
  EntrySkeletonSpec,
  SkeletonLength,
} from "./components/EntrySkeleton";

export type EntryItem = {
  media?: MediaItem[];
  [key: string]: any;
};

export type EntryMediaRenderArgs = {
  entry: EntryItem;
  entryIndex: number;
  media: MediaItem;
  mediaIndex: number;
  mediaPriority: boolean;
  mediaLoading: "eager" | "lazy";
  mediaDecoding: "async" | "sync" | "auto";
  mediaFetchPriority: "high" | "low" | "auto";
};

export type MediaEntryLink = {
  entryIndex: number;
  mediaIndex: number;
};

export type EntryOverlayRenderArgs = {
  entry: EntryItem;
  entryIndex: number;
  media: MediaItem | null;
  mediaIndex: number | null;
  link: MediaEntryLink | null;
  opacity: number;
  fsIndex: number;
  style: React.CSSProperties;
  containerProps: React.HTMLAttributes<HTMLDivElement>;
};

export type EntryOverlayStyle = ElementStyle & {
  width?: ResponsiveLength;
  height?: ResponsiveLength;
  placement?: ResponsiveCaptionPlacement;
  breakpoint?: number;
  overlayCrossfadeTarget?: "content" | "overlay";
  overlayCrossfadeDurationMs?: number;
  overlayCrossfadeEasing?: string;
  zoomFade?: boolean;
  zoomFadeDurationMs?: number;
  zoomFadeEasing?: string;
  zoomInTransform?: string;
  zoomOutTransform?: string;
};

export type EntriesLayout = "list" | "grid";

export type EntryMediaLayout = "slider" | "grid" | "masonry";

export type EntryCardRenderArgs = {
  entry: EntryItem;
  entryIndex: number;
  media: React.ReactNode;
};

export type EntrySkeletonResolverArgs = {
  entry: EntryItem;
  entryIndex: number;
};

export type EntriesLoadingOptions = {
  enabled?: boolean;
  force?: LoadingForceOptions;
  skeleton?:
    | EntrySkeletonSpec
    | ((
        args: EntrySkeletonResolverArgs,
      ) => EntrySkeletonSpec | null | undefined);
  minHeight?: SkeletonLength;
  enterMs?: number;
  exitMs?: number;
  nearMargin?: string; // default "700px 0px"
  viewMargin?: string; // default "0px 0px"
  threshold?: number; // default 0.01
  waitForDecode?: boolean; // default true
  decodeTimeoutMs?: number; // default 8000
  skeletonWrap?: ElementStyle;
  rememberRevealed?: boolean;
};

export type RevealOptions = {
  renderReveal?: (
    args: {
      active: boolean;
      containerProps: React.HTMLAttributes<HTMLDivElement>;
    },
    content: React.ReactNode,
  ) => React.ReactNode;
  staggerMs?: number;
  durationMs?: number;
  easing?: string;
  staggerLimit?: number;
};

export type EntrySkeletonRenderArgs = {
  entry: EntryItem;
  entryIndex: number;
};

export type EntriesPluginKind =
  | "pagination"
  | "load-more"
  | "infinite-scroll"
  | "virtualization";

export type EntriesDataMode = "client" | "server";

export type EntriesPaginationOptions = {
  enabled?: boolean;
  mode?: EntriesDataMode;
  pageIndex: number;
  pageSize: number;
  total?: number;
  loading?: boolean;
};

export type EntriesLoadMoreOptions = {
  enabled?: boolean;
  mode?: EntriesDataMode;
  visibleCount: number;
  total?: number;
  loading?: boolean;
};

export type EntriesInfiniteScrollOptions = {
  enabled?: boolean;
  hasMore?: boolean;
  loading?: boolean;
  rootMargin?: string;
  threshold?: number;
  onLoadMore?: () => void;
  sentinel?: React.ReactNode;
};

export type EntriesVirtualizationOptions = {
  enabled?: boolean;
  layout?: EntriesLayout;
  estimateSize?: number;
  gap?: number;
  overscan?: number;
};

export type EntriesPluginOptionsByKind = {
  pagination: EntriesPaginationOptions;
  "load-more": EntriesLoadMoreOptions;
  "infinite-scroll": EntriesInfiniteScrollOptions;
  virtualization: EntriesVirtualizationOptions;
};

export type EntriesPlugin<Kind extends EntriesPluginKind = EntriesPluginKind> =
  {
    readonly __rmgEntriesPlugin: true;
    readonly kind: Kind;
    readonly options: EntriesPluginOptionsByKind[Kind];
  };

export type EntriesHandle = {
  getRootNode: () => HTMLDivElement | null;
  getEntryNodes: () => HTMLElement[];
  isReady: () => boolean;
  onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};

export type EntriesOptions = {
  items?: EntryItem[];
  layout?: EntriesLayout;
  mediaLayout?: EntryMediaLayout;
  render?: {
    card?: (args: EntryCardRenderArgs) => React.ReactNode;
    media?: (args: EntryMediaRenderArgs) => React.ReactNode;
    overlay?: (args: EntryOverlayRenderArgs) => React.ReactNode;
    skeleton?: (args: EntrySkeletonRenderArgs) => React.ReactNode;
  };
  overlay?: EntryOverlayStyle;
  loading?: EntriesLoadingOptions;
  reveal?: RevealOptions;
  plugins?: EntriesPlugin[];
  entryList?: ElementStyle;
  entryRow?: ElementStyle;
};

export type SlideOwner = {
  entryIndex: number;
};
