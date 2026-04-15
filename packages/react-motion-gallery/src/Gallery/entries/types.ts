import { ElementStyle } from "../shared/types/elements";
import { MediaItem } from "../shared/types/media";
import type {
  ResponsiveCaptionPlacement,
  ResponsiveLength,
} from "../shared/responsive";
import type { EntrySkeletonSpec, SkeletonLength } from "./components/EntrySkeleton";

export type EntryItem = {
  media?: MediaItem[];
  [key: string]: any;
};

export type EntryMediaRenderArgs = {
  entry: EntryItem;
  entryIndex: number;
  media: MediaItem;
  mediaIndex: number;
};

export type MediaEntryLink = {
  entryIndex: number;
  mediaIndex: number;
};

export type EntryOverlayRenderArgs = {
  entry: EntryItem;
  entryIndex: number;
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
  zoomFade?: boolean;
  zoomFadeDurationMs?: number;
  zoomFadeEasing?: string;
  zoomInTransform?: string;
  zoomOutTransform?: string;
};

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
  force?: boolean;
  skeleton?:
    | EntrySkeletonSpec
    | ((args: EntrySkeletonResolverArgs) => EntrySkeletonSpec | null | undefined);
  minHeight?: SkeletonLength;
  nearMargin?: string;   // default "700px 0px"
  viewMargin?: string;   // default "0px 0px"
  threshold?: number;    // default 0.01
  waitForDecode?: boolean; // default true
  decodeTimeoutMs?: number; // default 8000
  skeletonWrap?: ElementStyle;
};

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

export type EntrySkeletonRenderArgs = {
  entry: EntryItem;
  entryIndex: number;
}

export type EntriesOptions = {
  items?: EntryItem[];
  mediaLayout?: EntryMediaLayout;
  render?: {
    card?: (args: EntryCardRenderArgs) => React.ReactNode;
    media?: (args: EntryMediaRenderArgs) => React.ReactNode;
    overlay?: (args: EntryOverlayRenderArgs) => React.ReactNode;
    skeleton?: (args: EntrySkeletonRenderArgs) => React.ReactNode;
  };
  overlay?: EntryOverlayStyle;
  loading?: EntriesLoadingOptions;
  intro?: IntroOptions;
  entryList?: ElementStyle;
  entryRow?: ElementStyle;
};

export type SlideOwner = {
  entryIndex: number;
};
