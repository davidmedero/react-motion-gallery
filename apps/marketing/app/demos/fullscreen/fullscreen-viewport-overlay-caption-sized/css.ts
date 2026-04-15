export const css = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}

.fullscreenCaption {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: clamp(1rem, 2vw, 2rem);
  background:
    linear-gradient(180deg, rgba(7, 11, 19, 0.12), rgba(7, 11, 19, 0.78)),
    rgba(8, 10, 16, 0.12);
  backdrop-filter: blur(18px);
}

.fullscreenCaptionEyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.62);
}

.fullscreenCaptionTitle {
  font-size: clamp(1.35rem, 1.8vw, 1.9rem);
  letter-spacing: -0.04em;
  line-height: 1;
}

.fullscreenCaptionCopy {
  margin: 0;
  max-width: 30ch;
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.92rem;
  line-height: 1.62;
}`;
