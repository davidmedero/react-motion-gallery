export const css = String.raw`/* app/globals.css or Demo.module.css */

.zoomPanStandalone {
  width: min(100%, 464px);
  aspect-ratio: 4 / 5;
  max-height: 580px;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.34), transparent 48%),
    linear-gradient(160deg, #102033 0%, #0f2f3b 52%, #14243c 100%);
  box-shadow:
    0 28px 60px rgba(9, 19, 32, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}`;
