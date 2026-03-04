import type { APITypes } from 'plyr-react'

const TIME_EPSILON_SEC = 0.2
const LIVE_SEEK_EPSILON_SEC = 0.03

type PlyrApi = APITypes | null
type PlyrPlayer = APITypes['plyr']

export type CanonicalPlaybackRegistration = {
  renderedIndex: number
  canonicalIndex: number
  isClone: boolean
  api: PlyrApi
}

export type CanonicalPlaybackSyncManager = {
  register: (args: CanonicalPlaybackRegistration) => void
  unregister: (renderedIndex: number) => void
  destroy: () => void
}

type RenderedMeta = {
  canonicalIndex: number
  isClone: boolean
}

type OriginalListeners = {
  player: PlyrPlayer
  onPlay: () => void
  onPause: () => void
  onSeeked: () => void
  onVolumeChange: () => void
  seekInputEl?: EventTarget | null
  onSeekInput: EventListener
}

type CloneListeners = {
  player: PlyrPlayer
  onVolumeChange: () => void
}

type SyncCloneFromOriginalOptions = {
  sourceTime?: number | null
  seekEpsilonSec?: number
}

function toPlayer(api: PlyrApi): PlyrPlayer | null {
  return api?.plyr ?? null
}

function toTime(player: PlyrPlayer | null): number | null {
  if (!player) return null
  const t = Number(player.currentTime)
  return Number.isFinite(t) ? t : null
}

function toDuration(player: PlyrPlayer | null): number | null {
  if (!player) return null
  const d = Number((player as any).duration)
  if (!Number.isFinite(d) || d <= 0) return null
  return d
}

function clamp01(n: number) {
  if (n <= 0) return 0
  if (n >= 1) return 1
  return n
}

function clampRange(n: number, min: number, max: number) {
  if (n <= min) return min
  if (n >= max) return max
  return n
}

function formatClockTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad2 = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`
  return `${m}:${pad2(s)}`
}

function getSeekInputTargetTime(
  player: PlyrPlayer | null,
  seekInputEl: EventTarget | null
): number | null {
  const input = seekInputEl as (HTMLInputElement & { valueAsNumber?: number }) | null
  if (!input) return null

  const duration = toDuration(player)
  if (duration == null) return null

  const minRaw = Number((input as any).min)
  const maxRaw = Number((input as any).max)
  const valueRaw =
    typeof (input as any).valueAsNumber === 'number' &&
    Number.isFinite((input as any).valueAsNumber)
      ? Number((input as any).valueAsNumber)
      : Number((input as any).value)

  if (!Number.isFinite(valueRaw)) return null

  const min = Number.isFinite(minRaw) ? minRaw : 0
  let max = Number.isFinite(maxRaw) ? maxRaw : 100
  if (max <= min) max = min + 100

  const ratio = clamp01((valueRaw - min) / (max - min))
  const targetTime = duration * ratio
  if (!Number.isFinite(targetTime)) return null

  return Math.max(0, Math.min(duration, targetTime))
}

function isPlaying(player: PlyrPlayer | null) {
  if (!player) return false
  if (typeof player.playing === 'boolean') return player.playing
  return !player.paused
}

function pauseSafe(player: PlyrPlayer | null) {
  if (!player) return
  try {
    player.pause()
  } catch {}
}

function playSafe(player: PlyrPlayer | null) {
  if (!player) return
  try {
    const result = player.play()
    if (result && typeof (result as Promise<void>).catch === 'function') {
      ;(result as Promise<void>).catch(() => {})
    }
  } catch {}
}

function forceMute(player: PlyrPlayer | null) {
  if (!player) return

  try {
    (player as any).muted = true
  } catch {}

  try {
    (player as any).volume = 0
  } catch {}

  const media = (player as any)?.media as HTMLMediaElement | undefined
  if (!media) return

  try {
    media.defaultMuted = true
  } catch {}

  try {
    media.muted = true
  } catch {}

  try {
    media.volume = 0
  } catch {}
}

export function createCanonicalPlaybackSyncManager(): CanonicalPlaybackSyncManager {
  const playersByRendered = new Map<number, PlyrPlayer>()
  const metaByRendered = new Map<number, RenderedMeta>()

  const originalByCanonical = new Map<number, number>()
  const cloneByCanonical = new Map<number, number>()
  const lastOriginalTimeByCanonical = new Map<number, number>()

  const listenersByOriginalRendered = new Map<number, OriginalListeners>()
  const cloneListenersByRendered = new Map<number, CloneListeners>()

  function setTimeIfNeeded(
    player: PlyrPlayer,
    time: number,
    epsilonSec: number = TIME_EPSILON_SEC
  ) {
    const current = toTime(player)
    if (current != null && Math.abs(current - time) <= epsilonSec) return

    try {
      player.currentTime = time
    } catch {}
  }

  function recordOriginalTime(canonicalIndex: number, player: PlyrPlayer | null) {
    const time = toTime(player)
    if (time == null) return
    lastOriginalTimeByCanonical.set(canonicalIndex, time)
  }

  function findRenderedForCanonical(canonicalIndex: number, isClone: boolean) {
    for (const [renderedIndex, meta] of metaByRendered) {
      if (meta.canonicalIndex !== canonicalIndex) continue
      if (meta.isClone !== isClone) continue
      return renderedIndex
    }
    return null
  }

  function refreshCanonicalPointers(canonicalIndex: number) {
    const originalRendered = findRenderedForCanonical(canonicalIndex, false)
    if (originalRendered == null) {
      originalByCanonical.delete(canonicalIndex)
    } else {
      originalByCanonical.set(canonicalIndex, originalRendered)
    }

    const cloneRendered = findRenderedForCanonical(canonicalIndex, true)
    if (cloneRendered == null) {
      cloneByCanonical.delete(canonicalIndex)
    } else {
      cloneByCanonical.set(canonicalIndex, cloneRendered)
    }
  }

  function getOriginalPlayer(canonicalIndex: number) {
    const rendered = originalByCanonical.get(canonicalIndex)
    if (rendered == null) return null
    return playersByRendered.get(rendered) ?? null
  }

  function getClonePlayer(canonicalIndex: number) {
    const rendered = cloneByCanonical.get(canonicalIndex)
    if (rendered == null) return null
    return playersByRendered.get(rendered) ?? null
  }

  function getOriginalVolumeState(canonicalIndex: number) {
    const originalPlayer = getOriginalPlayer(canonicalIndex)
    if (!originalPlayer) return null

    const rawVolume = Number((originalPlayer as any).volume)
    const volume = Number.isFinite(rawVolume) ? clamp01(rawVolume) : 1
    const muted = Boolean((originalPlayer as any).muted)

    return { volume, muted }
  }

  function applyOptimisticCloneVolumeUi(canonicalIndex: number) {
    const clonePlayer = getClonePlayer(canonicalIndex)
    if (!clonePlayer) return

    const originalVolumeState = getOriginalVolumeState(canonicalIndex)
    if (!originalVolumeState) return

    const { volume, muted } = originalVolumeState

    const volumeInput = (clonePlayer as any)?.elements?.inputs?.volume as HTMLInputElement | null
    if (volumeInput) {
      const minRaw = Number((volumeInput as any).min)
      const maxRaw = Number((volumeInput as any).max)
      const min = Number.isFinite(minRaw) ? minRaw : 0
      let max = Number.isFinite(maxRaw) ? maxRaw : 100
      if (max <= min) max = min + 100

      const ratio = clamp01(volume)
      const value = clampRange(min + ratio * (max - min), min, max)
      const percent = ratio * 100

      volumeInput.value = String(value)
      volumeInput.style?.setProperty?.('--value', `${percent}%`)
      volumeInput.setAttribute('aria-valuenow', String(value))
    }

    const muteButton = (clonePlayer as any)?.elements?.buttons?.mute as HTMLElement | null
    if (muteButton) {
      muteButton.setAttribute('aria-pressed', muted ? 'true' : 'false')
      muteButton.classList?.toggle?.('plyr__control--pressed', muted)
    }
  }

  function applyOptimisticCloneUi(canonicalIndex: number, targetTime: number) {
    if (!Number.isFinite(targetTime)) return

    const originalPlayer = getOriginalPlayer(canonicalIndex)
    const clonePlayer = getClonePlayer(canonicalIndex)
    if (!clonePlayer) return

    const duration = toDuration(clonePlayer) ?? toDuration(originalPlayer)
    if (duration == null) return

    const clampedTime = Math.max(0, Math.min(duration, targetTime))
    const percent = clamp01(clampedTime / duration) * 100

    const seekInput = (clonePlayer as any)?.elements?.inputs?.seek as HTMLInputElement | null
    if (seekInput) {
      seekInput.value = String(percent)
      seekInput.style?.setProperty?.('--value', `${percent}%`)
      seekInput.setAttribute('aria-valuenow', String(clampedTime))
      seekInput.setAttribute(
        'aria-valuetext',
        `${formatClockTime(clampedTime)} of ${formatClockTime(duration)}`
      )
    }

    const currentTimeDisplay = (clonePlayer as any)?.elements?.display?.currentTime as HTMLElement | null
    if (currentTimeDisplay) {
      currentTimeDisplay.textContent = formatClockTime(clampedTime)
    }
  }

  function syncCloneFromOriginal(
    canonicalIndex: number,
    applyPlaybackState: boolean,
    options: SyncCloneFromOriginalOptions = {}
  ) {
    const { sourceTime, seekEpsilonSec = TIME_EPSILON_SEC } = options
    const originalPlayer = getOriginalPlayer(canonicalIndex)
    const clonePlayer = getClonePlayer(canonicalIndex)
    if (!originalPlayer || !clonePlayer) return

    const explicitSourceTime =
      sourceTime != null && Number.isFinite(Number(sourceTime))
        ? Number(sourceTime)
        : null

    const resolvedSourceTime =
      explicitSourceTime ??
      toTime(originalPlayer) ??
      lastOriginalTimeByCanonical.get(canonicalIndex) ??
      null

    if (resolvedSourceTime != null) {
      lastOriginalTimeByCanonical.set(canonicalIndex, resolvedSourceTime)
      setTimeIfNeeded(clonePlayer, resolvedSourceTime, seekEpsilonSec)
    }

    forceMute(clonePlayer)
    applyOptimisticCloneVolumeUi(canonicalIndex)

    if (!applyPlaybackState) return

    if (isPlaying(originalPlayer)) {
      playSafe(clonePlayer)
    } else {
      pauseSafe(clonePlayer)
    }
  }

  function pauseUnrelatedCanonicalPlayers(canonicalIndex: number) {
    for (const [renderedIndex, player] of playersByRendered) {
      const meta = metaByRendered.get(renderedIndex)
      if (!meta) continue
      if (meta.canonicalIndex === canonicalIndex) continue
      if (!isPlaying(player)) continue
      pauseSafe(player)
    }
  }

  function detachOriginalListeners(renderedIndex: number) {
    const bag = listenersByOriginalRendered.get(renderedIndex)
    if (!bag) return

    try {
      bag.player.off?.('play', bag.onPlay)
      bag.player.off?.('pause', bag.onPause)
      bag.player.off?.('seeked', bag.onSeeked)
      bag.player.off?.('volumechange', bag.onVolumeChange)
    } catch {}

    try {
      bag.seekInputEl?.removeEventListener?.('input', bag.onSeekInput)
      bag.seekInputEl?.removeEventListener?.('change', bag.onSeekInput)
    } catch {}

    listenersByOriginalRendered.delete(renderedIndex)
  }

  function detachCloneListeners(renderedIndex: number) {
    const bag = cloneListenersByRendered.get(renderedIndex)
    if (!bag) return

    try {
      bag.player.off?.('volumechange', bag.onVolumeChange)
    } catch {}

    cloneListenersByRendered.delete(renderedIndex)
  }

  function unregister(renderedIndex: number) {
    detachOriginalListeners(renderedIndex)
    detachCloneListeners(renderedIndex)

    const meta = metaByRendered.get(renderedIndex)

    playersByRendered.delete(renderedIndex)
    metaByRendered.delete(renderedIndex)

    if (!meta) return

    const canonicalIndex = meta.canonicalIndex
    const removedOriginal = !meta.isClone && originalByCanonical.get(canonicalIndex) === renderedIndex

    refreshCanonicalPointers(canonicalIndex)

    if (removedOriginal) {
      pauseSafe(getClonePlayer(canonicalIndex))
    }

    if (!originalByCanonical.has(canonicalIndex) && !cloneByCanonical.has(canonicalIndex)) {
      lastOriginalTimeByCanonical.delete(canonicalIndex)
    }
  }

  function register(args: CanonicalPlaybackRegistration) {
    const { renderedIndex, canonicalIndex, isClone, api } = args

    if (!Number.isFinite(renderedIndex) || !Number.isFinite(canonicalIndex)) return

    const player = toPlayer(api)
    if (!player) {
      unregister(renderedIndex)
      return
    }

    unregister(renderedIndex)

    playersByRendered.set(renderedIndex, player)
    metaByRendered.set(renderedIndex, { canonicalIndex, isClone })
    refreshCanonicalPointers(canonicalIndex)

    if (isClone) {
      forceMute(player)

      const onVolumeChange = () => {
        forceMute(player)
        applyOptimisticCloneVolumeUi(canonicalIndex)
      }

      try {
        player.on?.('volumechange', onVolumeChange)
      } catch {}

      cloneListenersByRendered.set(renderedIndex, {
        player,
        onVolumeChange,
      })

      syncCloneFromOriginal(canonicalIndex, true)
      applyOptimisticCloneVolumeUi(canonicalIndex)
      return
    }

    const onPlay = () => {
      recordOriginalTime(canonicalIndex, player)
      pauseUnrelatedCanonicalPlayers(canonicalIndex)
      syncCloneFromOriginal(canonicalIndex, true)
    }

    const onPause = () => {
      recordOriginalTime(canonicalIndex, player)
      syncCloneFromOriginal(canonicalIndex, true)
    }

    const onSeeked = () => {
      recordOriginalTime(canonicalIndex, player)
      syncCloneFromOriginal(canonicalIndex, false)
    }
    const onVolumeChange = () => {
      applyOptimisticCloneVolumeUi(canonicalIndex)
    }

    let seekInputEl: EventTarget | null = null
    const onSeekInput: EventListener = () => {
      const targetTime = getSeekInputTargetTime(player, seekInputEl)
      if (targetTime == null) return

      lastOriginalTimeByCanonical.set(canonicalIndex, targetTime)
      syncCloneFromOriginal(canonicalIndex, false, {
        sourceTime: targetTime,
        seekEpsilonSec: LIVE_SEEK_EPSILON_SEC,
      })
      applyOptimisticCloneUi(canonicalIndex, targetTime)
    }

    try {
      player.on?.('play', onPlay)
      player.on?.('pause', onPause)
      player.on?.('seeked', onSeeked)
      player.on?.('volumechange', onVolumeChange)
    } catch {}

    try {
      seekInputEl = (player as any)?.elements?.inputs?.seek ?? null
      seekInputEl?.addEventListener?.('input', onSeekInput)
      seekInputEl?.addEventListener?.('change', onSeekInput)
    } catch {}

    listenersByOriginalRendered.set(renderedIndex, {
      player,
      onPlay,
      onPause,
      onSeeked,
      onVolumeChange,
      seekInputEl,
      onSeekInput,
    })

    recordOriginalTime(canonicalIndex, player)
    if (isPlaying(player)) {
      pauseUnrelatedCanonicalPlayers(canonicalIndex)
    }
    syncCloneFromOriginal(canonicalIndex, true)
    applyOptimisticCloneVolumeUi(canonicalIndex)
  }

  function destroy() {
    for (const renderedIndex of Array.from(playersByRendered.keys())) {
      unregister(renderedIndex)
    }

    playersByRendered.clear()
    metaByRendered.clear()
    originalByCanonical.clear()
    cloneByCanonical.clear()
    lastOriginalTimeByCanonical.clear()
    listenersByOriginalRendered.clear()
    cloneListenersByRendered.clear()
  }

  return {
    register,
    unregister,
    destroy,
  }
}