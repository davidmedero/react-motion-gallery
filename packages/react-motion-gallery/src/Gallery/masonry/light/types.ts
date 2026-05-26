import type * as React from "react";

export type MasonryPluginKind = "fullscreen" | "lazy-load";

export type MasonryPluginHandle = {
  getRootNode: () => HTMLElement | null;
  getItemNodes: () => HTMLElement[];
  isReady: () => boolean;
  onReady: (callback: (nodes: HTMLElement[]) => void) => () => void;
};

export type MasonryPluginHost = {
  handle: MasonryPluginHandle | null;
  itemCount: number;
  ready: boolean;
};

export type MasonryPluginRuntimeProps = {
  host: MasonryPluginHost;
  options?: unknown;
};

export type MasonryPluginItemRenderArgs = {
  index: number;
  itemRef: React.Ref<HTMLDivElement>;
  itemProps: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
  revealedIndicesRef: React.RefObject<Set<number>>;
};

export type MasonryPlugin = {
  readonly __rmgLightMasonryPlugin: true;
  readonly kind: MasonryPluginKind;
  readonly options?: unknown;
  readonly blocksReady?: boolean;
  readonly Runtime?: React.ComponentType<MasonryPluginRuntimeProps>;
  renderItem?: (
    args: MasonryPluginItemRenderArgs,
    options?: unknown
  ) => React.ReactNode;
};
