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
    }
  | {
      kind: "node";
      node: React.ReactNode;
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
    }
  | {
      kind: "node";
      node: React.ReactNode;
    };

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isMediaItemArray(v: unknown): v is MediaItem[] {
  return (
    Array.isArray(v) &&
    v.every((x) => {
      if (!x || typeof x !== "object") return false;
      const k = (x as any).kind;
      if (k === "image" || k === "video") return typeof (x as any).src === "string";
      if (k === "node") return "node" in (x as any);
      return false;
    })
  );
}

function isMediaInputArray(v: unknown): v is MediaInput[] {
  return (
    Array.isArray(v) &&
    v.every((x) => {
      if (typeof x === "string") return true;
      if (!x || typeof x !== "object") return false;

      const k = (x as any).kind;
      if (k === "node") return "node" in (x as any);

      return typeof (x as any).src === "string";
    })
  );
}

function inferKindFromSrc(src: string): "image" | "video" {
  return /\.(mp4|webm|ogg)$/i.test(src) ? "video" : "image";
}

export const toMediaItems = (inputs: string[] | MediaInput[]): MediaItem[] =>
  inputs.map((m) => {
    if (typeof m === "string") {
      const kind = inferKindFromSrc(m);
      return { kind, src: m } as any;
    }

    if ((m as any).kind === "node") {
      return { kind: "node", node: (m as any).node };
    }

    const kind =
      (m as any).kind ?? ((m as any).poster ? "video" : inferKindFromSrc((m as any).src));

    if (kind === "video") {
      return {
        kind: "video",
        src: (m as any).src,
        poster: (m as any).poster,
        alt: (m as any).alt,
        caption: (m as any).caption,
      };
    }

    return {
      kind: "image",
      src: (m as any).src,
      alt: (m as any).alt,
      caption: (m as any).caption,
      srcSet: (m as any).srcSet,
      sizes: (m as any).sizes,
      width: (m as any).width,
      height: (m as any).height,
    };
  });

  export function normalizeItemsInput(
  v: MediaItem[] | string[] | MediaInput[] | undefined
  ): MediaItem[] {
    if (!v || !v.length) return [];
    if (isMediaItemArray(v)) return v;
    if (isStringArray(v)) return toMediaItems(v);
    if (isMediaInputArray(v)) return toMediaItems(v);
    return [];
  }