import { ElementStyle } from "../shared/types/elements";
import { MediaItem } from "../shared/types/media";
import { IntroOptions, LoadingOptions } from "../shared/types/transitions";

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

export type EntryMediaLayout = "slider" | "grid" | "masonry";

export type EntryCardRenderArgs = {
  entry: EntryItem;
  entryIndex: number;
  media: React.ReactNode;
};

export type EntriesOptions = {
  items?: EntryItem[];
  mediaLayout?: EntryMediaLayout;
  render?: {
    card?: (args: EntryCardRenderArgs) => React.ReactNode;
    media?: (args: EntryMediaRenderArgs) => React.ReactNode;
    overlay?: (args: EntryOverlayRenderArgs) => React.ReactNode;
  };
  overlay?: ElementStyle;
  loading?: LoadingOptions;
  intro?: IntroOptions;
};

export type SlideOwner = {
  entryIndex: number;
};