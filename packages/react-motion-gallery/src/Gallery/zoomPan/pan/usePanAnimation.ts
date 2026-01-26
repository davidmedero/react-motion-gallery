import * as React from "react";
import { Animations } from "../../shared/motion/animations";
import type { PanRuntimeDeps, WindowType } from "./types";

export function usePanAnimation(d: PanRuntimeDeps) {
  React.useEffect(() => {
    const anim = Animations(
      document,
      window as WindowType,
      () => {
        d.boundsX.current?.constrain(d.pointerDownRef.current);
        d.boundsY.current?.constrain(d.pointerDownRef.current);
        d.bodyX.current?.seek();
        d.bodyY.current?.seek();
      },
      (alpha) => {
        const locX = d.locX.current;
        const locY = d.locY.current;
        const prevX = d.prevX.current;
        const prevY = d.prevY.current;
        if (!locX || !locY || !prevX || !prevY) return;

        const lx = locX.get() * alpha + prevX.get() * (1 - alpha);
        const ly = locY.get() * alpha + prevY.get() * (1 - alpha);

        d.offX.current?.set(lx);
        d.offY.current?.set(ly);
        d.renderPan(lx, ly);

        const settled = !!d.bodyX.current?.settled() && !!d.bodyY.current?.settled();
        const within = !(d.boundsX.current?.reached?.()) && !(d.boundsY.current?.reached?.());
        const stop = settled && within && !d.pointerDownRef.current;
        if (stop) d.animRef.current?.stop();
      }
    );

    d.animRef.current = anim;
    anim.init();

    return () => {
      anim.destroy();
      d.animRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}