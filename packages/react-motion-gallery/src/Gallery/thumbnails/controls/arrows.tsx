import * as React from "react";

export type ArrowRenderArgs = {
  ref: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
  hidden: boolean;
  disabled: boolean;
  createRipple: (el: HTMLElement) => void;
  className?: string;
};

export type ArrowsRenderArgs = ArrowRenderArgs & { dir: "prev" | "next" };

export type RmgArrowsProps = {
  axisMain: "x" | "y";
  clientKey: "clientWidth" | "clientHeight";
  wrap: boolean;
  isRtl: boolean;
  showArrows?: boolean;
  selectedIndex: number;
  slideCount: number;
  measureRef: React.RefObject<HTMLElement | null>;
  viewportMainSizeRef: React.RefObject<number>;
  previous: () => void;
  next: () => void;
  prevButtonRef: React.RefObject<HTMLDivElement | null>;
  nextButtonRef: React.RefObject<HTMLDivElement | null>;
  createRipple: (el: HTMLElement) => void;
  arrowStyles?: React.CSSProperties;
  prevArrowStyles?: React.CSSProperties;
  nextArrowStyles?: React.CSSProperties;
  arrowClassName?: string;
  prevArrowClassName?: string;
  nextArrowClassName?: string;
  renderPrevArrow?: (args: ArrowRenderArgs) => React.ReactNode;
  renderNextArrow?: (args: ArrowRenderArgs) => React.ReactNode;
  renderArrows?: (args: ArrowsRenderArgs) => React.ReactNode;
};

function DefaultChevron({
  axisMain,
  direction,
  size = 32,
}: {
  axisMain: "x" | "y";
  direction: "prev" | "next";
  size?: number;
}) {
  const pathPrev = <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />;
  const pathNext = <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />;

  if (axisMain === "y") {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="#000"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}
      >
        {direction === "prev" ? pathPrev : pathNext}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="#000"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {direction === "prev" ? pathPrev : pathNext}
    </svg>
  );
}

const baseArrowStyle: React.CSSProperties = {
  position: "absolute",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.75)",
  boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
  borderRadius: "100%",
  zIndex: 2,
  width: 36,
  height: 36,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "opacity 120ms",
};

function prevPlacement(axisMain: "x" | "y"): React.CSSProperties {
  return axisMain === "y"
    ? { left: "50%", top: 10, transform: "translateX(-50%)" }
    : { left: 10, top: "50%", transform: "translateY(-50%)" };
}

function nextPlacement(axisMain: "x" | "y"): React.CSSProperties {
  return axisMain === "y"
    ? { left: "50%", bottom: 10, transform: "translateX(-50%)" }
    : { right: 10, top: "50%", transform: "translateY(-50%)" };
}

export function RmgArrows(props: RmgArrowsProps) {
  const {
    axisMain,
    clientKey,
    wrap,
    isRtl,
    showArrows,
    selectedIndex,
    slideCount,
    measureRef,
    viewportMainSizeRef,
    previous,
    next,
    prevButtonRef,
    nextButtonRef,
    createRipple,
    arrowStyles,
    prevArrowStyles,
    nextArrowStyles,
    arrowClassName,
    prevArrowClassName,
    nextArrowClassName,
    renderPrevArrow,
    renderNextArrow,
    renderArrows,
  } = props;

  const atFirst = !wrap && selectedIndex <= 0;
  const atLast = !wrap && selectedIndex >= Math.max(0, slideCount - 1);

  const clientMain = measureRef.current
    ? ((measureRef.current as any)[clientKey] as number)
    : 0;

  const arrowsAutoHidden =
    !(slideCount > 1 && measureRef.current && viewportMainSizeRef.current > clientMain);

  const arrowsHidden = !showArrows || arrowsAutoHidden;

  const prevDisabled = arrowsHidden || (!wrap && (isRtl ? atLast : atFirst));
  const nextDisabled = arrowsHidden || (!wrap && (isRtl ? atFirst : atLast));

  const prevArrowStylesEffective: React.CSSProperties = {
    ...(arrowStyles ?? {}),
    ...(prevArrowStyles ?? {}),
  };

  const nextArrowStylesEffective: React.CSSProperties = {
    ...(arrowStyles ?? {}),
    ...(nextArrowStyles ?? {}),
  };

  const prevArrowClassNameEffective = [arrowClassName, prevArrowClassName]
    .filter(Boolean)
    .join(" ");

  const nextArrowClassNameEffective = [arrowClassName, nextArrowClassName]
    .filter(Boolean)
    .join(" ");

  function makeArrowOnClick(dir: "prev" | "next", hidden: boolean) {
    return () => {
      if (hidden) return;
      requestAnimationFrame(() => {
        if (dir === "prev") previous();
        else next();
      });
    };
  }

  const DefaultArrow = ({
    dir,
    ref,
    onClick,
    hidden,
    disabled,
    className,
  }: ArrowRenderArgs & { dir: "prev" | "next" }) => {
    const dim = disabled ? 0.35 : 1;
    const placement = dir === "prev" ? prevPlacement(axisMain) : nextPlacement(axisMain);
    const perDirStyles = dir === "prev" ? prevArrowStylesEffective : nextArrowStylesEffective;

    return (
      <div
        ref={ref}
        className={`rmgArrow rmgArrow--${dir} ${className ?? ""}`}
        onClick={(evt) => {
          if (hidden) return;
          createRipple(evt.currentTarget as HTMLElement);
          requestAnimationFrame(() => onClick());
        }}
        style={{
          ...baseArrowStyle,
          ...placement,
          ...perDirStyles,
          cursor: disabled ? "default" : "pointer",
          opacity: hidden ? 0 : dim,
          pointerEvents: hidden ? "none" : "auto",
          visibility: hidden ? "hidden" : "visible",
        }}
        aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
        role="button"
        title={
          disabled
            ? dir === "prev"
              ? "At first slide"
              : "At last slide"
            : dir === "prev"
            ? "Previous"
            : "Next"
        }
      >
        <DefaultChevron axisMain={axisMain} direction={dir} size={32} />
      </div>
    );
  };

  const renderArrow = (dir: "prev" | "next", args: ArrowRenderArgs) => {
    if (dir === "prev" && renderPrevArrow) return renderPrevArrow(args);
    if (dir === "next" && renderNextArrow) return renderNextArrow(args);
    if (renderArrows) return renderArrows({ ...args, dir });
    return DefaultArrow({ ...args, dir });
  };

  const prevArrowNode = renderArrow("prev", {
    ref: prevButtonRef,
    hidden: arrowsHidden,
    disabled: prevDisabled,
    onClick: makeArrowOnClick("prev", arrowsHidden),
    createRipple,
    className: prevArrowClassNameEffective,
  });

  const nextArrowNode = renderArrow("next", {
    ref: nextButtonRef,
    hidden: arrowsHidden,
    disabled: nextDisabled,
    onClick: makeArrowOnClick("next", arrowsHidden),
    createRipple,
    className: nextArrowClassNameEffective,
  });

  return (
    <>
      {prevArrowNode}
      {nextArrowNode}
    </>
  );
}