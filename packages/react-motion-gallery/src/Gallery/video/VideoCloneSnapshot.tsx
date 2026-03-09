'use client'

import * as React from 'react'

import { normalizeLazyLoad, resolveLazySpinnerNode } from '../shared/lazy/LazyItemHost'
import type { FullscreenLazyLoadConfig } from '../fullscreen/types'
import { detectProvider } from './plyr'
import type { PlyrOptions, PlyrSource } from './plyrTypes'
import type { RmgVideoLazyLoadOptions, VideoProps } from './index'
import styles from './index.module.css'
import type { VideoSnapshotStore } from './videoSnapshotStore'

type VideoCloneSnapshotProps = Pick<
  VideoProps,
  'src' | 'poster' | 'source' | 'sourceBuilder' | 'options' | 'className' | 'style'
> & {
  canonicalIndex: number
  store: VideoSnapshotStore
  lazyLoad?: RmgVideoLazyLoadOptions | FullscreenLazyLoadConfig
}

const baseWrap: React.CSSProperties = { width: '100%' }

function resolveOptions(
  options: VideoProps['options'],
  args: { src: string; index: number }
): PlyrOptions | undefined {
  const resolved = typeof options === 'function' ? options(args) : options
  if (!resolved) return resolved

  return {
    ...(resolved as any),
    autoplay: (resolved as any).autoplay ?? false,
    preload: (resolved as any).preload ?? 'none',
  } as any
}

function parsePlyrRatio(r: unknown): number | null {
  if (typeof r === 'number' && Number.isFinite(r) && r > 0) return r

  if (typeof r === 'string') {
    const s = r.trim()
    const mColon = s.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/)
    if (mColon) {
      const w = parseFloat(mColon[1])
      const h = parseFloat(mColon[2])
      if (w > 0 && h > 0) return w / h
    }

    const mSlash = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/)
    if (mSlash) {
      const w = parseFloat(mSlash[1])
      const h = parseFloat(mSlash[2])
      if (w > 0 && h > 0) return w / h
    }

    const asNum = Number(s)
    if (Number.isFinite(asNum) && asNum > 0) return asNum
  }

  if (typeof r === 'object' && r) {
    const w = (r as any).w ?? (r as any).width
    const h = (r as any).h ?? (r as any).height
    if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
      return w / h
    }
  }

  return null
}

export function VideoCloneSnapshot(props: VideoCloneSnapshotProps) {
  const subscribe = React.useCallback(
    (listener: () => void) => props.store.subscribe(props.canonicalIndex, listener),
    [props.canonicalIndex, props.store]
  )

  const getSnapshot = React.useCallback(
    () => props.store.getSnapshot(props.canonicalIndex),
    [props.canonicalIndex, props.store]
  )

  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const normalizedLazy = React.useMemo(() => normalizeLazyLoad(props.lazyLoad as any), [props.lazyLoad])

  const spinnerResolved = React.useMemo(() => {
    return resolveLazySpinnerNode({
      lazy: normalizedLazy,
      kind: 'video',
      isClone: true,
    })
  }, [normalizedLazy])

  const spinnerClassName = [
    spinnerResolved.isCustom ? styles.spinnerWrap : styles.spinner,
    normalizedLazy.spinnerClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const source = React.useMemo(() => {
    return (
      props.source ??
      props.sourceBuilder?.({ src: props.src }) ??
      ({
        type: 'video',
        poster: props.poster,
        sources: [{ src: props.src, type: 'video/mp4' }],
      } as PlyrSource)
    )
  }, [props.poster, props.source, props.sourceBuilder, props.src])

  const options = React.useMemo(() => {
    return resolveOptions(props.options, { src: props.src, index: props.canonicalIndex })
  }, [props.canonicalIndex, props.options, props.src])

  const provider = React.useMemo(
    () => snapshot?.provider ?? detectProvider(source),
    [snapshot?.provider, source]
  )

  const ratio = React.useMemo(() => parsePlyrRatio((options as any)?.ratio ?? null), [options])
  const hasSnapshot = Boolean(snapshot?.markupHtml)
  const shouldRenderSpinner = normalizedLazy.enabled && spinnerResolved.render && !hasSnapshot

  const spinnerNode = shouldRenderSpinner ? (
    spinnerResolved.isCustom ? (
      <div
        data-rmg-video-spinner
        className={spinnerClassName}
        style={normalizedLazy.spinnerStyle}
        aria-hidden="true"
      >
        {spinnerResolved.node}
      </div>
    ) : (
      <div
        data-rmg-video-spinner
        className={spinnerClassName}
        style={normalizedLazy.spinnerStyle}
        aria-hidden="true"
      />
    )
  ) : null

  return (
    <div
      className={['rmg__plyr__video', props.className].filter(Boolean).join(' ')}
      style={{
        ...baseWrap,
        ...(props.style || {}),
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        pointerEvents: 'none',
        ...(ratio ? { aspectRatio: String(ratio) } : {}),
      }}
      data-rmg-plyr="true"
      data-rmg-plyr-index={String(props.canonicalIndex)}
      data-rmg-plyr-provider={provider}
      data-rmg-video-snapshot="true"
      data-rmg-wh={ratio != null ? String(ratio) : undefined}
      aria-hidden="true"
    >
      {spinnerNode}

      {!hasSnapshot && props.poster ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000',
            backgroundImage: `url("${props.poster}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.92,
          }}
        />
      ) : null}

      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          pointerEvents: 'none',
          visibility: hasSnapshot ? 'visible' : 'hidden',
        }}
        dangerouslySetInnerHTML={hasSnapshot ? { __html: snapshot?.markupHtml ?? '' } : undefined}
      />
    </div>
  )
}
