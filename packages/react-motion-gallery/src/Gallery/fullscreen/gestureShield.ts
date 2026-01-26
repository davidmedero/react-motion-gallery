export type GestureShield = {
  add: (timeoutMs?: number) => () => void;
};

export function createGestureShield(zIndex = 10000): GestureShield {
  let cleanup: null | (() => void) = null;

  function add(timeoutMs = 400) {
    cleanup?.();

    const shield = document.createElement("div");
    Object.assign(shield.style, {
      position: "fixed",
      inset: "0",
      zIndex: String(zIndex),
      background: "transparent",
      touchAction: "none",
      pointerEvents: "auto",
    } as CSSStyleDeclaration);

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