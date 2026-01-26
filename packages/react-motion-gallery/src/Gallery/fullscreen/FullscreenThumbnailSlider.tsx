/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import ThumbnailSlider from '../slider/thumbnails/ThumbnailSlider'
import createIndexChannel from '../slider/sliderSub'
import type { FullscreenSliderSub } from './fullscreenSliderSub'
import { BreakpointMap } from '../shared/responsive'
import { ThumbnailPosition } from '../slider/thumbnails/types'

type FSItem = {
  thumbSrc: string
  alt?: string
}

type ArrowRenderArgs = {
  ref: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
  hidden: boolean;
  disabled: boolean;
  createRipple: (el: HTMLElement) => void;
  className?: string;
};

interface FullscreenThumbnailSliderProps {
  items: FSItem[]
  position: ThumbnailPosition
  fsSub: FullscreenSliderSub
  className?: string
  style?: React.CSSProperties
  thumbnailWidth?: number | string
  thumbnailHeight?: number | string
  thumbnailsCenter?: boolean;
  thumbnailsContainerWidth?: number | string
  thumbnailsContainerHeight?: number | string
  visible?: boolean
  invisible?: boolean
  fadeDurationMs?: number
  thumbnailItemClassName?: string
  thumbnailItemStyle?: React.CSSProperties
  gap?: number
  freeScroll?: boolean;
  groupCells?: boolean
  loop?: boolean
  direction?: 'ltr' | 'rtl';
  axis?: 'x' | 'y';
  skipSnaps?: boolean;
  centerActiveThumb?: boolean;
  selectDuration?: number;
  freeScrollDuration?: number;
  sliderFriction?: number;
  breakpointMap?: BreakpointMap;
  rippleEnabled?: boolean;
  rippleClassName?: string;
  showArrows?: boolean;
  arrowStyles?: React.CSSProperties;
  arrowClassName?: string;
  prevArrowStyles?: React.CSSProperties;
  prevArrowClassName?: string;
  nextArrowStyles?: React. CSSProperties;
  nextArrowClassName?: string;
  renderArrows?: (args: ArrowRenderArgs & { dir: "prev" | "next" }) => React.ReactNode;
  renderPrevArrow?: (args: ArrowRenderArgs) => React.ReactNode;
  renderNextArrow?: (args: ArrowRenderArgs) => React.ReactNode;
}

export default function FullscreenThumbnailSlider({
  items,
  position,
  fsSub,
  className,
  style,
  thumbnailWidth,
  thumbnailHeight,
  thumbnailsCenter,
  thumbnailsContainerWidth,
  thumbnailsContainerHeight,
  visible = true,
  invisible = false,
  fadeDurationMs = 300,
  thumbnailItemClassName,
  thumbnailItemStyle,
  gap,
  freeScroll,
  groupCells,
  loop,
  direction,
  skipSnaps,
  centerActiveThumb,
  selectDuration,
  freeScrollDuration,
  sliderFriction,
  breakpointMap = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  rippleEnabled,
  rippleClassName,
  showArrows = false,
  arrowStyles,
  arrowClassName,
  prevArrowStyles,
  prevArrowClassName,
  nextArrowStyles,
  nextArrowClassName,
  renderArrows,
  renderPrevArrow,
  renderNextArrow
}: FullscreenThumbnailSliderProps) {
  const channelRef = useRef(createIndexChannel(fsSub.get(), 'animated'))

  useEffect(() => {
    const off = fsSub.onEvent((e) => {
      if (e.type === 'internalIndex') {
        channelRef.current.set(e.index, 'animated', { silent: false })
      }
    })
    return off
  }, [fsSub])

  useEffect(() => {
    channelRef.current.set(fsSub.get(), 'animated', { silent: true })
  }, [fsSub])

  const children = useMemo(
    () =>
      items.map((item, i) => (
        <button
          key={`fs-thumb-${i}`}
          type="button"
          style={{
            border: 'none',
            padding: 0,
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <img
            src={item.thumbSrc}
            alt={item.alt ?? `thumb-${i}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            draggable={false}
          />
        </button>
      )),
    [items]
  )

  const isOpen   = visible && !invisible

  const opacity = isOpen ? 1 : 0
  const transform = isOpen ? 'translateY(0)' : 'translateY(8px)'
  const pointerEvents: React.CSSProperties['pointerEvents'] =
    isOpen ? 'auto' : 'none'

  const wrapperStyle: React.CSSProperties = {
    opacity,
    transform,
    pointerEvents,
    transition: `
      opacity ${fadeDurationMs}ms cubic-bezier(.4,0,.22,1),
      transform ${fadeDurationMs}ms cubic-bezier(.4,0,.22,1)
    `,
  }

  return (
    <div style={wrapperStyle} className={className}>
      <ThumbnailSlider
        position={position}
        thumbnailWidth={thumbnailWidth}
        thumbnailHeight={thumbnailHeight}
        indexChannel={channelRef.current}
        style={style}
        onSelectThumb={(idx) => fsSub.requestSet(idx, 'animated')}
        thumbnailsCenter={thumbnailsCenter}
        thumbnailsContainerWidth={thumbnailsContainerWidth}
        thumbnailsContainerHeight={thumbnailsContainerHeight}
        thumbnailItemClassName={thumbnailItemClassName}
        thumbnailItemStyle={thumbnailItemStyle}
        gap={gap}
        freeScroll={freeScroll}
        groupCells={groupCells}
        loop={loop}
        direction={direction}
        skipSnaps={skipSnaps}
        centerActiveThumb={centerActiveThumb}
        selectDuration={selectDuration}
        freeScrollDuration={freeScrollDuration}
        sliderFriction={sliderFriction}
        breakpointMap={breakpointMap}
        rippleEnabled={rippleEnabled}
        rippleClassName={rippleClassName}
        showArrows={showArrows}
        arrowStyles={arrowStyles}
        arrowClassName={arrowClassName}
        prevArrowStyles={prevArrowStyles}
        prevArrowClassName={prevArrowClassName}
        nextArrowStyles={nextArrowStyles}
        nextArrowClassName={nextArrowClassName}
        renderArrows={renderArrows}
        renderPrevArrow={renderPrevArrow}
        renderNextArrow={renderNextArrow}
      >
        {children}
      </ThumbnailSlider>
    </div>
  )
}