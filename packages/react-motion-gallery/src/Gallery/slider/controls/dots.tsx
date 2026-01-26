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
    const pos: React.CSSProperties =
      AX.main === 'y'
        ? { top: '50%', left: 10, transform: 'translateY(-50%)', flexDirection: 'column' }
        : { left: '50%', bottom: 10, transform: 'translateX(-50%)', flexDirection: 'row' };

    return (
      <div
        ref={ref}
        className={`rmgDots ${classNameContainer ?? ''}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.5)',
          padding: AX.main === 'y' ? '8px 4px' : '4px 8px',
          borderRadius: '9999px',
          cursor: 'auto',
          opacity: hidden ? 0 : 1,
          pointerEvents: hidden ? 'none' : 'auto',
          visibility: hidden ? 'hidden' : 'visible',
          ...pos,
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