/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { MasonryLayout } from "../../masonry/MasonryLayout";
import type { EntriesMediaContainerRender } from "../index";
import { BREAKPOINT_MAP } from "../../shared/responsive";
import { useOptionalGalleryCore } from "../../core";
import type { IntroOptions, LoadingOptions } from "../../masonry/types";

export function createEntriesMasonryMedia(args: {
  masonryObject?: any;
  masonryLoading?: LoadingOptions;
  masonryIntro?: IntroOptions;
}): EntriesMediaContainerRender {
  const { masonryObject, masonryLoading, masonryIntro } = args;

  function normalizeLoading(src?: LoadingOptions) {
    return {
      enabled: src?.enabled,
      force: src?.force,
      renderLoading: src?.renderLoading,
      skeleton: src?.skeleton,
      timing: src?.timing,
    }
  }

  function normalizeIntro(src?: IntroOptions) {
    return {
      renderIntro: src?.renderIntro,
      staggerMs: src?.staggerMs ?? 40,
      durationMs: src?.durationMs ?? 300,
      easing: src?.easing ?? "cubic-bezier(.2,.7,.2,1)",
      staggerLimit: src?.staggerLimit,
    }
  }

  const normalizedLoading = normalizeLoading(masonryLoading ?? masonryObject?.loading);
  const normalizedIntro = normalizeIntro(masonryIntro ?? masonryObject?.intro);

  function EntriesMasonryMediaInner(props: { mediaNodes: React.ReactNode[] }) {
    const { mediaNodes } = props;

    if (!Array.isArray(mediaNodes) || mediaNodes.length === 0) return null;

    const core = useOptionalGalleryCore();
    const breakpoints = core?.effectiveBreakpoints ?? { ...BREAKPOINT_MAP };

    return (
      <MasonryLayout
        items={mediaNodes}
        masonry={masonryObject}
        breakpoints={breakpoints}
        loading={normalizedLoading}
        intro={normalizedIntro}
        skeletonCount={mediaNodes.length}
        contentLayerMode="flow"
      />
    );
  }

  return ({ mediaNodes }) => <EntriesMasonryMediaInner mediaNodes={mediaNodes} />;
}
