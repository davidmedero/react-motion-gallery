import { MediaItem } from "../shared/types/media";
import type { PlyrSourceBuilder } from "./plyrTypes";

export type PlyrProp = { source: Plyr.SourceInfo; options: Plyr.Options } | null;

export const defaultPlyrOptions: Plyr.Options = {
  controls: ["play-large", "play", "progress", "current-time", "volume", "fullscreen"],
  ratio: "16:9",
  fullscreen: { enabled: true, fallback: true, iosNative: true },
};

export const defaultPlyrSource: PlyrSourceBuilder = (item) => ({
  type: "video",
  poster: (item as any).thumb,
  sources: [{ src: (item as any).src, type: "video/mp4" }],
});

export const getSource = (item: MediaItem) =>
  ({
    type: "video",
    sources: [{ src: (item as any).src, type: "video/mp4" }],
  }) as Plyr.SourceInfo;

export const getOptions = () => defaultPlyrOptions;

export const isVideoItem = (m: MediaItem) => m.kind === "video";

export function buildPlyrProps(
  items: MediaItem[],
  getSource: (item: MediaItem, index: number) => Plyr.SourceInfo,
  resolveOptions: (item: MediaItem, index: number) => Plyr.Options
): PlyrProp[] {
  return items.map((item, index) => {
    if (!isVideoItem(item)) return null;
    return { source: getSource(item, index), options: resolveOptions(item, index) };
  });
}

export function mergePlyrOptions(
  base: Plyr.Options,
  options?: Plyr.Options | ((item: MediaItem, index: number) => Plyr.Options)
) {
  return (item: MediaItem, index: number) => {
    const resolved = typeof options === "function" ? options(item, index) : (options ?? base);
    return { ...base, ...resolved };
  };
}

export function detectProvider(source: any): "youtube" | "vimeo" | "mp4" | "other" {
  const provider = String(source?.sources?.[0]?.provider ?? "").toLowerCase();
  if (provider === "youtube") return "youtube";
  if (provider === "vimeo") return "vimeo";

  const src0 = String(source?.sources?.[0]?.src ?? "").toLowerCase();
  const looksMp4 = src0.endsWith(".mp4") || src0.includes(".mp4?");
  if (looksMp4) return "mp4";

  return "other";
}

export function isVideoSlideElement(el: HTMLElement | undefined | null) {
  if (!el) return false;
  if (el.classList?.contains("rmg__player")) return true;
  if (el.tagName.toLowerCase() === "video") return true;
  return false;
}