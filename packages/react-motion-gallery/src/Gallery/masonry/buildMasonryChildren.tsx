import * as React from "react";

export type MasonryCell = {
  id: string;
  node: React.ReactNode;
};

export type BuildMasonryChildrenOpts = {
  cells: MasonryCell[];
  fsEnabled: boolean;
  openFullscreenAt: (index: number) => void;
  registerExpandableImg: (index: number, node: HTMLElement) => void;
  itemBaseClass: string;
  itemBaseStyleClass: string;
  itemClassName?: string;
};

export function buildMasonryChildren(opts: BuildMasonryChildrenOpts) {
  const {
    cells,
    fsEnabled,
    openFullscreenAt,
    registerExpandableImg,
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
        <button
          type="button"
          {...common}
          onClick={(e) => {
            e.preventDefault();
            if (!fsEnabled) return;
            openFullscreenAt(index);
          }}
        >
          {original as any}
        </button>
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

      if (node) registerExpandableImg(index, node);
    };

    const mergedOnClick: React.MouseEventHandler<HTMLElement> = (e) => {
      origProps.onClick?.(e);
      if (e.defaultPrevented) return;
      if (!fsEnabled) return;
      openFullscreenAt(index);
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