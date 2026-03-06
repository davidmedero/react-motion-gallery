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

export interface GalleryApi {
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
  append(nodes: React.ReactNode | React.ReactNode[]): number;
  prepend(nodes: React.ReactNode | React.ReactNode[]): number;
  insert(index: number, nodes: React.ReactNode | React.ReactNode[]): number;
  remove(indexOrPredicate: number | ((i: number) => boolean)): number;
  replace(index: number, node: React.ReactNode): void;
  setItems(nodes: React.ReactNode[]): number;
  onIndexChange(cb: (i: number, meta: { mode: IndexMode }) => void): () => void;
  openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
}