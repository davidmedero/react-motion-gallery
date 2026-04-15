export const css = String.raw`/* app/globals.css or Demo.module.css */

.zoomPanGridFrame {
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.3), transparent 46%),
    linear-gradient(160deg, #15253d 0%, #163451 52%, #102033 100%);
  box-shadow:
    0 22px 46px rgba(9, 19, 32, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}`;
