import type { MediaItem } from "../shared/types/media";

export type PlyrSourceType = "audio" | "video" | string;
export type PlyrProvider = "html5" | "youtube" | "vimeo" | string;

export type PlyrSourceItem = {
  src: string;
  type?: string;
  provider?: PlyrProvider;
  size?: number;
  [key: string]: unknown;
};

export type PlyrTrack = {
  kind?: string;
  label?: string;
  src: string;
  srcLang?: string;
  srclang?: string;
  default?: boolean;
  [key: string]: unknown;
};

export type PlyrSource = {
  type: PlyrSourceType;
  title?: string;
  poster?: string;
  sources: PlyrSourceItem[];
  tracks?: PlyrTrack[];
  previewThumbnails?: {
    enabled?: boolean;
    src?: string | string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type PlyrOptions = {
  controls?:
    | string
    | string[]
    | readonly string[]
    | ((id: string, seektime: number, title: string) => unknown)
    | Element;
  ratio?: string;
  fullscreen?: {
    enabled?: boolean;
    fallback?: boolean | string;
    iosNative?: boolean;
    container?: string | HTMLElement | null;
    [key: string]: unknown;
  };
  autoplay?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto" | string;
  crossorigin?: boolean | string;
  playsinline?: boolean;
  loop?: boolean | { active?: boolean; [key: string]: unknown };
  youtube?: Record<string, unknown>;
  vimeo?: Record<string, unknown>;
  [key: string]: unknown;
};

export type PlyrInstance = {
  source?: PlyrSource;
  media?: HTMLMediaElement | null;
  elements?: {
    container?: HTMLElement | null;
    controls?: HTMLElement | null;
    wrapper?: HTMLElement | null;
    [key: string]: unknown;
  };
  play: () => Promise<void> | void;
  pause: () => void;
  stop?: () => void;
  restart?: () => void;
  destroy?: (...args: unknown[]) => void;
  [key: string]: any;
};

export type APITypes = {
  plyr: PlyrInstance;
  [key: string]: any;
};

export type PlyrSourceBuilder = (item: MediaItem, index: number) => PlyrSource;

export type PlyrOptionsBuilder =
  | PlyrOptions
  | ((item: MediaItem, index: number) => PlyrOptions);
