export type MediaItem =
  | {
      kind: "image";
      src: string;
      alt?: string;
      caption?: React.ReactNode;
      srcSet?: string;
      sizes?: string;
      width?: number;
      height?: number;
    }
  | {
      kind: "video";
      src: string;
      alt?: string;
      thumb?: string;
      caption?: React.ReactNode;
    };

export const toMediaItems = (urls: string[]): MediaItem[] =>
  urls.map((u) =>
    /\.(mp4|webm|ogg)$/i.test(u)
      ? { kind: "video", src: u }
      : { kind: "image", src: u }
  );