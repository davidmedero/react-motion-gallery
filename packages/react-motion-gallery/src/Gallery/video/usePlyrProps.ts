"use client";

import * as React from "react";
import type { PlyrOptionsBuilder, PlyrSourceBuilder } from "./plyrTypes";
import {
  buildPlyrProps,
  defaultPlyrOptions,
  defaultPlyrSource,
  mergePlyrOptions,
  type PlyrProp,
} from "./plyr";
import type { MediaItem } from "../shared/types/media";

export type UsePlyrPropsArgs = {
  items: MediaItem[];
  source?: PlyrSourceBuilder;
  options?: PlyrOptionsBuilder;
};

export function usePlyrProps(args: UsePlyrPropsArgs): PlyrProp[] {
  const { items, source, options } = args;

  return React.useMemo(() => {
    if (!items?.length) return [];

    const getSource = (item: MediaItem, index: number) =>
      (source ?? defaultPlyrSource)(item, index);

    const getOptions = mergePlyrOptions(defaultPlyrOptions, options);

    return buildPlyrProps(items, getSource, getOptions);
  }, [items, source, options]);
}