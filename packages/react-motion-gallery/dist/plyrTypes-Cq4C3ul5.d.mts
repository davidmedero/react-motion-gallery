import Plyr from 'plyr';

type MediaItem = {
    kind: "image";
    src: string;
    alt?: string;
    caption?: React.ReactNode;
    srcSet?: string;
    sizes?: string;
    width?: number;
    height?: number;
} | {
    kind: "video";
    src: string;
    alt?: string;
    poster?: string;
    caption?: React.ReactNode;
} | {
    kind: "node";
    node: React.ReactNode;
};
type MediaInput = string | {
    src: string;
    kind?: "image" | "video";
    poster?: string;
    alt?: string;
    caption?: React.ReactNode;
    srcSet?: string;
    sizes?: string;
    width?: number;
    height?: number;
} | {
    kind: "node";
    node: React.ReactNode;
};
declare const toMediaItems: (inputs: string[] | MediaInput[]) => MediaItem[];

type PlyrSource = Plyr.SourceInfo;
type PlyrOptions = Plyr.Options;
type PlyrSourceBuilder = (item: MediaItem, index: number) => PlyrSource;
type PlyrOptionsBuilder = PlyrOptions | ((item: MediaItem, index: number) => PlyrOptions);

export { type MediaItem as M, type PlyrSourceBuilder as P, type PlyrOptionsBuilder as a, type PlyrSource as b, type PlyrOptions as c, toMediaItems as t };
