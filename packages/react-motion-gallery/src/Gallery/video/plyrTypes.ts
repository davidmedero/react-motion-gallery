import type { MediaItem } from "../shared/types/media";

export type PlyrSource = Plyr.SourceInfo;
export type PlyrOptions = Plyr.Options;

export type PlyrSourceBuilder = (item: MediaItem, index: number) => PlyrSource;

export type PlyrOptionsBuilder =
  | PlyrOptions
  | ((item: MediaItem, index: number) => PlyrOptions);