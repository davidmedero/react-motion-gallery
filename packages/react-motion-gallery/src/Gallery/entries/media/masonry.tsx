/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { MasonryLayout } from "../../masonry/MasonryLayout";
import { useMasonryReady } from "../../masonry/useMasonryReady";
import { MasonrySkeleton as Skeleton } from "../../skeleton/masonry";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { useOptionalGalleryCore } from "../../core";
import { normalizeMasonryChild } from "../../masonry/item";
import type { RevealOptions } from "../../masonry/types";
import type { MasonrySkeletonSpec } from "../../skeleton/masonry";
import type {
  SkeletonForceOptions,
  SkeletonTimingOptions,
} from "../../skeleton/base";

type EntriesMasonryLoadingOptions = {
  enabled?: boolean;
  force?: SkeletonForceOptions;
  skeleton?: MasonrySkeletonSpec;
  timing?: SkeletonTimingOptions;
};

export function createEntriesMasonryMedia(args: {
  masonryObject?: any;
  masonryLoading?: EntriesMasonryLoadingOptions;
  masonryReveal?: RevealOptions;
}): EntriesMediaContainerRender {
  const { masonryObject, masonryLoading, masonryReveal } = args;
  const masonryConfig = masonryObject ?? {};

  function normalizeLoading(src?: EntriesMasonryLoadingOptions) {
    if (!src) return null;

    return {
      enabled: src?.enabled,
      force: src?.force,
      skeleton: src?.skeleton,
      timing: src?.timing,
    };
  }

  function normalizeReveal(src?: RevealOptions) {
    return {
      renderReveal: src?.renderReveal,
      staggerMs: src?.staggerMs ?? 40,
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
      staggerLimit: src?.staggerLimit,
    };
  }

  const normalizedLoading = normalizeLoading(masonryLoading ?? masonryConfig.loading);
  const normalizedReveal = normalizeReveal(masonryReveal ?? masonryConfig.reveal);

  function EntriesMasonryMediaInner(props: {
    entryInView?: boolean;
    mediaNodes: React.ReactNode[];
  }) {
    const { entryInView, mediaNodes } = props;
    const core = useOptionalGalleryCore();
    const breakpoints = core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP };
    const masonryReady = useMasonryReady();
    const normalized = React.useMemo(() => {
      if (!Array.isArray(mediaNodes) || mediaNodes.length === 0) return [];

      return mediaNodes.map((node, index) => {
        const normalizedChild = normalizeMasonryChild(node);
        const content = normalizedChild.node;

        if (content == null) {
          return {
            key: `entries-masonry-${index}`,
            node: null,
            span: normalizedChild.layoutMeta?.span,
          };
        }

        if (
          normalizedChild.layoutMeta?.className ||
          normalizedChild.layoutMeta?.style
        ) {
          return {
            key: `entries-masonry-${index}`,
            span: normalizedChild.layoutMeta?.span,
            node: (
              <div
                className={normalizedChild.layoutMeta?.className}
                style={normalizedChild.layoutMeta?.style}
              >
                {content}
              </div>
            ),
          };
        }

        return {
          key: `entries-masonry-${index}`,
          node: content,
          span: normalizedChild.layoutMeta?.span,
        };
      });
    }, [mediaNodes]);
    const filtered = normalized.filter((item) => item.node != null);

    if (filtered.length === 0) return null;

    const masonryNode = (
      <MasonryLayout
        ref={masonryReady.ref}
        items={filtered.map((item) => (
          <React.Fragment key={item.key}>{item.node}</React.Fragment>
        ))}
        itemSpans={filtered.map((item) => item.span)}
        masonry={masonryConfig}
        breakpoints={breakpoints}
        reveal={normalizedReveal}
        revealReady={entryInView ?? true}
      />
    );

    if (!normalizedLoading?.skeleton) return masonryNode;

    return (
      <Skeleton
        layout={normalizedLoading.skeleton}
        ready={masonryReady.ready}
        enabled={normalizedLoading.enabled}
        force={normalizedLoading.force}
        timing={normalizedLoading.timing}
        masonry={{
          count: filtered.length,
          columns: masonryConfig.columns,
          gap: masonryConfig.gap,
          placement: masonryConfig.placement,
          spans: filtered.map((item) => item.span),
        }}
      >
        {masonryNode}
      </Skeleton>
    );
  }

  return ({ entryInView, mediaNodes }) => (
    <EntriesMasonryMediaInner entryInView={entryInView} mediaNodes={mediaNodes} />
  );
}
