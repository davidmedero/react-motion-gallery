'use client'

import type { APITypes } from 'plyr-react'

import { objectFitContentRect } from '../shared/transitions/objectFitTransform'
import { parseObjectPosition } from '../shared/transitions/objectPosition'

type PlyrProvider = 'youtube' | 'vimeo' | 'mp4' | 'other'
type PlyrPlayer = APITypes['plyr']
type SnapshotListener = () => void
const LIVE_FRAME_FILTER = 'brightness(1.06)'

export type VideoRuntimeRegistration = {
  canonicalIndex: number
  api: APITypes | null
  hostEl: HTMLElement | null
  provider: PlyrProvider
  src: string
  poster?: string
  ratio?: number | null
}

export type VideoSnapshot = {
  canonicalIndex: number
  provider: PlyrProvider
  markupHtml: string
  frameSrc: string | null
  version: number
  hasLiveFrame: boolean
  updatedAt: number
}

export type VideoSnapshotStore = {
  registerOriginal: (runtime: VideoRuntimeRegistration) => void
  unregisterOriginal: (canonicalIndex: number) => void
  getSnapshot: (canonicalIndex: number) => VideoSnapshot | null
  subscribe: (canonicalIndex: number, listener: SnapshotListener) => () => void
  reset: () => void
  destroy: () => void
}

type RuntimeEntry = {
  runtime: VideoRuntimeRegistration
  cleanup: () => void
  rafId: number | null
  buildSeq: number
  objectUrl: string | null
  staleObjectUrl: string | null
}

type CapturedFrame = {
  frameSrc: string | null
  hasLiveFrame: boolean
  objectUrl: string | null
}

type CaptureFrameOptions = {
  requirePaintConfirmation?: boolean
}

function toPlayer(api: APITypes | null): PlyrPlayer | null {
  return api?.plyr ?? null
}

function extractCssUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const match = /url\(["']?(.*?)["']?\)/.exec(value)
  return match?.[1] ?? null
}

function resolvePosterSrc(runtime: VideoRuntimeRegistration): string | null {
  if (runtime.poster) return runtime.poster

  const hostEl = runtime.hostEl
  if (!hostEl) return null

  const videoEl = hostEl.querySelector('video') as HTMLVideoElement | null
  if (videoEl?.poster) return videoEl.poster

  const posterEl = hostEl.querySelector('.plyr__poster') as HTMLElement | null
  if (!posterEl) return null

  const inlineUrl = extractCssUrl(posterEl.style.backgroundImage)
  if (inlineUrl) return inlineUrl

  try {
    return extractCssUrl(getComputedStyle(posterEl).backgroundImage)
  } catch {
    return null
  }
}

function revokeObjectUrl(url: string | null) {
  if (!url) return
  try {
    URL.revokeObjectURL(url)
  } catch {}
}

async function decodeFrameSrc(src: string): Promise<boolean> {
  try {
    const img = new Image()
    img.decoding = 'sync'
    img.src = src

    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      return true
    }

    if (typeof img.decode === 'function') {
      try {
        await img.decode()
        return img.naturalWidth > 0 && img.naturalHeight > 0
      } catch {}
    }

    return await new Promise<boolean>((resolve) => {
      const cleanup = () => {
        img.onload = null
        img.onerror = null
      }

      img.onload = () => {
        cleanup()
        resolve(img.naturalWidth > 0 && img.naturalHeight > 0)
      }

      img.onerror = () => {
        cleanup()
        resolve(false)
      }
    })
  } catch {
    return false
  }
}

async function waitForPresentedVideoFrame(videoEl: HTMLVideoElement, timeoutMs = 180): Promise<boolean> {
  try {
    const requestFrame = (
      videoEl as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number
        cancelVideoFrameCallback?: (handle: number) => void
      }
    ).requestVideoFrameCallback

    if (typeof requestFrame !== 'function') {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve())
        })
      })
      return true
    }

    return await new Promise<boolean>((resolve) => {
      let settled = false
      let handle: number | null = null

      const finish = (value: boolean) => {
        if (settled) return
        settled = true

        if (handle != null) {
          try {
            ;(
              videoEl as HTMLVideoElement & {
                cancelVideoFrameCallback?: (id: number) => void
              }
            ).cancelVideoFrameCallback?.(handle)
          } catch {}
        }

        window.clearTimeout(timeoutId)
        resolve(value)
      }

      const timeoutId = window.setTimeout(() => finish(false), timeoutMs)

      try {
        handle = requestFrame.call(videoEl, () => finish(true))
      } catch {
        finish(false)
      }
    })
  } catch {
    return false
  }
}

function syncOptionalAttribute(source: Element, target: Element, name: string) {
  const value = source.getAttribute(name)
  if (value == null) {
    target.removeAttribute(name)
    return
  }

  target.setAttribute(name, value)
}

function syncRangeState(originalInput: HTMLInputElement, cloneInput: HTMLInputElement) {
  const value = `${originalInput.value ?? ''}`
  cloneInput.value = value
  cloneInput.defaultValue = value
  cloneInput.setAttribute('value', value)

  for (const [name, currentValue] of [
    ['min', originalInput.min],
    ['max', originalInput.max],
    ['step', originalInput.step],
  ] as const) {
    if (currentValue) {
      cloneInput.setAttribute(name, currentValue)
    } else {
      cloneInput.removeAttribute(name)
    }
  }

  for (const name of [
    'aria-valuenow',
    'aria-valuetext',
    'aria-valuemin',
    'aria-valuemax',
    'seek-value',
  ]) {
    syncOptionalAttribute(originalInput, cloneInput, name)
  }

  const cssValue = originalInput.style.getPropertyValue('--value')
  if (cssValue) {
    cloneInput.style.setProperty('--value', cssValue)
  } else {
    cloneInput.style.removeProperty('--value')
  }
}

function syncProgressState(originalProgress: HTMLProgressElement, cloneProgress: HTMLProgressElement) {
  const value = Number(originalProgress.value)
  if (Number.isFinite(value)) {
    cloneProgress.value = value
    cloneProgress.setAttribute('value', String(value))
  } else {
    cloneProgress.removeAttribute('value')
  }

  const max = Number(originalProgress.max)
  if (Number.isFinite(max)) {
    cloneProgress.max = max
    cloneProgress.setAttribute('max', String(max))
  } else {
    cloneProgress.removeAttribute('max')
  }
}

function syncCloneControlState(originalRoot: HTMLElement, cloneRoot: HTMLElement) {
  const originalRanges = Array.from(originalRoot.querySelectorAll<HTMLInputElement>('input[type="range"]'))
  const cloneRanges = Array.from(cloneRoot.querySelectorAll<HTMLInputElement>('input[type="range"]'))
  const rangeCount = Math.min(originalRanges.length, cloneRanges.length)

  for (let i = 0; i < rangeCount; i += 1) {
    syncRangeState(originalRanges[i], cloneRanges[i])
  }

  const originalProgressEls = Array.from(originalRoot.querySelectorAll<HTMLProgressElement>('progress'))
  const cloneProgressEls = Array.from(cloneRoot.querySelectorAll<HTMLProgressElement>('progress'))
  const progressCount = Math.min(originalProgressEls.length, cloneProgressEls.length)

  for (let i = 0; i < progressCount; i += 1) {
    syncProgressState(originalProgressEls[i], cloneProgressEls[i])
  }
}

function isFocusableTag(tagName: string) {
  return (
    tagName === 'a' ||
    tagName === 'button' ||
    tagName === 'input' ||
    tagName === 'select' ||
    tagName === 'textarea' ||
    tagName === 'summary'
  )
}

function sanitizeCloneTree(root: HTMLElement) {
  root.querySelectorAll('.rmg-plyr-gesture-shield').forEach((el) => el.remove())
  root.querySelectorAll('video, iframe, source, track').forEach((el) => el.remove())

  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
  for (const el of all) {
    el.removeAttribute('id')
    el.removeAttribute('for')
    el.removeAttribute('aria-controls')
    el.removeAttribute('aria-describedby')
    el.removeAttribute('aria-labelledby')
    el.removeAttribute('aria-owns')
    el.removeAttribute('aria-activedescendant')
    el.removeAttribute('autofocus')

    const tagName = el.tagName.toLowerCase()
    if (el.hasAttribute('tabindex') || isFocusableTag(tagName)) {
      el.setAttribute('tabindex', '-1')
    }
  }
}

function resolveVideoPresentation(hostEl: HTMLElement | null) {
  const videoEl = hostEl?.querySelector('video') as HTMLVideoElement | null
  if (!videoEl) {
    return {
      objectFit: 'cover',
      objectPosition: '50% 50%',
    }
  }

  try {
    const cs = getComputedStyle(videoEl)
    return {
      objectFit: cs?.objectFit === 'contain' ? 'contain' : 'cover',
      objectPosition: cs?.objectPosition || '50% 50%',
    }
  } catch {
    return {
      objectFit: 'cover',
      objectPosition: '50% 50%',
    }
  }
}

function resolveAspectRatio(runtime: VideoRuntimeRegistration): number | null {
  const explicit = Number(runtime.ratio)
  if (Number.isFinite(explicit) && explicit > 0) return explicit

  const videoEl = runtime.hostEl?.querySelector('video') as HTMLVideoElement | null
  const natW = Number(videoEl?.videoWidth ?? 0)
  const natH = Number(videoEl?.videoHeight ?? 0)
  if (natW > 0 && natH > 0) return natW / natH

  const hostWhAttr = runtime.hostEl?.getAttribute('data-rmg-wh')
  const hostWh = Number(hostWhAttr)
  if (Number.isFinite(hostWh) && hostWh > 0) return hostWh

  const rect = runtime.hostEl?.getBoundingClientRect?.()
  const rectW = Number(rect?.width ?? 0)
  const rectH = Number(rect?.height ?? 0)
  if (rectW > 0 && rectH > 0) return rectW / rectH

  const wrapperRect =
    (runtime.hostEl?.querySelector('.plyr__video-wrapper') as HTMLElement | null)?.getBoundingClientRect?.() ??
    null
  const wrapperW = Number(wrapperRect?.width ?? 0)
  const wrapperH = Number(wrapperRect?.height ?? 0)
  if (wrapperW > 0 && wrapperH > 0) return wrapperW / wrapperH

  return null
}

function injectFrameIntoClone(
  root: HTMLElement,
  runtime: VideoRuntimeRegistration,
  frameSrc: string | null,
  hasLiveFrame: boolean
) {
  const wrapper = root.querySelector('.plyr__video-wrapper') as HTMLElement | null
  if (!wrapper || !frameSrc) return

  wrapper.querySelectorAll('[data-rmg-video-snapshot-frame="true"]').forEach((el) => el.remove())

  if (!wrapper.style.position) {
    wrapper.style.position = 'relative'
  }
  wrapper.style.width = '100%'

  const aspectRatio = resolveAspectRatio(runtime)
  if (aspectRatio != null) {
    wrapper.style.aspectRatio = String(aspectRatio)
  }

  const { objectFit, objectPosition } = resolveVideoPresentation(runtime.hostEl)

  const frameEl = document.createElement('div')
  frameEl.setAttribute('data-rmg-video-snapshot-frame', 'true')
  frameEl.setAttribute('aria-hidden', 'true')
  frameEl.style.cssText = [
    'position:absolute',
    'inset:0',
    'overflow:hidden',
    'pointer-events:none',
    'background:#000',
  ].join(';')

  const img = document.createElement('img')
  img.alt = ''
  img.decoding = 'async'
  img.draggable = false
  img.src = frameSrc
  img.setAttribute('aria-hidden', 'true')
  img.style.cssText = [
    'display:block',
    'width:100%',
    'height:100%',
    `object-fit:${objectFit}`,
    `object-position:${objectPosition}`,
    ...(hasLiveFrame ? [`filter:${LIVE_FRAME_FILTER}`] : []),
    'pointer-events:none',
    'user-select:none',
  ].join(';')

  frameEl.appendChild(img)
  wrapper.insertBefore(frameEl, wrapper.firstChild)
}

async function captureFrame(
  runtime: VideoRuntimeRegistration,
  options: CaptureFrameOptions = {}
): Promise<CapturedFrame> {
  const fallbackFrameSrc = resolvePosterSrc(runtime)

  if (runtime.provider !== 'mp4') {
    return {
      frameSrc: fallbackFrameSrc,
      hasLiveFrame: false,
      objectUrl: null,
    }
  }

  const hostEl = runtime.hostEl
  const videoEl = hostEl?.querySelector('video') as HTMLVideoElement | null
  if (!videoEl) {
    return {
      frameSrc: fallbackFrameSrc,
      hasLiveFrame: false,
      objectUrl: null,
    }
  }

  try {
    const readyState = Number(videoEl.readyState ?? 0)
    const natW = Number(videoEl.videoWidth ?? 0)
    const natH = Number(videoEl.videoHeight ?? 0)
    if (readyState < 2 || natW <= 0 || natH <= 0) {
      return {
        frameSrc: fallbackFrameSrc,
        hasLiveFrame: false,
        objectUrl: null,
      }
    }

    const frameRect =
      (hostEl?.querySelector('.plyr__video-wrapper') as HTMLElement | null)?.getBoundingClientRect?.() ??
      videoEl.getBoundingClientRect()

    const widthCss = Number(frameRect?.width ?? 0)
    const heightCss = Number(frameRect?.height ?? 0)
    if (!(widthCss > 0) || !(heightCss > 0)) {
      return {
        frameSrc: fallbackFrameSrc,
        hasLiveFrame: false,
        objectUrl: null,
      }
    }

    const painted = await waitForPresentedVideoFrame(videoEl)
    if (!painted && options.requirePaintConfirmation && fallbackFrameSrc) {
      return {
        frameSrc: fallbackFrameSrc,
        hasLiveFrame: false,
        objectUrl: null,
      }
    }

    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
    const width = Math.max(1, Math.round(widthCss * dpr))
    const height = Math.max(1, Math.round(heightCss * dpr))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return {
        frameSrc: fallbackFrameSrc,
        hasLiveFrame: false,
        objectUrl: null,
      }
    }

    const cs = getComputedStyle(videoEl)
    const fit = cs?.objectFit === 'contain' ? 'contain' : 'cover'
    const objPos = parseObjectPosition(cs?.objectPosition ?? null) ?? { x: 0.5, y: 0.5 }
    const drawRect = objectFitContentRect(natW, natH, new DOMRect(0, 0, width, height), fit, objPos)

    ctx.drawImage(videoEl, drawRect.left, drawRect.top, drawRect.width, drawRect.height)

    const blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob(resolve, 'image/png')
      } catch {
        resolve(null)
      }
    })

    if (!blob) {
      return {
        frameSrc: fallbackFrameSrc,
        hasLiveFrame: false,
        objectUrl: null,
      }
    }

    const objectUrl = URL.createObjectURL(blob)

    const decoded = await decodeFrameSrc(objectUrl)
    if (!decoded) {
      revokeObjectUrl(objectUrl)
      return {
        frameSrc: fallbackFrameSrc,
        hasLiveFrame: false,
        objectUrl: null,
      }
    }

    return {
      frameSrc: objectUrl,
      hasLiveFrame: true,
      objectUrl,
    }
  } catch {
    return {
      frameSrc: fallbackFrameSrc,
      hasLiveFrame: false,
      objectUrl: null,
    }
  }
}

export function createVideoSnapshotStore(): VideoSnapshotStore {
  const runtimeByCanonical = new Map<number, RuntimeEntry>()
  const snapshotByCanonical = new Map<number, VideoSnapshot>()
  const listenersByCanonical = new Map<number, Set<SnapshotListener>>()

  function notify(canonicalIndex: number) {
    const listeners = listenersByCanonical.get(canonicalIndex)
    if (!listeners?.size) return
    for (const listener of listeners) {
      listener()
    }
  }

  function commitSnapshot(
    entry: RuntimeEntry,
    snapshot: VideoSnapshot,
    objectUrl: string | null
  ) {
    const prevStaleObjectUrl = entry.staleObjectUrl
    const prevObjectUrl = entry.objectUrl
    entry.staleObjectUrl = prevObjectUrl && prevObjectUrl !== objectUrl ? prevObjectUrl : null
    entry.objectUrl = objectUrl
    snapshotByCanonical.set(snapshot.canonicalIndex, snapshot)

    if (
      prevStaleObjectUrl &&
      prevStaleObjectUrl !== objectUrl &&
      prevStaleObjectUrl !== entry.staleObjectUrl
    ) {
      revokeObjectUrl(prevStaleObjectUrl)
    }

    notify(snapshot.canonicalIndex)
  }

  async function buildSnapshot(canonicalIndex: number, buildSeq: number) {
    const entry = runtimeByCanonical.get(canonicalIndex)
    if (!entry || entry.buildSeq !== buildSeq) return

    const prevSnapshot = snapshotByCanonical.get(canonicalIndex)
    const frame = await captureFrame(entry.runtime, {
      requirePaintConfirmation: prevSnapshot == null,
    })

    const current = runtimeByCanonical.get(canonicalIndex)
    if (!current || current !== entry || current.buildSeq !== buildSeq) {
      revokeObjectUrl(frame.objectUrl)
      return
    }

    const plyrRoot = current.runtime.hostEl?.querySelector('.plyr') as HTMLElement | null
    if (!plyrRoot) {
      revokeObjectUrl(frame.objectUrl)
      return
    }

    const cloneRoot = plyrRoot.cloneNode(true) as HTMLElement
    syncCloneControlState(plyrRoot, cloneRoot)
    sanitizeCloneTree(cloneRoot)
    injectFrameIntoClone(cloneRoot, current.runtime, frame.frameSrc, frame.hasLiveFrame)

    commitSnapshot(
      current,
      {
        canonicalIndex,
        provider: current.runtime.provider,
        markupHtml: cloneRoot.outerHTML,
        frameSrc: frame.frameSrc,
        version: (prevSnapshot?.version ?? 0) + 1,
        hasLiveFrame: frame.hasLiveFrame,
        updatedAt: Date.now(),
      },
      frame.objectUrl
    )

    if (
      prevSnapshot == null &&
      !frame.hasLiveFrame &&
      current.runtime.provider === 'mp4'
    ) {
      window.requestAnimationFrame(() => scheduleRefresh(canonicalIndex))
    }
  }

  function scheduleRefresh(canonicalIndex: number) {
    const entry = runtimeByCanonical.get(canonicalIndex)
    if (!entry || entry.rafId != null) return

    entry.rafId = window.requestAnimationFrame(() => {
      const current = runtimeByCanonical.get(canonicalIndex)
      if (!current || current !== entry) return

      current.rafId = null
      current.buildSeq += 1
      void buildSnapshot(canonicalIndex, current.buildSeq)
    })
  }

  function attachListeners(runtime: VideoRuntimeRegistration) {
    const player = toPlayer(runtime.api)
    if (!player) return () => {}

    const schedule = () => scheduleRefresh(runtime.canonicalIndex)
    const seekInput = (player as any)?.elements?.inputs?.seek as EventTarget | null
    const media = (player as any)?.media as HTMLMediaElement | undefined

    try {
      player.on?.('ready', schedule)
      player.on?.('play', schedule)
      player.on?.('pause', schedule)
      player.on?.('ended', schedule)
      player.on?.('volumechange', schedule)
      player.on?.('seeked', schedule)
    } catch {}

    try {
      seekInput?.addEventListener?.('input', schedule)
      seekInput?.addEventListener?.('change', schedule)
    } catch {}

    try {
      media?.addEventListener?.('loadedmetadata', schedule)
      media?.addEventListener?.('loadeddata', schedule)
      media?.addEventListener?.('canplay', schedule)
      media?.addEventListener?.('seeked', schedule)
      media?.addEventListener?.('ended', schedule)
    } catch {}

    return () => {
      try {
        player.off?.('ready', schedule)
        player.off?.('play', schedule)
        player.off?.('pause', schedule)
        player.off?.('ended', schedule)
        player.off?.('volumechange', schedule)
        player.off?.('seeked', schedule)
      } catch {}

      try {
        seekInput?.removeEventListener?.('input', schedule)
        seekInput?.removeEventListener?.('change', schedule)
      } catch {}

      try {
        media?.removeEventListener?.('loadedmetadata', schedule)
        media?.removeEventListener?.('loadeddata', schedule)
        media?.removeEventListener?.('canplay', schedule)
        media?.removeEventListener?.('seeked', schedule)
        media?.removeEventListener?.('ended', schedule)
      } catch {}
    }
  }

  function unregisterOriginal(canonicalIndex: number) {
    const entry = runtimeByCanonical.get(canonicalIndex)
    if (!entry) return

    if (entry.rafId != null) {
      window.cancelAnimationFrame(entry.rafId)
    }

    entry.cleanup()
    revokeObjectUrl(entry.objectUrl)
    revokeObjectUrl(entry.staleObjectUrl)

    runtimeByCanonical.delete(canonicalIndex)
    snapshotByCanonical.delete(canonicalIndex)
    notify(canonicalIndex)
  }

  function registerOriginal(runtime: VideoRuntimeRegistration) {
    const canonicalIndex = Number(runtime.canonicalIndex)
    if (!Number.isFinite(canonicalIndex)) return

    if (!runtime.api || !runtime.hostEl) {
      unregisterOriginal(canonicalIndex)
      return
    }

    unregisterOriginal(canonicalIndex)

    runtimeByCanonical.set(canonicalIndex, {
      runtime: {
        ...runtime,
        canonicalIndex,
      },
      cleanup: attachListeners(runtime),
      rafId: null,
      buildSeq: 0,
      objectUrl: null,
      staleObjectUrl: null,
    })

    scheduleRefresh(canonicalIndex)
  }

  function getSnapshot(canonicalIndex: number) {
    return snapshotByCanonical.get(canonicalIndex) ?? null
  }

  function subscribe(canonicalIndex: number, listener: SnapshotListener) {
    let listeners = listenersByCanonical.get(canonicalIndex)
    if (!listeners) {
      listeners = new Set()
      listenersByCanonical.set(canonicalIndex, listeners)
    }

    listeners.add(listener)

    return () => {
      const current = listenersByCanonical.get(canonicalIndex)
      current?.delete(listener)
      if (current && current.size === 0) {
        listenersByCanonical.delete(canonicalIndex)
      }
    }
  }

  function reset() {
    for (const canonicalIndex of Array.from(runtimeByCanonical.keys())) {
      unregisterOriginal(canonicalIndex)
    }
  }

  function destroy() {
    reset()
    listenersByCanonical.clear()
  }

  return {
    registerOriginal,
    unregisterOriginal,
    getSnapshot,
    subscribe,
    reset,
    destroy,
  }
}
