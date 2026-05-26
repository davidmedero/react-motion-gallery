import * as React from 'react';

type MasonryPluginKind = "fullscreen" | "lazy-load";
type MasonryPluginHandle = {
    getRootNode: () => HTMLElement | null;
    getItemNodes: () => HTMLElement[];
    isReady: () => boolean;
    onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};
type MasonryPluginHost = {
    handle: MasonryPluginHandle | null;
    itemCount: number;
    ready: boolean;
};
type MasonryPluginRuntimeProps = {
    host: MasonryPluginHost;
    options?: unknown;
};
type MasonryPluginItemRenderArgs = {
    index: number;
    itemRef: React.Ref<HTMLDivElement>;
    itemProps: React.HTMLAttributes<HTMLDivElement>;
    children: React.ReactNode;
    revealedIndicesRef: React.RefObject<Set<number>>;
};
type MasonryPlugin = {
    readonly __rmgLightMasonryPlugin: true;
    readonly kind: MasonryPluginKind;
    readonly options?: unknown;
    readonly blocksReady?: boolean;
    readonly Runtime?: React.ComponentType<MasonryPluginRuntimeProps>;
    renderItem?: (args: MasonryPluginItemRenderArgs, options?: unknown) => React.ReactNode;
};

export type { MasonryPlugin as M, MasonryPluginHost as a, MasonryPluginKind as b, MasonryPluginRuntimeProps as c };
