export const css = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}

.fullscreenCaption {
  display: grid;
  gap: 0.75rem;
  width: min(100%, 32rem);
}

.fullscreenCaptionEyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.62);
}

.fullscreenCaptionTitle {
  font-size: clamp(1.5rem, 2vw, 2rem);
  letter-spacing: -0.04em;
  line-height: 0.98;
}

.fullscreenCaptionCopy {
  margin: 0;
  max-width: 32ch;
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.95rem;
  line-height: 1.65;
}`;
