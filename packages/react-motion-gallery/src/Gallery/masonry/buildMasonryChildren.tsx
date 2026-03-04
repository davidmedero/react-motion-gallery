import * as React from "react";

export type MasonryCell = {
  id: string;
  node: React.ReactNode;
};

export type BuildMasonryChildrenOpts = {
  cells: MasonryCell[];
  fsEnabled: boolean;
  openFullscreenAt: (index: number, originEl?: HTMLElement | null) => void;
  registerExpandableImage: (index: number, node: HTMLImageElement | null) => void;
  itemBaseClass: string;
  itemBaseStyleClass: string;
  itemClassName?: string;
};

const getOriginImage = (el: HTMLElement | null): HTMLImageElement | null => {
  if (!el) return null;
  if (el instanceof HTMLImageElement) return el;

  const img = el.querySelector("img") as HTMLImageElement | null;
  return img;
};

export function buildMasonryChildren(opts: BuildMasonryChildrenOpts) {
  const {
    cells,
    fsEnabled,
    openFullscreenAt,
    registerExpandableImage,
    itemBaseClass,
    itemBaseStyleClass,
    itemClassName,
  } = opts;

  return cells.map((cell, index) => {
    const original = cell.node;

    const introStyle: React.CSSProperties & Record<string, any> = {
      ["--rmg-intro-index" as any]: index,
    };

    const className = [itemBaseClass, itemBaseStyleClass, itemClassName || ""]
      .filter(Boolean)
      .join(" ");

    const common = {
      key: cell.id,
      "data-rmg-idx": index,
      style: introStyle,
      className,
    } as const;

    if (!React.isValidElement(original)) {
      return (
        <div
          {...common}
          onClick={(e) => {
            e.preventDefault();
            if (!fsEnabled) return;
            const host = e.currentTarget as HTMLElement;
            openFullscreenAt(index, host);
          }}
          ref={(node) => {
            const media = getOriginImage(node);
            registerExpandableImage(index, media);
          }}
        >
          {original as any}
        </div>
      );
    }

    const originalEl = original as React.ReactElement<any, any>;

    const origProps = (originalEl.props ?? {}) as {
      onClick?: React.MouseEventHandler<HTMLElement>;
      className?: string;
      style?: React.CSSProperties;
    };

    const origRef = (originalEl as any).ref as React.Ref<HTMLElement> | undefined;

    const mergedRef: React.RefCallback<HTMLElement> = (node) => {
      if (typeof origRef === "function") origRef(node);
      else if (origRef && typeof origRef === "object") (origRef as any).current = node;

      const media = getOriginImage(node);
      registerExpandableImage(index, media);
    };

    const mergedOnClick: React.MouseEventHandler<HTMLElement> = (e) => {
      origProps.onClick?.(e);
      if (e.defaultPrevented) return;
      if (!fsEnabled) return;
      const host = e.currentTarget as HTMLElement;
      openFullscreenAt(index, host);
    };

    return React.cloneElement<any>(originalEl, {
      key: cell.id,
      ref: mergedRef,
      onClick: mergedOnClick,
      "data-rmg-idx": index,
      className: [itemBaseClass, itemBaseStyleClass, origProps.className || "", itemClassName || ""]
        .filter(Boolean)
        .join(" "),
      style: {
        ...(origProps.style || {}),
        ...introStyle,
      },
    });
  });
}