import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createVideoSnapshotStore } from './videoSnapshotStore'

const describeDom =
  typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    ? describe.skip
    : describe

type Listener = () => void

class FakePlyrPlayer {
  media: HTMLVideoElement
  elements: {
    inputs: { seek: HTMLInputElement }
    buttons: Record<string, HTMLElement>
    display: Record<string, HTMLElement>
  }

  private listeners = new Map<string, Set<Listener>>()

  constructor(args: { media: HTMLVideoElement; seekInput: HTMLInputElement }) {
    this.media = args.media
    this.elements = {
      inputs: {
        seek: args.seekInput,
      },
      buttons: {},
      display: {},
    }
  }

  on(event: string, listener: Listener) {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener)
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener)
  }

  emit(event: string) {
    for (const listener of this.listeners.get(event) ?? []) {
      listener()
    }
  }
}

function toApi(player: FakePlyrPlayer) {
  return { plyr: player } as any
}

function setRect(el: Element, width: number, height: number) {
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      ({
        width,
        height,
        left: 0,
        top: 0,
        right: width,
        bottom: height,
      }) as DOMRect,
  })
}

function defineReadonly<T>(target: object, key: string, value: T) {
  Object.defineProperty(target, key, {
    configurable: true,
    value,
  })
}

function createHost(poster = 'https://example.com/poster.jpg') {
  const host = document.createElement('div')
  host.innerHTML = `
    <div class="plyr plyr--full-ui" id="plyr-root">
      <div class="plyr__video-wrapper">
        <div class="plyr__poster" style="background-image:url('${poster}')"></div>
        <button class="plyr__control plyr__control--overlaid" aria-pressed="false">Play</button>
        <video></video>
      </div>
      <div class="plyr__controls" id="controls">
        <button class="plyr__control" aria-pressed="true">Pause</button>
        <div class="plyr__progress">
          <input class="plyr__progress__container" type="range" min="0" max="100" value="25" />
          <progress class="plyr__progress__buffer" value="30" max="100"><span>0</span></progress>
        </div>
        <span class="plyr__time plyr__time--current">0:15</span>
        <div class="plyr__volume">
          <input class="plyr__volume__control" type="range" min="0" max="1" step="0.05" value="0.6" />
        </div>
      </div>
    </div>
  `

  document.body.appendChild(host)

  const video = host.querySelector('video') as HTMLVideoElement
  const inputs = host.querySelectorAll('input')
  const seekInput = inputs[0] as HTMLInputElement
  const volumeInput = inputs[1] as HTMLInputElement
  const bufferProgress = host.querySelector('progress') as HTMLProgressElement
  const wrapper = host.querySelector('.plyr__video-wrapper') as HTMLElement

  defineReadonly(video, 'readyState', 4)
  defineReadonly(video, 'videoWidth', 1920)
  defineReadonly(video, 'videoHeight', 1080)
  defineReadonly(video, 'poster', poster)

  video.style.objectFit = 'cover'
  video.style.objectPosition = '50% 50%'
  seekInput.style.setProperty('--value', '25%')
  seekInput.setAttribute('aria-valuenow', '15')
  seekInput.setAttribute('aria-valuetext', '0:15 of 1:00')
  seekInput.setAttribute('seek-value', '25')
  volumeInput.style.setProperty('--value', '60%')
  volumeInput.setAttribute('aria-valuenow', '60')
  volumeInput.setAttribute('aria-valuetext', '60.0%')

  setRect(wrapper, 320, 180)
  setRect(video, 320, 180)

  const player = new FakePlyrPlayer({ media: video, seekInput })

  return {
    host,
    player,
    seekInput,
    volumeInput,
    bufferProgress,
  }
}

async function flushSnapshot() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await Promise.resolve()
  await Promise.resolve()
}

describeDom('createVideoSnapshotStore', () => {
  let drawImageMock: ReturnType<typeof vi.fn>
  let createObjectUrlMock: ReturnType<typeof vi.fn>
  let revokeObjectUrlMock: ReturnType<typeof vi.fn>
  let decodeMock: ReturnType<typeof vi.fn>
  let getContextResult: { drawImage: ReturnType<typeof vi.fn> } | null
  let blobResult: Blob | null
  let createObjectUrlId: number
  let originalCreateObjectURL: typeof URL.createObjectURL | undefined
  let originalRevokeObjectURL: typeof URL.revokeObjectURL | undefined
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext
  let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob
  let originalImageDecode: typeof Image.prototype.decode | undefined

  beforeEach(() => {
    drawImageMock = vi.fn()
    decodeMock = vi.fn(async () => {})
    getContextResult = { drawImage: drawImageMock }
    blobResult = new Blob(['frame'], { type: 'image/png' })
    createObjectUrlId = 0

    createObjectUrlMock = vi.fn(() => `blob:${++createObjectUrlId}`)
    revokeObjectUrlMock = vi.fn()

    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    originalGetContext = HTMLCanvasElement.prototype.getContext
    originalToBlob = HTMLCanvasElement.prototype.toBlob
    originalImageDecode = Image.prototype.decode

    URL.createObjectURL = createObjectUrlMock as any
    URL.revokeObjectURL = revokeObjectUrlMock as any
    HTMLCanvasElement.prototype.getContext = vi.fn(() => getContextResult as any)
    HTMLCanvasElement.prototype.toBlob = vi.fn(function (cb: BlobCallback) {
      cb(blobResult)
    })
    Image.prototype.decode = decodeMock as any
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL as any
    URL.revokeObjectURL = originalRevokeObjectURL as any
    HTMLCanvasElement.prototype.getContext = originalGetContext
    HTMLCanvasElement.prototype.toBlob = originalToBlob
    Image.prototype.decode = originalImageDecode as any
    document.body.innerHTML = ''
  })

  it('builds an mp4 snapshot from the original player DOM and injects a captured frame', async () => {
    const store = createVideoSnapshotStore()
    const { host, player } = createHost()

    store.registerOriginal({
      canonicalIndex: 0,
      api: toApi(player),
      hostEl: host,
      provider: 'mp4',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      ratio: 16 / 9,
    })

    player.emit('ready')
    await flushSnapshot()

    const snapshot = store.getSnapshot(0)
    expect(snapshot).not.toBeNull()
    expect(snapshot?.hasLiveFrame).toBe(true)
    expect(snapshot?.frameSrc).toBe('blob:1')
    expect(decodeMock).toHaveBeenCalledTimes(1)
    expect(snapshot?.markupHtml).toContain('plyr__controls')
    expect(snapshot?.markupHtml).toContain('0:15')
    expect(snapshot?.markupHtml).toContain('data-rmg-video-snapshot-frame="true"')
    expect(snapshot?.markupHtml).toContain('blob:1')
    expect(snapshot?.markupHtml).toContain('brightness(1.03)')
    expect(snapshot?.markupHtml).not.toContain('<video')
    expect(snapshot?.markupHtml).not.toContain('id="plyr-root"')
  })

  it('falls back to poster snapshots when frame capture fails', async () => {
    const store = createVideoSnapshotStore()
    const { host, player } = createHost('https://example.com/fallback-poster.jpg')

    decodeMock.mockRejectedValueOnce(new Error('decode failed'))

    store.registerOriginal({
      canonicalIndex: 0,
      api: toApi(player),
      hostEl: host,
      provider: 'mp4',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/fallback-poster.jpg',
      ratio: 16 / 9,
    })

    player.emit('pause')
    await flushSnapshot()

    const snapshot = store.getSnapshot(0)
    expect(snapshot).not.toBeNull()
    expect(snapshot?.hasLiveFrame).toBe(false)
    expect(snapshot?.frameSrc).toBe('https://example.com/fallback-poster.jpg')
    expect(snapshot?.markupHtml).toContain('https://example.com/fallback-poster.jpg')
    expect(snapshot?.markupHtml).not.toContain('brightness(1.03)')
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:1')
  })

  it('uses poster fallback for iframe-backed providers without attempting live frame capture', async () => {
    const store = createVideoSnapshotStore()
    const { host, player } = createHost('https://example.com/youtube-poster.jpg')

    store.registerOriginal({
      canonicalIndex: 0,
      api: toApi(player),
      hostEl: host,
      provider: 'youtube',
      src: 'https://youtube.com/watch?v=abc123',
      poster: 'https://example.com/youtube-poster.jpg',
      ratio: 16 / 9,
    })

    player.emit('ready')
    await flushSnapshot()

    const snapshot = store.getSnapshot(0)
    expect(snapshot).not.toBeNull()
    expect(snapshot?.hasLiveFrame).toBe(false)
    expect(snapshot?.frameSrc).toBe('https://example.com/youtube-poster.jpg')
    expect(drawImageMock).not.toHaveBeenCalled()
  })

  it('coalesces seek input changes within a frame and refreshes again on seeked', async () => {
    const store = createVideoSnapshotStore()
    const { host, player, seekInput } = createHost()

    store.registerOriginal({
      canonicalIndex: 0,
      api: toApi(player),
      hostEl: host,
      provider: 'mp4',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      ratio: 16 / 9,
    })

    player.emit('ready')
    await flushSnapshot()

    const firstVersion = store.getSnapshot(0)?.version ?? 0

    seekInput.dispatchEvent(new Event('input'))
    seekInput.dispatchEvent(new Event('change'))
    await flushSnapshot()

    const afterInputVersion = store.getSnapshot(0)?.version ?? 0
    expect(afterInputVersion).toBe(firstVersion + 1)

    player.emit('seeked')
    await flushSnapshot()

    expect(store.getSnapshot(0)?.version).toBe(afterInputVersion + 1)
  })

  it('preserves live range and progress state in serialized snapshot markup', async () => {
    const store = createVideoSnapshotStore()
    const { host, player, seekInput, volumeInput, bufferProgress } = createHost()

    seekInput.value = '42'
    seekInput.defaultValue = '42'
    seekInput.style.setProperty('--value', '42%')
    seekInput.setAttribute('aria-valuenow', '25.2')
    seekInput.setAttribute('aria-valuetext', '0:25 of 1:00')
    seekInput.setAttribute('aria-valuemin', '0')
    seekInput.setAttribute('aria-valuemax', '60')
    seekInput.setAttribute('seek-value', '42')

    volumeInput.value = '0.8'
    volumeInput.defaultValue = '0.8'
    volumeInput.style.setProperty('--value', '80%')
    volumeInput.setAttribute('aria-valuenow', '80')
    volumeInput.setAttribute('aria-valuetext', '80.0%')
    volumeInput.setAttribute('aria-valuemin', '0')
    volumeInput.setAttribute('aria-valuemax', '100')

    bufferProgress.value = 72
    bufferProgress.max = 100

    store.registerOriginal({
      canonicalIndex: 0,
      api: toApi(player),
      hostEl: host,
      provider: 'mp4',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      ratio: 16 / 9,
    })

    player.emit('pause')
    await flushSnapshot()

    const snapshot = store.getSnapshot(0)
    expect(snapshot).not.toBeNull()

    const container = document.createElement('div')
    container.innerHTML = snapshot?.markupHtml ?? ''

    const snapshotInputs = container.querySelectorAll<HTMLInputElement>('input[type="range"]')
    expect(snapshotInputs).toHaveLength(2)
    expect(snapshotInputs[0].getAttribute('value')).toBe('42')
    expect(snapshotInputs[0].defaultValue).toBe('42')
    expect(snapshotInputs[0].style.getPropertyValue('--value')).toBe('42%')
    expect(snapshotInputs[0].getAttribute('seek-value')).toBe('42')
    expect(snapshotInputs[0].getAttribute('aria-valuenow')).toBe('25.2')
    expect(snapshotInputs[0].getAttribute('aria-valuetext')).toBe('0:25 of 1:00')
    expect(snapshotInputs[0].getAttribute('aria-valuemin')).toBe('0')
    expect(snapshotInputs[0].getAttribute('aria-valuemax')).toBe('60')

    expect(snapshotInputs[1].getAttribute('value')).toBe('0.8')
    expect(snapshotInputs[1].defaultValue).toBe('0.8')
    expect(snapshotInputs[1].style.getPropertyValue('--value')).toBe('80%')
    expect(snapshotInputs[1].getAttribute('aria-valuenow')).toBe('80')
    expect(snapshotInputs[1].getAttribute('aria-valuetext')).toBe('80.0%')
    expect(snapshotInputs[1].getAttribute('aria-valuemin')).toBe('0')
    expect(snapshotInputs[1].getAttribute('aria-valuemax')).toBe('100')

    const snapshotProgress = container.querySelector('progress')
    expect(snapshotProgress?.getAttribute('value')).toBe('72')
    expect(snapshotProgress?.getAttribute('max')).toBe('100')
  })

  it('keeps the previous blob URL alive for one generation before revoking it', async () => {
    const store = createVideoSnapshotStore()
    const first = createHost()

    store.registerOriginal({
      canonicalIndex: 0,
      api: toApi(first.player),
      hostEl: first.host,
      provider: 'mp4',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      ratio: 16 / 9,
    })

    first.player.emit('ready')
    await flushSnapshot()

    first.player.emit('pause')
    await flushSnapshot()

    expect(revokeObjectUrlMock).not.toHaveBeenCalledWith('blob:1')

    first.player.emit('seeked')
    await flushSnapshot()

    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:1')
  })

  it('revokes current and stale blob URLs on unregister and destroy', async () => {
    const store = createVideoSnapshotStore()
    const first = createHost()

    store.registerOriginal({
      canonicalIndex: 0,
      api: toApi(first.player),
      hostEl: first.host,
      provider: 'mp4',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      ratio: 16 / 9,
    })

    first.player.emit('ready')
    await flushSnapshot()

    first.player.emit('pause')
    await flushSnapshot()

    store.unregisterOriginal(0)
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:2')
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:1')

    const second = createHost()
    store.registerOriginal({
      canonicalIndex: 0,
      api: toApi(second.player),
      hostEl: second.host,
      provider: 'mp4',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      ratio: 16 / 9,
    })

    second.player.emit('ready')
    await flushSnapshot()

    second.player.emit('pause')
    await flushSnapshot()

    store.destroy()
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:3')
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:4')
  })
})
