export type IndexMode = "instant" | "animated";

export interface GalleryApi {
  rootNode(): HTMLElement | null;
  containerNode(): HTMLElement | null;
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
}