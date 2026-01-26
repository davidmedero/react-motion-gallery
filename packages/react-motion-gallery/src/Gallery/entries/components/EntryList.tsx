import * as React from "react";
import styles from "../../index.module.css";
import type { EntriesOptions } from "../types";
import { useEntryInView } from "../hooks/useEntryInView";
import { useEntryDecodeReady } from "../hooks/useEntryDecodeReady";
import { EntrySkeletonCard } from "./EntrySkeleton";
import { useNormalizedEntriesIntro, useNormalizedEntriesLoading } from "../normalize";
import { MediaItem } from "../../shared/types/media";

type Props = {
  enabled: boolean; // layout === 'entries'
  entries: EntriesOptions;

  // Needed to open fullscreen
  fsEnabled: boolean;
  openFullscreenAt: (globalIndex: number, originEl?: HTMLElement | null) => void;

  // Map entry->flat index (you already compute this in Gallery)
  entryFlatIndexRef: React.MutableRefObject<number[][] | null>;

  // Provide your “nodeFromMedia”
  nodeFromMedia: (m: MediaItem) => React.ReactNode;

  // “isClick” ref if you want the slider-only click gating behavior
  isClickRef?: React.RefObject<boolean>;

  // Renders media layout container (slider/grid/masonry)
  renderMediaContainer: (args: {
    entryIndex: number;
    mediaNodes: React.ReactNode[];
  }) => React.ReactNode;

  registerExpandableImg?: (globalIndex: number, node: HTMLElement | null) => void;

};

export function EntryList({
  enabled,
  entries,
  fsEnabled,
  openFullscreenAt,
  entryFlatIndexRef,
  nodeFromMedia,
  isClickRef,
  renderMediaContainer,
  registerExpandableImg
}: Props) {
  const items = entries.items ?? [];
  const len = items.length;

  const { nearView, everInView, setEntryRef } = useEntryInView(len, {
    root: null,
    nearMargin: "700px 0px",
    viewMargin: "0px 0px",
    threshold: 0.01,
  });

  const { decodedReady } = useEntryDecodeReady(enabled, items as any, nearView, {
    timeoutMs: 8000,
  });

  const loadingN = useNormalizedEntriesLoading(entries);
  const introN = useNormalizedEntriesIntro(entries);

  const showGlobalLoading =
    enabled && (loadingN.isLoading === true || len === 0);

  const entryRows = !len
    ? null
    : items.map((entry, entryIndex) => {
        const isNear = nearView[entryIndex] ?? false;
        const hasEver = everInView[entryIndex] ?? false;
        const isDecoded = decodedReady[entryIndex] ?? false;

        const shouldMountContent = hasEver || isNear;
        const reveal = hasEver && isDecoded;
        const showSkeleton = !reveal;

        let contentNode: React.ReactNode = null;

        if (shouldMountContent) {
          const mediaArray = entry.media ?? [];
          const flatIndexByEntry = entryFlatIndexRef.current;

          const mediaNodes = mediaArray.map((media, mediaIndex) => {
            const globalIndex = flatIndexByEntry?.[entryIndex]?.[mediaIndex] ?? 0;

            const rawContent =
              typeof entries.render?.media === "function"
                ? entries.render.media({ entry, entryIndex, media, mediaIndex })
                : nodeFromMedia(media);

            const reg = (node: HTMLElement | null) => {
              registerExpandableImg?.(globalIndex, node);
            };

            const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
              e.preventDefault();
              if (!fsEnabled) return;

              if (entries.mediaLayout === "slider" && isClickRef && !isClickRef.current) return;

              openFullscreenAt(globalIndex, e.currentTarget as HTMLElement);
            };

            // if element, merge onClick (+ register)
            if (React.isValidElement(rawContent)) {
              const original = rawContent as React.ReactElement<any>;
              const origOnClick = original.props?.onClick;
              const origRef = (original as any).ref as React.Ref<HTMLElement> | undefined;

              const mergedOnClick: React.MouseEventHandler<any> = (e) => {
                if (typeof origOnClick === "function") origOnClick(e);
                if (e.defaultPrevented) return;
                handleClick(e);
              };

              // ✅ If it's a DOM element (img/div/button...), we can safely attach a ref.
              if (typeof original.type === "string") {
                const mergedRef: React.RefCallback<HTMLElement> = (node) => {
                  if (typeof origRef === "function") origRef(node);
                  else if (origRef && typeof origRef === "object") (origRef as any).current = node;
                  reg(node);
                };

                return React.cloneElement(original, {
                  key: `${entryIndex}-${mediaIndex}`,
                  onClick: mergedOnClick,
                  ref: mergedRef,
                });
              }

              // ✅ For custom components (no ref), wrap with a ref holder that doesn't affect layout
              return (
                <span
                  key={`${entryIndex}-${mediaIndex}`}
                  ref={reg as any}
                  style={{ display: "contents" }}
                >
                  {React.cloneElement(original, {
                    onClick: mergedOnClick,
                  })}
                </span>
              );
            }

            // non-element: wrap in button and register the wrapper
            return (
              <button
                key={`${entryIndex}-${mediaIndex}`}
                type="button"
                className={styles.entryMediaButton}
                onClick={handleClick}
                ref={reg as any}
              >
                {rawContent as any}
              </button>
            );
          });

          const mediaContainer = renderMediaContainer({ entryIndex, mediaNodes });

          contentNode =
            typeof entries.render?.card === "function"
              ? entries.render.card({ entry, entryIndex, media: mediaContainer })
              : mediaContainer;
        }

        const limit = introN.staggerLimit;
        const delayIndex = limit > 0 && entryIndex < limit ? entryIndex : 0;

        return (
          <div
            key={(entry as any).key ?? (entry as any).id ?? entryIndex}
            ref={setEntryRef(entryIndex)}
            data-rmg-entry-ready={reveal ? "1" : "0"}
            className={styles.entryRow}
            data-rmg-entry-owner={entryIndex}
            style={{ ["--rmg-entry-intro-index" as any]: delayIndex }}
          >
            <div className={styles.entrySkeletonWrap} aria-hidden={showSkeleton ? undefined : true}>
              <EntrySkeletonCard />
            </div>

            {shouldMountContent ? (
              <div className={styles.entryInner}>{contentNode}</div>
            ) : null}
          </div>
        );
      });

  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [styles.entryList].filter(Boolean).join(" "),
    style: {
      ["--rmg-entry-intro-stagger" as any]: `${introN.staggerMs}ms`,
      ["--rmg-entry-intro-transform" as any]: introN.transform,
      ["--rmg-entry-intro-duration" as any]: `${introN.durationMs}ms`,
      ["--rmg-entry-intro-easing" as any]: introN.easing,
    },
    "aria-busy": showGlobalLoading ? true : undefined,
  };

  const inner = <div {...containerProps}>{entryRows}</div>;

  // optional: allow wrapping with renderIntro like your other layouts
  return introN.renderIntro
    ? introN.renderIntro({ active: !showGlobalLoading, containerProps }, inner)
    : inner;
}