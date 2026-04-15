'use client';

import * as React from 'react';
import { DotsRenderArgs } from '../../shared/types/controls';

export type BuildDotsNodeArgs = {
  AX: { main: 'x' | 'y'; clientKey: string };
  slider: React.RefObject<HTMLElement | null>;
  sliderWidth: React.RefObject<number>;
  wrap: boolean;
  showDots?: boolean;
  selectedIndex: React.RefObject<number>;
  slides: React.RefObject<{ cells: { element: HTMLElement; index: number; }[]; target: number; }[]>
  dotsContainerRef: React.RefObject<HTMLDivElement | null>;
  dotRefs: React.RefObject<Array<HTMLElement | null>>;
  isScrolling: React.RefObject<boolean>;
  goToIndex: (i: number) => void;
  renderDots?: (args: DotsRenderArgs) => React.ReactNode;
  createRipple: (el: HTMLElement) => void;
  styles: Record<string, string>;
  dotsContainerStyles?: React.CSSProperties;
  dotsStyles?: React.CSSProperties;
  dotsContainerClassName?: string;
  dotsClassName?: string;
};

export function getDotsHidden(args: {
  AX: { clientKey: string };
  slider: React.RefObject<HTMLElement | null>;
  sliderWidth: React.RefObject<number>;
  showDots?: boolean;
}) {
  const { AX, slider, sliderWidth, showDots } = args;

  const clientMain = slider.current ? ((slider.current as any)[AX.clientKey] as number) : 0;

  const dotsAutoHidden = !!(slider.current && (sliderWidth.current <= clientMain));
  const dotsHidden = !showDots || dotsAutoHidden;

  return { clientMain, dotsAutoHidden, dotsHidden };
}

export function DefaultDotsFactory(
  args: Pick<BuildDotsNodeArgs, 'AX' | 'createRipple' | 'styles' | 'dotsContainerStyles' | 'dotsStyles'>
) {
  const { AX, createRipple, styles, dotsContainerStyles, dotsStyles } = args;

  return function DefaultDots({
    ref,
    count,
    activeIndex,
    hidden,
    goTo,
    getDotRef,
    classNameContainer,
    classNameDot,
  }: DotsRenderArgs) {
    return (
      <div
        ref={ref}
        data-rmg-part="dots"
        data-rmg-axis={AX.main}
        className={[
          styles.dotsRoot,
          AX.main === 'y' ? styles.dotsRootY : styles.dotsRootX,
          'rmgDots',
          classNameContainer ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          opacity: hidden ? 0 : 1,
          pointerEvents: hidden ? 'none' : 'auto',
          visibility: hidden ? 'hidden' : 'visible',
          ...(dotsContainerStyles || {}),
        }}
      >
        {Array.from({ length: count }).map((_, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={index}
              ref={getDotRef(index)}
              onMouseDown={(e) => {
                createRipple(e.currentTarget as HTMLElement);
              }}
              onClick={() => goTo(index)}
              className={[
                styles.pagination_dot,
                isActive ? styles.active : styles.inactive,
                'rmgDot',
                classNameDot ?? '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                ...(dotsStyles || {}),
              }}
            />
          );
        })}
      </div>
    );
  };
}

export function buildDotsNode(args: BuildDotsNodeArgs) {
  const {
    AX,
    slider,
    sliderWidth,
    showDots,
    selectedIndex,
    slides,
    dotsContainerRef,
    dotRefs,
    isScrolling,
    goToIndex,
    renderDots,
    createRipple,
    styles,
    dotsContainerStyles,
    dotsStyles,
    dotsContainerClassName,
    dotsClassName,
  } = args;

  const { dotsHidden } = getDotsHidden({ AX, slider, sliderWidth, showDots });

  const DefaultDots = DefaultDotsFactory({
    AX,
    createRipple,
    styles,
    dotsContainerStyles,
    dotsStyles,
  });

  const node = (renderDots ?? DefaultDots)({
    ref: dotsContainerRef,
    count: slides.current?.length ?? 0,
    activeIndex: selectedIndex.current,
    hidden: dotsHidden,
    goTo: (i: number) => {
      isScrolling.current = false;
      requestAnimationFrame(() => goToIndex(i));
    },
    getDotRef: (i: number) => (el: HTMLDivElement | null) => {
      dotRefs.current[i] = el;
    },
    createRipple,
    classNameContainer: dotsContainerClassName,
    classNameDot: dotsClassName,
  } as any);

  return { dotsHidden, dotsNode: node };
}
