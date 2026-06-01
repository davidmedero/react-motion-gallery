"use client";

import * as React from "react";

import { BREAKPOINT_MAP } from "../shared/responsive";
import { useViewportWidth } from "../shared/hooks/useViewportWidth";
import { buildStableScopeId } from "../shared/stableScope";
import { useOptionalGalleryCore } from "../core";
import { DEFAULT_ENTRIES } from "./defaults";
import {
  EntriesCore,
  type EntriesProps,
} from "./index";
import type { EntriesHandle, EntriesOptions } from "./types";
import {
  collectEntrySkeletonTextIds,
  type EntrySkeletonSpec,
} from "./components/EntrySkeleton";
import type { SkeletonCacheOptions } from "../skeleton/cache";
import { validateSkeletonCacheSnapshot } from "../skeleton/cache";
import {
  resolveSkeletonCacheOptions,
  useSkeletonCacheContext,
  useSkeletonCacheRenderSnapshot,
} from "../skeleton/cache-context";
import { useSkeletonCacheWriter } from "../skeleton/cache-writer";

type CachedEntriesLoadingOptions = NonNullable<EntriesOptions["loading"]> & {
  cache?: SkeletonCacheOptions;
};

export type CachedEntriesOptions = Omit<EntriesOptions, "loading"> & {
  loading?: CachedEntriesLoadingOptions;
};

export type CachedEntriesProps = Omit<EntriesProps, "entries"> & {
  entries: CachedEntriesOptions;
};

function getEntryKey(entry: any, entryIndex: number) {
  return String((entry as any).key ?? (entry as any).id ?? entryIndex);
}

function resolveEntrySkeletonSpec(
  entries: CachedEntriesOptions,
  entry: any,
  entryIndex: number
): EntrySkeletonSpec {
  const skel = (entries as any)?.loading?.skeleton;

  if (typeof skel === "function") {
    const out = skel({ entry, entryIndex });
    if (out && typeof out === "object") return out as EntrySkeletonSpec;
  } else if (skel && typeof skel === "object") {
    return skel as EntrySkeletonSpec;
  }

  return {
    variant: "solid",
    minHeight: 260,
  };
}

export const CachedEntries = React.forwardRef<EntriesHandle, CachedEntriesProps>(
function CachedEntries(props, forwardedRef) {
  const core = useOptionalGalleryCore();
  const effectiveBreakpoints = React.useMemo(
    () => core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP },
    [core?.effectiveBreakpoints]
  );
  const entriesObject = React.useMemo<CachedEntriesOptions>(() => {
    return {
      ...props.entries,
      mediaLayout: props.entries?.mediaLayout ?? DEFAULT_ENTRIES.mediaLayout,
    };
  }, [props.entries]);
  const items = entriesObject.items ?? [];
  const entryKeySignature = React.useMemo(
    () => items.map((entry, entryIndex) => getEntryKey(entry, entryIndex)).join("\u0000"),
    [items]
  );
  const entrySkeletonSpecs = React.useMemo(
    () =>
      items.map((entry, entryIndex) =>
        resolveEntrySkeletonSpec(entriesObject, entry, entryIndex)
      ),
    [entriesObject, items]
  );
  const scopeId = React.useMemo(
    () =>
      buildStableScopeId("esk_", {
        breakpoints: effectiveBreakpoints,
        entryKeySignature,
        skeletons: entrySkeletonSpecs,
      }),
    [effectiveBreakpoints, entryKeySignature, entrySkeletonSpecs]
  );
  const cacheContext = useSkeletonCacheContext();
  const effectiveCache = resolveSkeletonCacheOptions(
    entriesObject.loading?.cache,
    cacheContext
  );
  const renderCacheSnapshot = useSkeletonCacheRenderSnapshot(effectiveCache);
  const clientViewportWidth = useViewportWidth();
  const textIds = React.useMemo(
    () =>
      Array.from(
        entrySkeletonSpecs.reduce((out, spec) => {
          collectEntrySkeletonTextIds(spec.layout, out);
          return out;
        }, new Set<string>())
      ),
    [entrySkeletonSpecs]
  );
  const validCacheSnapshot = validateSkeletonCacheSnapshot(renderCacheSnapshot, {
    key: effectiveCache?.key,
    scopeId,
    kind: "entries",
    routeKey: effectiveCache?.routeKey,
    ttlMs: effectiveCache?.ttlMs,
    viewportWidth: clientViewportWidth || undefined,
    textIds,
  });
  const listRef = React.useRef<HTMLDivElement | null>(null);
  useSkeletonCacheWriter({
    cache: effectiveCache,
    kind: "entries",
    scopeId,
    textIds,
    skeletonRootRef: listRef,
    shellRef: listRef,
  });

  return (
    <EntriesCore
      {...props}
      ref={forwardedRef}
      entries={entriesObject}
      entryListCacheSnapshot={validCacheSnapshot}
      entryListCacheScopeId={scopeId}
      entryListRef={listRef}
    />
  );
});

export default CachedEntries;
