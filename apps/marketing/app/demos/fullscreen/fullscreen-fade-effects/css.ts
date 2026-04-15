export const css = String.raw`.slideButton {
  width: 100cqw;
  max-width: 550px;
  display: block;
  padding: 0;
  border: 0;
  background: none;
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(8, 18, 28, 0.18);
  cursor: zoom-in;
}

.slideButton:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.92);
  outline-offset: 4px;
}

.slideImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  pointer-events: none;
}

.fullscreenCaption {
  display: grid;
  gap: 0.45rem;
  max-width: 230px;
  padding: 1rem 1.05rem;
  border-radius: 18px;
  color: white;
  background: linear-gradient(180deg, rgba(16, 24, 38, 0.84), rgba(7, 11, 18, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px);
}

.fullscreenCaptionTitle {
  font-size: 1.1rem;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.fullscreenCaptionMeta {
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.68);
}

.fullscreenThumbnailThumb {
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
}`;
