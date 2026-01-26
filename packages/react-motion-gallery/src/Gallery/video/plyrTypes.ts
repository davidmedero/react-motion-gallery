import { MediaItem } from "../shared/types/media";

export type PlyrSource = {
  type?: string;
  sources?: Array<{
    src: string;
    type?: string;
    size?: number;
  }>;
};

export type PlyrOptions = Record<string, unknown>;

export type PlyrInstance = {
  play?: () => Promise<void> | void;
  pause?: () => void;
  stop?: () => void;
  destroy?: () => void;
  source?: PlyrSource;
};

export type PlyrSourceBuilder = (item: MediaItem, index: number) => Plyr.SourceInfo;
export type PlyrOptionsResolver =
  | Plyr.Options
  | ((item: MediaItem, index: number) => Plyr.Options);