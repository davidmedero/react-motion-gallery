import * as React from "react";
import styles from "../Entries.module.css";
import type { EntriesOptions } from "../types";
import { useEntryInView } from "../hooks/useEntryInView";
import { useEntryDecodeReady } from "../hooks/useEntryDecodeReady";
import { EntrySkeletonCard, EntrySkeletonSpec } from "./EntrySkeleton";
import { useNormalizedEntriesIntro, useNormalizedEntriesLoading } from "../normalize";
import { MediaItem } from "../../shared/types/media";
import { SliderHandle } from "../../slider/types";

type Props = {
  enabled: boolean;
  entries: EntriesOptions;
  fsEnabled: boolean;
  openFullscreenAt: (globalIndex: number, originEl?: HTMLElement | null) => void;
  entryFlatIndexRef: React.RefObject<number[][] | null>;
  nodeFromMedia: (m: MediaItem) => React.ReactNode;
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
  renderMediaContainer,
  registerExpandableImg,
  entrySliderRefs,
}: Props) {
  const DRAG_PX = 6;

  const downPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const draggedRef = React.useRef(false);

  const onPointerDownCapture: React.PointerEventHandler<HTMLElement> = (e) => {
    if ((e as any).button != null && (e as any).button !== 0) return;

    draggedRef.current = false;
    downPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMoveCapture: React.PointerEventHandler<HTMLElement> = (e) => {
    const p = downPosRef.current;
    if (!p) return;

    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;

    if (!draggedRef.current && dx * dx + dy * dy >= DRAG_PX * DRAG_PX) {
      draggedRef.current = true;
    }
  };

  const onPointerUpCapture: React.PointerEventHandler<HTMLElement> = () => {
    downPosRef.current = null;

    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  };

  const shouldBlockClick = () => draggedRef.current;

  function resolveEntrySkeletonSpec(entry: any, entryIndex: number): EntrySkeletonSpec {
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

  const items = entries.items ?? [];
  const len = items.length;

  const revealOrderRef = React.useRef<number>(0);
  const revealOrderByEntryRef = React.useRef<number[]>([]);
  if (revealOrderByEntryRef.current.length !== len) {
    revealOrderByEntryRef.current = Array.from({ length: len }, () => -1);
    revealOrderRef.current = 0;
  }

  const loadingN = useNormalizedEntriesLoading(entries);
  const introN = useNormalizedEntriesIntro(entries);

  const loadingOpts = (entries as any)?.loading as { enabled?: boolean; force?: boolean } | undefined;
  const loadingEnabled = loadingOpts?.enabled ?? true;
  const loadingForce = loadingOpts?.force ?? false;

  const loadingActive = enabled && loadingEnabled;
  const forceLoading = loadingActive && loadingForce;

  const { nearView, everInView, setEntryRef } = useEntryInView(len, {
    root: null,
    nearMargin: loadingN.nearMargin,
    viewMargin: loadingN.viewMargin,
    threshold: loadingN.threshold,
  });

  const decodeGateEnabled = loadingActive && !forceLoading;

  const { decodedReady } = useEntryDecodeReady(decodeGateEnabled, items as any, nearView, {
    timeoutMs: loadingN.decodeTimeoutMs,
  });

  const showGlobalLoading = loadingActive && (forceLoading || len === 0);

  const entryRows = !len
    ? null
    : items.map((entry, entryIndex) => {
        const isNear = nearView[entryIndex] ?? false;
        const hasEver = everInView[entryIndex] ?? false;
        const isDecoded = decodedReady[entryIndex] ?? false;

        const shouldMountContent = hasEver || isNear;

        const reveal = forceLoading
          ? false
          : loadingActive
            ? hasEver && (loadingN.waitForDecode ? isDecoded : true)
            : shouldMountContent;

        const showSkeleton = forceLoading
          ? true
          : loadingActive
            ? shouldMountContent && !reveal
            : false;

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

            if (React.isValidElement(rawContent)) {
              const original = rawContent as React.ReactElement<any>;
              const origOnClick = original.props?.onClick;
              const origRef = (original as any).ref as React.Ref<HTMLElement> | undefined;

              const mergedOnClick: React.MouseEventHandler<any> = (e) => {
                if (typeof origOnClick === "function") origOnClick(e);
                if (e.defaultPrevented) return;
                handleClick(e);
              };

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

        const skeletonOverride =
          typeof (entries.render as any)?.skeleton === "function"
            ? (entries.render as any).skeleton({ entry, entryIndex })
            : null;

        const spec = resolveEntrySkeletonSpec(entry, entryIndex);
        const skelWrap = loadingN.skeletonWrap;

        if (reveal && revealOrderByEntryRef.current[entryIndex] === -1) {
          revealOrderByEntryRef.current[entryIndex] = revealOrderRef.current++;
        }

        const order = revealOrderByEntryRef.current[entryIndex];
        const introDelayMs = order >= 0 ? order * introN.staggerMs : 0;

        return (
          <div
            key={(entry as any).key ?? (entry as any).id ?? entryIndex}
            ref={setEntryRef(entryIndex)}
            data-rmg-entry-ready={reveal ? "1" : "0"}
            data-rmg-entry-mounted={shouldMountContent ? "1" : "0"}
            className={[styles.entryRow, entries.entryRow?.className].filter(Boolean).join(" ")}
            data-rmg-entry-owner={entryIndex}
            style={{
              ["--rmg-entry-min-height" as any]: loadingN.minHeight,
              ["--rmg-entry-intro-index" as any]: delayIndex,
              ["--rmg-entry-intro-delay" as any]: `${introDelayMs}ms`,
              ...entries.entryRow?.style,
            }}
          >
            {loadingActive ? (
              <div
                className={[styles.entrySkeletonWrap, skelWrap?.className].filter(Boolean).join(" ")}
                style={skelWrap?.style}
                aria-hidden={showSkeleton ? undefined : true}
              >
                {skeletonOverride ?? <EntrySkeletonCard spec={spec} />}
              </div>
            ) : null}

            {shouldMountContent ? <div className={styles.entryInner}>{contentNode}</div> : null}
          </div>
        );
      });

  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: [styles.entryList, entries.entryList?.className].filter(Boolean).join(" "),
    style: {
      ["--rmg-entry-intro-stagger" as any]: `${introN.staggerMs}ms`,
      ["--rmg-entry-intro-duration" as any]: `${introN.durationMs}ms`,
      ["--rmg-entry-intro-easing" as any]: introN.easing,
      ...entries.entryList?.style,
    },
    "aria-busy": showGlobalLoading ? true : undefined,
  };

  const inner = <div {...containerProps}>{entryRows}</div>;

  return introN.renderIntro
    ? introN.renderIntro({ active: !showGlobalLoading, containerProps }, inner)
    : inner;
}