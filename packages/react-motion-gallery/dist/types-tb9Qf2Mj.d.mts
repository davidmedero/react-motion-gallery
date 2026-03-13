type IndexMode = "animated" | "instant";
type FullscreenOpenMethod = "fade" | "scale";
type OpenFullscreenAtArgs = {
    index: number;
    method?: FullscreenOpenMethod;
    event?: Event;
};
type FullscreenOpenSource = "slider" | "grid" | "masonry" | "entries" | "api";
type FullscreenOpenRequest = {
    source: FullscreenOpenSource;
    index: number;
    image: HTMLImageElement | null;
    method?: FullscreenOpenMethod;
    requestedMethod?: FullscreenOpenMethod;
    event?: Event;
};
interface GalleryApi {
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
    onIndexChange(cb: (i: number, meta: {
        mode: IndexMode;
    }) => void): () => void;
    openFullscreenAt: (args: OpenFullscreenAtArgs) => void;
}

export type { FullscreenOpenRequest as F, GalleryApi as G, IndexMode as I, OpenFullscreenAtArgs as O, FullscreenOpenMethod as a };
