/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import ThumbnailSlider from '../thumbnails'
import { createSliderIndexChannel } from '../slider/sliderSub'
import type { ThumbnailsOptions } from '../thumbnails/types'
import { createFullscreenThumbnailSyncBridge } from './syncBridge'
import type { FullscreenThumbnailSliderProps } from './types'

function clampIndex(index: number, len: number) {
  if (len <= 0 || !Number.isFinite(index)) return 0
  const whole = Math.trunc(index)
  return Math.max(0, Math.min(len - 1, whole))
}

export default function FullscreenThumbnailSlider({
  bridge,
  items,
  position,
  containerClassName,
  containerStyle,
  thumbnailWidth,
  thumbnailHeight,
  thumbnailsCenter,
  thumbnailsContainerWidth,
  thumbnailsContainerHeight,
  fadeDurationMs = 300,
  fadeEasing = 'cubic-bezier(.4,0,.22,1)',
  thumbnailItemClassName,
  thumbnailItemStyle,
  gap,
  freeScroll,
  groupCells,
  loop,
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
  const { fsSub, mountEl, visible, invisible, direction, registerLayout, clearLayout } = bridge
  const itemCount = items.length
  const channelRef = useRef(
    createSliderIndexChannel(clampIndex(fsSub.get(), itemCount), 'animated')
  )
  const thumbsReadyRef = useRef(false)
  const didInitialSnapThisOpenRef = useRef(false)
  const syncBridgeRef = useRef(
    createFullscreenThumbnailSyncBridge({
      localChannel: channelRef.current,
      fsSub,
      clampIndex: (index) => clampIndex(index, itemCount),
    })
  )

  function snapToCurrentFsIndex(mode: 'instant' | 'animated' = 'instant') {
    const idx = clampIndex(fsSub.get(), itemCount)
    channelRef.current.set(idx, mode, { silent: false })
  }

  useEffect(() => {
    syncBridgeRef.current = createFullscreenThumbnailSyncBridge({
      localChannel: channelRef.current,
      fsSub,
      clampIndex: (index) => clampIndex(index, itemCount),
    })

    const cleanup = syncBridgeRef.current.start()
    return () => cleanup()
  }, [fsSub, itemCount])

  useEffect(() => {
    registerLayout({
      position,
      className: containerClassName,
      style: containerStyle,
      fadeDurationMs,
      fadeEasing,
    })
  }, [
    registerLayout,
    position,
    containerClassName,
    containerStyle,
    fadeDurationMs,
    fadeEasing,
  ])

  useEffect(() => {
    return () => {
      clearLayout()
    }
  }, [clearLayout])

  useEffect(() => {
    const isOpen = visible && !invisible
    if (!isOpen) {
      didInitialSnapThisOpenRef.current = false
      return
    }
    if (thumbsReadyRef.current && !didInitialSnapThisOpenRef.current) {
      snapToCurrentFsIndex('instant')
      didInitialSnapThisOpenRef.current = true
    }
  }, [visible, invisible, itemCount, fsSub])

  const children = useMemo(
    () =>
      items.map((item, i) => (
        <img
          key={`fs-thumb-${i}`}
          src={item.thumbSrc}
          alt={item.alt ?? `thumb-${i}`}
          style={{
            width: 'inherit',
            height: 'inherit',
            objectFit: 'contain',
            display: 'block',
          }}
          draggable={false}
        />
      )),
    [items]
  )

  const isOpen   = visible && !invisible

  const opacity = isOpen ? 1 : 0
  const transform = isOpen ? 'translateY(0)' : 'translateY(8px)'
  const pointerEvents: React.CSSProperties['pointerEvents'] =
    isOpen ? 'auto' : 'none'

  const resolvedContainerWidth = thumbnailsContainerWidth ?? containerStyle?.width
  const resolvedContainerHeight = thumbnailsContainerHeight ?? containerStyle?.height

  const wrapperStyle: React.CSSProperties = {
    opacity,
    transform,
    pointerEvents,
    transition: `
      opacity ${fadeDurationMs}ms ${fadeEasing},
      transform ${fadeDurationMs}ms ${fadeEasing}
    `,
  }

  const thumbnailOptions = useMemo<ThumbnailsOptions>(
    () => ({
      layout: {
        position,
        thumbnail: {
          width: thumbnailWidth,
          height: thumbnailHeight,
        },
        center: thumbnailsCenter,
        container: {
          width: resolvedContainerWidth,
          height: resolvedContainerHeight,
        },
        gap,
      },
      scroll: {
        freeScroll,
        groupCells,
        loop,
        skipSnaps,
        centerActiveThumb,
      },
      motion: {
        selectDuration,
        freeScrollDuration,
        friction: sliderFriction,
      },
      elements: {
        thumbnail: {
          className: thumbnailItemClassName,
          style: thumbnailItemStyle,
        },
      },
      controls: {
        enabled: showArrows,
        arrow: {
          style: arrowStyles,
          className: arrowClassName,
        },
        prev: {
          style: prevArrowStyles,
          className: prevArrowClassName,
        },
        next: {
          style: nextArrowStyles,
          className: nextArrowClassName,
        },
        render: renderArrows,
        renderPrev: renderPrevArrow,
        renderNext: renderNextArrow,
        ripple: {
          enabled: rippleEnabled,
          className: rippleClassName,
        },
      },
      transitions: {
        loading: {
          enabled: false
        },
        intro: {
          staggerMs: 0,
          durationMs: 0,
          transform: '0px'
        }
      },
      breakpointMap,
    }),
    [
      position,
      thumbnailWidth,
      thumbnailHeight,
      thumbnailsCenter,
      resolvedContainerWidth,
      resolvedContainerHeight,
      gap,
      freeScroll,
      groupCells,
      loop,
      skipSnaps,
      centerActiveThumb,
      selectDuration,
      freeScrollDuration,
      sliderFriction,
      thumbnailItemClassName,
      thumbnailItemStyle,
      showArrows,
      arrowStyles,
      arrowClassName,
      prevArrowStyles,
      prevArrowClassName,
      nextArrowStyles,
      nextArrowClassName,
      renderArrows,
      renderPrevArrow,
      renderNextArrow,
      rippleEnabled,
      rippleClassName,
      breakpointMap,
    ]
  )

  if (!mountEl) return null

  return createPortal(
    <div style={wrapperStyle}>
      <ThumbnailSlider
        indexChannel={channelRef.current}
        direction={direction}
        options={thumbnailOptions}
        onReadyChange={(ready) => {
          thumbsReadyRef.current = ready
          if (!ready) return
          const isOpen = visible && !invisible
          if (!isOpen || didInitialSnapThisOpenRef.current) return
          snapToCurrentFsIndex('instant')
          didInitialSnapThisOpenRef.current = true
        }}
        onThumbnailClick={(idx) =>
          syncBridgeRef.current.publishThumbnailClick(idx, 'animated')
        }
      >
        {children}
      </ThumbnailSlider>
    </div>,
    mountEl
  )
}
