// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from 'vitest'

import { createVideoSnapshotStore } from './videoSnapshotStore'

function installAnimationFrame() {
  const originalRaf = window.requestAnimationFrame
  const originalCancel = window.cancelAnimationFrame
  let id = 0
  const timers = new Map<number, number>()

  window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    const nextId = ++id
    const timer = window.setTimeout(() => {
      timers.delete(nextId)
      cb(performance.now())
    }, 0)

    timers.set(nextId, timer)
    return nextId
  }) as typeof window.requestAnimationFrame

  window.cancelAnimationFrame = ((handle: number) => {
    const timer = timers.get(handle)
    if (timer != null) window.clearTimeout(timer)
    timers.delete(handle)
  }) as typeof window.cancelAnimationFrame

  return () => {
    for (const timer of timers.values()) {
      window.clearTimeout(timer)
    }

    window.requestAnimationFrame = originalRaf
    window.cancelAnimationFrame = originalCancel
  }
}

async function waitForSnapshot(
  store: ReturnType<typeof createVideoSnapshotStore>,
  canonicalIndex: number
) {
  for (let i = 0; i < 10; i += 1) {
    const snapshot = store.getSnapshot(canonicalIndex)
    if (snapshot) return snapshot

    await new Promise((resolve) => window.setTimeout(resolve, 5))
  }

  throw new Error('Timed out waiting for video snapshot')
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('video snapshot store', () => {
  test('layers fallback poster snapshots above Plyr poster and black video surfaces', async () => {
    const restoreAnimationFrame = installAnimationFrame()
    const store = createVideoSnapshotStore()
    const host = document.createElement('div')

    host.innerHTML = `
      <div class="plyr plyr--video plyr__poster-enabled plyr--stopped" style="background:#000">
        <div class="plyr__video-wrapper" style="background:#000">
          <div class="plyr__poster" style="background-color:#000;opacity:1;z-index:1"></div>
          <video poster="https://example.com/poster.jpg">
            <source src="https://example.com/video.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="plyr__controls">
          <button type="button">Play</button>
        </div>
      </div>
    `

    document.body.appendChild(host)

    try {
      store.registerOriginal({
        canonicalIndex: 0,
        api: {
          plyr: {
            on: vi.fn(),
            off: vi.fn(),
            elements: { inputs: {} },
            media: null,
          },
        } as any,
        hostEl: host,
        provider: 'mp4',
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/poster.jpg',
        ratio: 16 / 9,
      })

      const snapshot = await waitForSnapshot(store, 0)
      const dom = document.createElement('div')
      dom.innerHTML = snapshot.markupHtml

      const root = dom.querySelector<HTMLElement>('.plyr')
      const wrapper = dom.querySelector<HTMLElement>('.plyr__video-wrapper')
      const poster = dom.querySelector<HTMLElement>('.plyr__poster')
      const frame = dom.querySelector<HTMLElement>('[data-rmg-video-snapshot-frame="true"]')
      const frameImg = frame?.querySelector<HTMLImageElement>('img') ?? null

      expect(dom.querySelector('video')).toBeNull()
      expect(dom.querySelector('source')).toBeNull()
      expect(root?.style.getPropertyValue('--plyr-video-background')).toBe('transparent')
      expect(root?.style.backgroundColor).toBe('transparent')
      expect(wrapper?.style.backgroundColor).toBe('transparent')
      expect(poster?.style.backgroundColor).toBe('transparent')
      expect(frame?.style.zIndex).toBe('2')
      expect(frame?.style.background).toBe('transparent')
      expect(frameImg?.src).toBe('https://example.com/poster.jpg')
    } finally {
      store.destroy()
      restoreAnimationFrame()
    }
  })
})
