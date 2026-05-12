import Plyr from 'plyr';
import { MediaItem } from './media.mjs';

type PlyrSource = Plyr.SourceInfo;
type PlyrOptions = Plyr.Options;
type PlyrSourceBuilder = (item: MediaItem, index: number) => PlyrSource;
type PlyrOptionsBuilder = PlyrOptions | ((item: MediaItem, index: number) => PlyrOptions);

export type { PlyrSourceBuilder as P, PlyrOptionsBuilder as a, PlyrSource as b, PlyrOptions as c };
