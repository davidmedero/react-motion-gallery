import * as React from "react";
import { RmgSlideProvider } from "../shared/slideContext";
import type { RmgSlideStoreBag } from "../shared/slideStoreBag";
import type { FullscreenTrigger } from "./types";
import type { MasonryCell } from "./item";
import type { ResponsiveMasonrySpan } from "./types";

const FULLSCREEN_TRIGGER_SELECTOR = "[data-rmg-fullscreen-trigger]";
const MEDIA_FULLSCREEN_SELECTOR =
  `${FULLSCREEN_TRIGGER_SELECTOR},img,video,[data-rmg-plyr="true"],.plyr,iframe`;

export type BuiltMasonryChild = {
  id: string;
  node: React.ReactNode;
  span?: ResponsiveMasonrySpan;
};

export type BuildMasonryChildrenOpts = {
  cells: MasonryCell[];
  fsEnabled: boolean;
  fullscreenTrigger: FullscreenTrigger;
  openFullscreenAt: (index: number, originEl?: HTMLElement | null) => void;
  registerExpandableImage: (index: number, node: HTMLElement | null) => void;
  itemBaseClass: string;
  itemBaseStyleClass: string;
  itemClassName?: string;
  itemWrapClassName?: string;
  itemWrapStyle?: React.CSSProperties;
  slideStoreBag?: RmgSlideStoreBag;
};

function findMediaFromClickTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof HTMLElement)) return null;

  const el = target.closest(MEDIA_FULLSCREEN_SELECTOR);
  return el instanceof HTMLElement ? el : null;
}

export function buildMasonryChildren(opts: BuildMasonryChildrenOpts): BuiltMasonryChild[] {
  const {
    cells,
    fsEnabled,
    fullscreenTrigger,
    openFullscreenAt,
    registerExpandableImage,
    itemBaseClass,
    itemBaseStyleClass,
    itemClassName,
    itemWrapClassName,
    itemWrapStyle,
    slideStoreBag,
  } = opts;

  return cells.map((cell, index) => {
    const original = cell.node;
    const revealStyle: React.CSSProperties & Record<string, any> = {
      ["--rmg-reveal-index" as any]: index,
    };

    const className = [
      itemBaseClass,
      itemBaseStyleClass,
      itemClassName || "",
      itemWrapClassName || "",
      cell.layoutMeta?.className || "",
    ]
      .filter(Boolean)
      .join(" ");

    const itemStyle: React.CSSProperties & Record<string, any> = {
      ...(itemWrapStyle || {}),
      ...(cell.layoutMeta?.style || {}),
      ...revealStyle,
    };
    const scopedOriginal = (
      <RmgSlideProvider value={{ normIdx: index, isClone: false, storeBag: slideStoreBag }}>
        {original as any}
      </RmgSlideProvider>
    );

    const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
      if (e.defaultPrevented) return;
      if (!fsEnabled) return;

      const originEl =
        fullscreenTrigger === "media"
          ? findMediaFromClickTarget(e.target)
          : e.currentTarget;

      if (!originEl) return;
      openFullscreenAt(index, originEl);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (!fsEnabled) return;
      if (fullscreenTrigger !== "item") return;
      openFullscreenAt(index, e.currentTarget);
    };

    return {
      id: cell.id,
      span: cell.layoutMeta?.span,
      node: (
        <div
          data-rmg-idx={index}
          data-rmg-fullscreen-enabled={fsEnabled ? "true" : undefined}
          data-rmg-fullscreen-trigger-mode={fsEnabled ? fullscreenTrigger : undefined}
          className={className}
          style={itemStyle}
          onClick={onClick}
          onKeyDown={onKeyDown}
          ref={(node) => {
            registerExpandableImage(index, node);
          }}
          role={fsEnabled && fullscreenTrigger === "item" ? "button" : undefined}
          tabIndex={fsEnabled && fullscreenTrigger === "item" ? 0 : undefined}
        >
          {scopedOriginal}
        </div>
      ),
    };
  });
}
