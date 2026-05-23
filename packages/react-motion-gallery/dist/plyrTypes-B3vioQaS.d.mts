import { MediaItem } from './media.mjs';

type PlyrSourceType = "audio" | "video" | string;
type PlyrProvider = "html5" | "youtube" | "vimeo" | string;
type PlyrSourceItem = {
    src: string;
    type?: string;
    provider?: PlyrProvider;
    size?: number;
    [key: string]: unknown;
};
type PlyrTrack = {
    kind?: string;
    label?: string;
    src: string;
    srcLang?: string;
    srclang?: string;
    default?: boolean;
    [key: string]: unknown;
};
type PlyrSource = {
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
type PlyrOptions = {
    controls?: string | string[] | readonly string[] | ((id: string, seektime: number, title: string) => unknown) | Element;
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
    loop?: boolean | {
        active?: boolean;
        [key: string]: unknown;
    };
    youtube?: Record<string, unknown>;
    vimeo?: Record<string, unknown>;
    [key: string]: unknown;
};
type PlyrInstance = {
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
type APITypes = {
    plyr: PlyrInstance;
    [key: string]: any;
};
type PlyrSourceBuilder = (item: MediaItem, index: number) => PlyrSource;
type PlyrOptionsBuilder = PlyrOptions | ((item: MediaItem, index: number) => PlyrOptions);

export type { APITypes as A, PlyrSourceBuilder as P, PlyrOptionsBuilder as a, PlyrSource as b, PlyrOptions as c };
