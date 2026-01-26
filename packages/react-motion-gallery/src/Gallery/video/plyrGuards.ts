import type { APITypes } from "plyr-react";

/**
 * Prevents "click after drag" from toggling play/pause or triggering other click handlers
 * when the user was actually panning/dragging on the player surface.
 */
export function installDragClickSwallower(plyr: any) {
  const container: HTMLElement | undefined = plyr?.elements?.container;
  const controls: HTMLElement | undefined = plyr?.elements?.controls;
  if (!container) return;

  if ((plyr as any).__rmgDragSwallowCleanup) return;

  const THRESH_PX = 6;

  let downX = 0;
  let downY = 0;
  let didDrag = false;
  let activePointerId: number | null = null;

  const isInControls = (t: EventTarget | null) =>
    !!(controls && t instanceof Node && controls.contains(t));

  const stopAll = (e: Event) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
  };

  const onPointerDownCapture = (e: PointerEvent) => {
    if (isInControls(e.target)) return;

    activePointerId = e.pointerId;
    downX = e.clientX;
    downY = e.clientY;
    didDrag = false;
  };

  const onPointerMoveCapture = (e: PointerEvent) => {
    if (activePointerId == null || e.pointerId !== activePointerId) return;
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    if (!didDrag && Math.hypot(dx, dy) > THRESH_PX) didDrag = true;
  };

  const onPointerUpCapture = (e: PointerEvent) => {
    if (activePointerId == null || e.pointerId !== activePointerId) return;

    if (didDrag && !isInControls(e.target)) stopAll(e);

    activePointerId = null;

    if (didDrag) {
      window.setTimeout(() => {
        didDrag = false;
      }, 0);
    }
  };

  const onClickCapture = (e: MouseEvent) => {
    if (didDrag && !isInControls(e.target)) stopAll(e);
  };

  const onTouchEndCapture = (e: TouchEvent) => {
    if (didDrag && !isInControls(e.target)) stopAll(e);
  };

  container.addEventListener('pointerdown', onPointerDownCapture, { capture: true });
  container.addEventListener('pointermove', onPointerMoveCapture, { capture: true });
  container.addEventListener('pointerup', onPointerUpCapture, { capture: true });
  container.addEventListener('pointercancel', onPointerUpCapture, { capture: true } as any);
  container.addEventListener('click', onClickCapture, { capture: true });
  container.addEventListener('touchend', onTouchEndCapture, { capture: true, passive: false });

  (plyr as any).__rmgDragSwallowCleanup = () => {
    container.removeEventListener('pointerdown', onPointerDownCapture, { capture: true } as any);
    container.removeEventListener('pointermove', onPointerMoveCapture, { capture: true } as any);
    container.removeEventListener('pointerup', onPointerUpCapture, { capture: true } as any);
    container.removeEventListener('pointercancel', onPointerUpCapture, { capture: true } as any);
    container.removeEventListener('click', onClickCapture, { capture: true } as any);
    container.removeEventListener('touchend', onTouchEndCapture, { capture: true } as any);
    delete (plyr as any).__rmgDragSwallowCleanup;
  };
}

/**
 * Adds a transparent shield layer over Plyr to:
 * - block dblclick (avoid browser fullscreen / zoom weirdness)
 * - prevent accidental "dbl-tap zoom"
 * - optionally toggle play/pause on single click (your current behavior)
 * - installs the drag-click swallower
 */
export function installDblclickGuardWhenReady(player: APITypes | null) {
  if (!player) return;
  const inst: any = player;
  const plyr = inst?.plyr;
  if (!plyr) return;

  const attach = () => {
    const container: HTMLElement | undefined = plyr?.elements?.container;
    const controls:  HTMLElement | undefined = plyr?.elements?.controls;
    if (!container) { requestAnimationFrame(attach); return; }

    (plyr as any).__rmgGuardCleanup?.();

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    let shield = container.querySelector<HTMLElement>('.rmg-plyr-gesture-shield');
    if (!shield) {
      shield = document.createElement('div');
      shield.className = 'rmg-plyr-gesture-shield';
      Object.assign(shield.style, {
        position: 'absolute',
        inset: '0',
        zIndex: '2',
        background: 'transparent',
        pointerEvents: 'none',
      });
      container.appendChild(shield);
    }

    if (controls) {
      const currentZ = getComputedStyle(controls).zIndex;
      if (!currentZ || currentZ === 'auto' || Number(currentZ) < 3) {
        (controls.style as any).zIndex = '3';
      }
    }

    const stop = (e: Event) => { e.stopImmediatePropagation(); e.preventDefault(); };

    const onDbl = (e: MouseEvent) => stop(e);
    shield.addEventListener('dblclick', onDbl, { capture: true });

    let lastTap = 0;
    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 320) stop(e);
      lastTap = now;
    };
    shield.addEventListener('touchend', onTouchEnd, { capture: true, passive: false });

    const onClick = (e: MouseEvent) => {
      const p = plyr;
      if (p?.paused) p.play(); else p?.pause();
      e.stopPropagation();
      e.preventDefault();
    };
    shield.addEventListener('click', onClick, { capture: true });

    const onContainerDbl = (e: MouseEvent) => {
      if (!controls || !(controls.contains(e.target as Node))) stop(e);
    };
    container.addEventListener('dblclick', onContainerDbl, { capture: true });

    installDragClickSwallower(plyr);

    (plyr as any).__rmgGuardCleanup = () => {
      shield.removeEventListener('dblclick', onDbl as any, { capture: true } as any);
      shield.removeEventListener('touchend', onTouchEnd as any, { capture: true } as any);
      shield.removeEventListener('click', onClick as any, { capture: true } as any);
      container.removeEventListener('dblclick', onContainerDbl as any, { capture: true } as any);
    };
  };

  plyr.on?.('ready', attach);
  requestAnimationFrame(attach);
  plyr.on?.('destroyed', () => (plyr as any).__rmgGuardCleanup?.());
}