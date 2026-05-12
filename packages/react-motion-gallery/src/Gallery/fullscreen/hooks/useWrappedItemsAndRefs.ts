"use client";

import * as React from "react";
import { MediaItem } from "../../shared/types/media";

export type UseWrappedItemsAndRefsArgs = {
  normalizedItems: MediaItem[];
  wrappedItems: MediaItem[];
  setWrappedItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  imageRefs: React.RefObject<React.RefObject<HTMLDivElement | null>[]>;
};

export function useWrappedItemsAndRefs(args: UseWrappedItemsAndRefsArgs) {
  const { normalizedItems, wrappedItems, setWrappedItems, imageRefs } = args;

  React.useEffect(() => {
    if (!normalizedItems.length) return;

    const first = normalizedItems[0];
    const last = normalizedItems[normalizedItems.length - 1];

    setWrappedItems([last, ...normalizedItems, first]);
  }, [normalizedItems, setWrappedItems]);

  React.useEffect(() => {
    if (!wrappedItems.length) return;
    imageRefs.current = wrappedItems.map(() => React.createRef<HTMLDivElement>());
  }, [wrappedItems, imageRefs]);
}
