import * as React from 'react';
import { jsx } from 'react/jsx-runtime';

// src/Gallery/fullscreen/gestureShield.ts
function createGestureShield(zIndex = 1e4) {
  let cleanup = null;
  function add(timeoutMs = 400) {
    cleanup?.();
    const shield = document.createElement("div");
    Object.assign(shield.style, {
      position: "fixed",
      inset: "0",
      zIndex: String(zIndex),
      background: "transparent",
      touchAction: "none",
      pointerEvents: "auto"
    });
    document.body.appendChild(shield);
    const remove = () => {
      if (shield.parentNode) shield.remove();
    };
    const timer = window.setTimeout(() => {
      remove();
      cleanup = null;
    }, timeoutMs);
    const teardown = () => {
      window.clearTimeout(timer);
      remove();
      cleanup = null;
    };
    cleanup = teardown;
    return teardown;
  }
  return { add };
}
var RmgSlideContext = React.createContext(null);
function RmgSlideProvider({
  value,
  children
}) {
  return /* @__PURE__ */ jsx(RmgSlideContext.Provider, { value, children });
}
function useRmgSlide() {
  return React.useContext(RmgSlideContext);
}

export { RmgSlideProvider, createGestureShield, useRmgSlide };
//# sourceMappingURL=chunk-3BWJSDSC.mjs.map
//# sourceMappingURL=chunk-3BWJSDSC.mjs.map