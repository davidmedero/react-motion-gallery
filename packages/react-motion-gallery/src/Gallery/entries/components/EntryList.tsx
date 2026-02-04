import * as React from "react";
import styles from "../../styles.module.css";
import type { EntriesOptions } from "../types";
import { useEntryInView } from "../hooks/useEntryInView";
import { useEntryDecodeReady } from "../hooks/useEntryDecodeReady";
import { EntrySkeletonCard, EntrySkeletonSpec } from "./EntrySkeleton";
import { useNormalizedEntriesIntro, useNormalizedEntriesLoading } from "../normalize";
import { MediaItem } from "../../shared/types/media";
import { SliderHandle } from "../../slider/types";

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
    entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
  }) => React.ReactNode;

  registerExpandableImg?: (globalIndex: number, node: HTMLElement | null) => void;
  entrySliderRefs?: React.RefObject<Array<SliderHandle | null>>;
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
  registerExpandableImg,
  entrySliderRefs
}: Props) {
    // --- click suppression when user dragged ---
  const DRAG_PX = 6;

  const downPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const draggedRef = React.useRef(false);

  const onPointerDownCapture: React.PointerEventHandler<HTMLElement> = (e) => {
    // only primary button / touch
    if ((e as any).button != null && (e as any).button !== 0) return;

    draggedRef.current = false;
    downPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMoveCapture: React.PointerEventHandler<HTMLElement> = (e) => {
    const p = downPosRef.current;
    if (!p) return;

    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;

    if (!draggedRef.current && (dx * dx + dy * dy) >= DRAG_PX * DRAG_PX) {
      draggedRef.current = true;
    }
  };

  const onPointerUpCapture: React.PointerEventHandler<HTMLElement> = () => {
    downPosRef.current = null;

    // Clear on next tick so the synthetic click that follows pointerup is still blocked
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  };

  const shouldBlockClick = () => draggedRef.current;

  function buildEntrySkeletonSpec(entry: any, entryIndex: number): EntrySkeletonSpec {
    const mediaCount = Array.isArray(entry?.media) ? entry.media.length : 0;

    return {
      header: { showAvatar: true, lines: ["short", "long"] },
      body: { lines: ["long", "medium"] },
      media: {
        count: Math.max(1, Math.min(mediaCount || 1, 6)), // 1
        heightPx: 260,
        columns: mediaCount >= 4 ? 2 : 1,
        gapPx: 20,
      },
    };
  }

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
        const showSkeleton = shouldMountContent && !reveal;

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
                  onClick: (e: any) => {
                    if (shouldBlockClick()) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    mergedOnClick(e);
                  },
                  onPointerDownCapture,
                  onPointerMoveCapture,
                  onPointerUpCapture,
                  ref: mergedRef,
                });
              }

              // ✅ For custom components (no ref), wrap with a ref holder that doesn't affect layout
              return (
                <span
                  key={`${entryIndex}-${mediaIndex}`}
                  ref={reg as any}
                  style={{ display: "contents" }}
                  onPointerDownCapture={onPointerDownCapture as any}
                  onPointerMoveCapture={onPointerMoveCapture as any}
                  onPointerUpCapture={onPointerUpCapture as any}
                >
                  {React.cloneElement(original, {
                    onClick: (e: any) => {
                      if (shouldBlockClick()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      mergedOnClick(e);
                    },
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

          const mediaContainer = renderMediaContainer({ entryIndex, mediaNodes, entrySliderRefs });

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
            style={{ ["--rmg-entry-intro-index" as any]: delayIndex, minHeight: 260 }}
          >
            <div className={styles.entrySkeletonWrap} aria-hidden={showSkeleton ? undefined : true}>
              <EntrySkeletonCard spec={buildEntrySkeletonSpec(entry, entryIndex)} />
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