import type { BreakpointMap } from "../shared/responsive";
import type { MediaItem } from "../shared/types/media";
import type { SliderApi } from "../slider/types";

export type IndexMode = "animated" | "instant";

export type FullscreenOpenMethod = "fade" | "scale";

export type OpenFullscreenAtArgs = {
  index: number;
  method?: FullscreenOpenMethod;
  event?: Event;
};

export type FullscreenOpenSource = "slider" | "grid" | "masonry" | "entries" | "api";

export type FullscreenOpenRequest = {
  source: FullscreenOpenSource;
  index: number;
  image: HTMLImageElement | null;
  method?: FullscreenOpenMethod;
  requestedMethod?: FullscreenOpenMethod;
  event?: Event;
};

export interface GalleryCoreApi {
  layout: "slider" | "grid" | "masonry" | "entries" | null;
  effectiveBreakpoints: BreakpointMap;
  normalizedItems: MediaItem[];
  fsEnabled: boolean;
  setFsEnabled: (enabled: boolean) => void;
  isFullscreenOpen: boolean;
  isFullscreenOpenRef: React.RefObject<boolean>;
  setFullscreenOpen: (open: boolean) => void;
  openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
  notifyBaseVisibleIndex: (index: number) => void;
  notifyFsVisibleIndex: (index: number) => void;
  registerExpandableImage: (index: number, node: HTMLElement | null) => void;
}

export interface GalleryLayoutApi {
  rootNode(): HTMLElement | null;
  containerNode(): HTMLElement | null;
  getViewportNode: () => HTMLDivElement | null;
  slideNodes(): HTMLElement[];
  onReady?(cb: (nodes: HTMLElement[]) => void): () => void;
  whenReady?(): Promise<HTMLElement[]>;
  isReady?(): boolean;
  scrollTo(index: number, jump?: boolean): void;
  scrollNext(jump?: boolean): void;
  scrollPrev(jump?: boolean): void;
  canScrollNext(): boolean;
  canScrollPrev(): boolean;
  getIndex(): number;
  selectCell(index: number, jump?: boolean): void;
  scrollProgress(): number;
  cellsInView(): number[];
}

export interface GalleryApi extends GalleryLayoutApi, SliderApi {
  openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
}
