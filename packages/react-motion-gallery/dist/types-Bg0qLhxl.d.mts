type RevealOptions = {
    renderReveal?: (args: {
        active: boolean;
        containerProps: React.HTMLAttributes<HTMLDivElement>;
    }, content: React.ReactNode) => React.ReactNode;
    staggerMs?: number;
    durationMs?: number;
    easing?: string;
    disabled?: boolean;
    staggerLimit?: number;
};
type MasonrySpan = number | "full";
type ResponsiveMasonrySpan = MasonrySpan | Record<string, MasonrySpan>;
type MasonryPluginKind = "lazy-load" | "pagination" | "load-more" | "infinite-scroll" | "virtualization";
type MasonryPluginItemRenderArgs = {
    index: number;
    itemIndex?: number;
    itemRef: React.Ref<HTMLDivElement>;
    itemProps: React.HTMLAttributes<HTMLDivElement>;
    children: React.ReactNode;
    revealedIndicesRef: React.RefObject<Set<number>>;
};
type MasonryPlugin = {
    readonly __rmgMasonryPlugin: true;
    readonly kind: MasonryPluginKind;
    readonly options?: unknown;
    readonly blocksReady?: boolean;
    readonly Runtime?: React.ComponentType<MasonryPluginRuntimeProps>;
    renderItem?: (args: MasonryPluginItemRenderArgs, options?: unknown) => React.ReactNode;
};
type MasonryPluginHost = {
    handle: MasonryHandle | null;
    itemCount: number;
    ready: boolean;
};
type MasonryPluginRuntimeProps = {
    host: MasonryPluginHost;
    options?: unknown;
};
type MasonryHandle = {
    getRootNode: () => HTMLElement | null;
    getItemNodes: () => HTMLElement[];
    isReady: () => boolean;
    onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};

export type { MasonryPlugin as M, ResponsiveMasonrySpan as R, RevealOptions as a, MasonryHandle as b };
