/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export * from "./types";
export * from "./defaults";
export * from "./hooks/useEntryInView";
export * from "./hooks/useEntryDecodeReady";
export * from "./normalize";
export * from "./components/EntryList";
import * as React from "react";
import { EntryList } from "./components/EntryList";
import { DEFAULT_ENTRIES } from "./defaults";
import type { EntriesOptions, SlideOwner, MediaEntryLink, EntryItem } from "./types";
import { toMediaItems, type MediaItem } from "../shared/types/media";
import { useOptionalGalleryCore } from "../core";
import { SliderHandle } from "../slider/types";

export type EntriesMediaContainerRender = (args: {
  entryIndex: number;
  mediaNodes: React.ReactNode[];
  entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
}) => React.ReactNode;

type FullscreenItemsInput = MediaItem[] | string[];

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

const normalizeFsItems = (v: FullscreenItemsInput | undefined): MediaItem[] => {
  if (!v || !v.length) return [];
  return isStringArray(v) ? toMediaItems(v) : v;
};

export function nodeFromMediaDefault(m: MediaItem): React.ReactNode {
  if ((m as any).kind === "image") return <img src={(m as any).src} alt={(m as any).alt ?? ""} />;
  if ((m as any).kind === "video") return <video src={(m as any).src} controls preload="metadata" />;
  return null;
}

export function flattenEntries(items: EntryItem[] | undefined) {
  const media: MediaItem[] = [];
  const map: MediaEntryLink[] = [];
  const indexByEntry: number[][] = [];
  const owners: SlideOwner[] = [];

  if (!items?.length) {
    return {
      flattenedMedia: [] as MediaItem[],
      flattenedMap: [] as MediaEntryLink[],
      entryFlatIndex: null as number[][] | null,
      owners: [] as SlideOwner[],
    };
  }

  items.forEach((ent, entryIndex) => {
    indexByEntry[entryIndex] = [];
    (ent.media ?? []).forEach((m, mediaIndex) => {
      const flatIndex = media.length;
      media.push(m);
      map.push({ entryIndex, mediaIndex });
      owners.push({ entryIndex });
      indexByEntry[entryIndex][mediaIndex] = flatIndex;
    });
  });

  return {
    flattenedMedia: media,
    flattenedMap: map,
    entryFlatIndex: indexByEntry,
    owners,
  };
}

export type EntriesProps = {
  enabled?: boolean;
  entries: EntriesOptions;
  fullscreen?: {
    enabled?: boolean;
    items?: FullscreenItemsInput;
  };
  renderMediaContainer: EntriesMediaContainerRender;
  nodeFromMedia?: (m: MediaItem) => React.ReactNode;
  entryFlatIndexRef?: React.RefObject<number[][] | null>;
  entryMapRef?: React.RefObject<MediaEntryLink[] | null>;
  fsOwnersRef?: React.RefObject<SlideOwner[]>;
  entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
  onOpenFullscreen?: (args: { index: number; img: HTMLImageElement; event?: Event }) => void;
};

export function Entries(props: EntriesProps) {
  const {
    enabled = true,
    entries,
    fullscreen,
    renderMediaContainer,
    nodeFromMedia = nodeFromMediaDefault,
    onOpenFullscreen,
  } = props;

  const entriesObject = React.useMemo<EntriesOptions>(() => {
    return {
      ...entries,
      mediaLayout: entries?.mediaLayout ?? DEFAULT_ENTRIES.mediaLayout,
    };
  }, [entries]);

  const core = useOptionalGalleryCore();

  const entryFlatIndexRef = props.entryFlatIndexRef ?? React.useRef<number[][] | null>(null);
  const entryMapRef = props.entryMapRef ?? React.useRef<MediaEntryLink[] | null>(null);
  const fsOwnersRef = props.fsOwnersRef ?? React.useRef<SlideOwner[]>([]);
  const entrySliderRefs =
    props.entrySliderRefs ?? React.useRef<Array<SliderHandle | null>>([]);

  const expandableImgRefs =
    core?.expandableImgRefs ?? React.useRef<Array<HTMLImageElement | null>>([]);

  const registerExpandableImg =
    core?.registerExpandableImg ??
    React.useCallback((index: number, node: HTMLElement | null) => {
      if (!node) {
        expandableImgRefs.current[index] = null;
        return;
      }
      const img =
        node.tagName === "IMG"
          ? (node as HTMLImageElement)
          : (node.querySelector("img") as HTMLImageElement | null);

      expandableImgRefs.current[index] = img;
  }, []);

  const { flattenedMedia, flattenedMap, entryFlatIndex, owners } = React.useMemo(() => {
    return flattenEntries(entriesObject.items as any);
  }, [entriesObject.items]);

  React.useEffect(() => {
    entryFlatIndexRef.current = entryFlatIndex;
    fsOwnersRef.current = owners;
    entryMapRef.current = flattenedMap;
  }, [entryFlatIndex, owners, flattenedMap, entryFlatIndexRef, fsOwnersRef, entryMapRef]);

  const normalizedItems = React.useMemo<MediaItem[]>(() => {
    const fsItems = normalizeFsItems(fullscreen?.items as any);
    if (fsItems.length) return fsItems;
    return flattenedMedia;
  }, [fullscreen?.items, flattenedMedia]);

  React.useEffect(() => {
    if (!core) return;

    core.registerFullscreenAdapter("entries", {
      closestSelector: (entriesObject.mediaLayout === "slider" ? ".rmg__slide" : ".rmg__grid-item"),
      getOwnerSliderHandle: (globalIndex: number) => {
        const link = entryMapRef.current?.[globalIndex];
        if (!link) return null;
        return entrySliderRefs.current?.[link.entryIndex] ?? null;
      },
      getEntryContext: () => ({
        entryMapRef,
        entryMediaLayout: entriesObject.mediaLayout,
        entriesObject,
        entrySliderRefs,
        expandableImgRefs: core?.expandableImgRefs ?? expandableImgRefs,
      }),
    });
  }, [core, entriesObject]);

  const openFullscreenAt = React.useCallback(
    (globalIndex: number, originEl?: HTMLElement | null) => {
      const fsEnabled = fullscreen?.enabled ?? true;
      if (!fsEnabled) return;

      let imgEl: HTMLImageElement | null = null;
      if (originEl) {
        imgEl = originEl.tagName === "IMG" ? (originEl as HTMLImageElement) : originEl.querySelector("img");
      }
      if (!imgEl) {
        imgEl = expandableImgRefs.current[globalIndex] ?? null;
      }
      if (!imgEl) return;

      if (core?.requestFullscreenOpen) {
        core.requestFullscreenOpen({ source: "entries", index: globalIndex, img: imgEl, event: undefined });
        return;
      }

      onOpenFullscreen?.({ index: globalIndex, img: imgEl });
    },
    [fullscreen?.enabled, core, onOpenFullscreen]
  );

  const fsEnabled = (fullscreen?.enabled ?? true) && normalizedItems.length > 0;

  return (
    <EntryList
      enabled={!!enabled}
      entries={entriesObject}
      fsEnabled={!!fsEnabled}
      openFullscreenAt={openFullscreenAt}
      entryFlatIndexRef={entryFlatIndexRef}
      nodeFromMedia={nodeFromMedia}
      registerExpandableImg={registerExpandableImg}
      renderMediaContainer={renderMediaContainer}
      entrySliderRefs={entrySliderRefs}
    />
  );
}

export default Entries;