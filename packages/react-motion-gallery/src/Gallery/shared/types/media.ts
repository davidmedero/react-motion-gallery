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
      poster?: string;
      caption?: React.ReactNode;
    };

export type MediaInput =
  | string
  | {
      src: string;
      kind?: "image" | "video";
      poster?: string;
      alt?: string;
      caption?: React.ReactNode;
      srcSet?: string;
      sizes?: string;
      width?: number;
      height?: number;
    };

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isMediaItemArray(v: unknown): v is MediaItem[] {
  return (
    Array.isArray(v) &&
    v.every(
      (x) =>
        x &&
        typeof x === "object" &&
        "kind" in x &&
        ((x as any).kind === "image" || (x as any).kind === "video") &&
        typeof (x as any).src === "string"
    )
  );
}

function isMediaInputArray(v: unknown): v is MediaInput[] {
  return (
    Array.isArray(v) &&
    v.every(
      (x) =>
        typeof x === "string" ||
        (x &&
          typeof x === "object" &&
          typeof (x as any).src === "string")
    )
  );
}

function inferKindFromSrc(src: string): "image" | "video" {
  return /\.(mp4|webm|ogg)$/i.test(src) ? "video" : "image";
}

export const toMediaItems = (inputs: string[] | MediaInput[]): MediaItem[] =>
  inputs.map((m) => {
    if (typeof m === "string") {
      const kind = inferKindFromSrc(m);
      return kind === "video" ? { kind, src: m } : { kind, src: m };
    }

    const kind = m.kind ?? (m.poster ? "video" : inferKindFromSrc(m.src));

    if (kind === "video") {
      return {
        kind: "video",
        src: m.src,
        poster: m.poster,
        alt: m.alt,
        caption: m.caption,
      };
    }

    return {
      kind: "image",
      src: m.src,
      alt: m.alt,
      caption: m.caption,
      srcSet: m.srcSet,
      sizes: m.sizes,
      width: m.width,
      height: m.height,
    };
  });

  export function normalizeItemsInput(
  v: MediaItem[] | string[] | MediaInput[] | undefined
  ): MediaItem[] {
    if (!v || !v.length) return [];

    // Already normalized (strict)
    if (isMediaItemArray(v)) return v;

    // Old behavior: string[]
    if (isStringArray(v)) return toMediaItems(v);

    // New behavior: (string | {src,...})[]
    if (isMediaInputArray(v)) return toMediaItems(v);

    // Fallback: don't crash, just return empty
    return [];
  }