export function installDragClickSwallower(plyr: any) {
  const container: HTMLElement | undefined = plyr?.elements?.container;
  const controls: HTMLElement | undefined = plyr?.elements?.controls;
  if (!container) return;

  if ((plyr as any).__rmgDragSwallowCleanup) return;

  const THRESH_PX = 5;

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
