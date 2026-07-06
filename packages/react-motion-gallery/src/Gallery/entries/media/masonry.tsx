/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Masonry as CoreMasonry } from "../../masonry/light";
import { MasonryLayout } from "../../masonry/MasonryLayout";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { useOptionalGalleryCore } from "../../core";
import { normalizeMasonryChild } from "../../masonry/item";
import type { MasonryItemProps as CoreMasonryItemProps } from "../../masonry/light";
import type { RevealOptions } from "../../masonry/types";
import type { MasonrySkeletonSpec } from "../../skeleton/masonry-structured";
import { useReportElementMediaReady } from "./useReportMediaReady";
import type {
  SkeletonForceOptions,
  SkeletonTimingOptions,
} from "../../skeleton/base";

type EntriesMasonryLoadingOptions = {
  enabled?: boolean;
  active?: boolean;
  count?: number;
  force?: SkeletonForceOptions;
  skeleton?: MasonrySkeletonSpec;
  timing?: SkeletonTimingOptions;
  animate?: boolean;
  waitForMedia?: boolean;
  decodeTimeoutMs?: number;
  rootMargin?: string;
  threshold?: number;
  keepSkeletonMounted?: boolean;
  rememberRevealed?: boolean;
};

function isCoreMasonryItemElement(
  node: React.ReactNode
): node is React.ReactElement<CoreMasonryItemProps> {
  return (
    React.isValidElement(node) &&
    Boolean((node.type as any)?.__rmgLightMasonryItem)
  );
}

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
      active: src?.active,
      count: src?.count,
      force: src?.force,
      skeleton: src?.skeleton,
      timing: src?.timing,
      animate: src?.animate,
      waitForMedia: src?.waitForMedia,
      decodeTimeoutMs: src?.decodeTimeoutMs,
      rootMargin: src?.rootMargin,
      threshold: src?.threshold,
      keepSkeletonMounted: src?.keepSkeletonMounted,
      rememberRevealed: src?.rememberRevealed,
    };
  }

  function normalizeReveal(src?: RevealOptions) {
    return {
      renderReveal: src?.renderReveal,
      staggerMs: src?.staggerMs ?? 40,
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
      disabled: src?.disabled ?? true,
      staggerLimit: src?.staggerLimit,
    };
  }

  const normalizedLoading = normalizeLoading(masonryLoading ?? masonryConfig.loading);
  const normalizedReveal = normalizeReveal(masonryReveal ?? masonryConfig.reveal);

  function EntriesMasonryMediaInner(props: {
    entryIndex: number;
    entryInView?: boolean;
    mediaNodes: React.ReactNode[];
    mediaReadyKey?: React.Key;
    mediaReadyTimeoutMs?: number;
    onMediaReadyChange?: (ready: boolean) => void;
  }) {
    const {
      entryIndex,
      entryInView,
      mediaNodes,
      mediaReadyKey,
      mediaReadyTimeoutMs,
      onMediaReadyChange,
    } = props;
    const core = useOptionalGalleryCore();
    const breakpoints = core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP };
    const mediaReadyRootRef = React.useRef<HTMLDivElement | null>(null);
    const coreMasonryItems = React.useMemo(() => {
      if (!Array.isArray(mediaNodes) || mediaNodes.length === 0) return [];
      return mediaNodes.filter(isCoreMasonryItemElement);
    }, [mediaNodes]);
    const useCoreMasonry =
      coreMasonryItems.length > 0 && coreMasonryItems.length === mediaNodes.length;
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
            revealKey: normalizedChild.layoutMeta?.revealKey,
          };
        }

        if (
          normalizedChild.layoutMeta?.className ||
          normalizedChild.layoutMeta?.style
        ) {
          return {
            key: `entries-masonry-${index}`,
            span: normalizedChild.layoutMeta?.span,
            revealKey: normalizedChild.layoutMeta?.revealKey,
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
          revealKey: normalizedChild.layoutMeta?.revealKey,
        };
      });
    }, [mediaNodes]);
    const filtered = normalized.filter((item) => item.node != null);
    const hasMedia = filtered.length > 0;
    const mediaReadyResetKey = React.useMemo(
      () =>
        `${entryIndex}:${String(mediaReadyKey ?? filtered.length)}:${useCoreMasonry ? "core" : "layout"}`,
      [entryIndex, filtered.length, mediaReadyKey, useCoreMasonry],
    );

    useReportElementMediaReady({
      enabled: hasMedia,
      rootRef: mediaReadyRootRef,
      timeoutMs: mediaReadyTimeoutMs,
      resetKey: mediaReadyResetKey,
      onMediaReadyChange,
    });

    if (!hasMedia) return null;

    if (useCoreMasonry) {
      const coreLoading = normalizedLoading
        ? {
            ...normalizedLoading,
            count: normalizedLoading.count ?? coreMasonryItems.length,
          }
        : masonryConfig.loading;

      return (
        <div ref={mediaReadyRootRef} style={{ display: "contents" }}>
          <CoreMasonry
            {...masonryConfig}
            loading={coreLoading as any}
            breakpoints={breakpoints}
            reveal={normalizedReveal}
            revealReady={entryInView ?? true}
          >
            {coreMasonryItems}
          </CoreMasonry>
        </div>
      );
    }

    const layoutLoading = normalizedLoading
      ? {
          ...normalizedLoading,
          count: normalizedLoading.count ?? filtered.length,
        }
      : masonryConfig.loading;

    return (
      <div ref={mediaReadyRootRef} style={{ display: "contents" }}>
        <MasonryLayout
          items={filtered.map((item) => (
            <React.Fragment key={item.key}>{item.node}</React.Fragment>
          ))}
          itemSpans={filtered.map((item) => item.span)}
          itemRevealKeys={filtered.map((item) => item.revealKey ?? item.key)}
          masonry={{ ...masonryConfig, loading: layoutLoading } as any}
          breakpoints={breakpoints}
          reveal={normalizedReveal}
          revealReady={entryInView ?? true}
        />
      </div>
    );
  }

  return ({
    entryIndex,
    entryInView,
    mediaNodes,
    mediaReadyKey,
    mediaReadyTimeoutMs,
    onMediaReadyChange,
  }) => (
    <EntriesMasonryMediaInner
      entryIndex={entryIndex}
      entryInView={entryInView}
      mediaNodes={mediaNodes}
      mediaReadyKey={mediaReadyKey}
      mediaReadyTimeoutMs={mediaReadyTimeoutMs}
      onMediaReadyChange={onMediaReadyChange}
    />
  );
}
