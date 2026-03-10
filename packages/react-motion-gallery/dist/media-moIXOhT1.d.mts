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

export { type MediaItem as M, toMediaItems as t };
