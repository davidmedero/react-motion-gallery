export const css = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}

.fullscreenCaptionRoot {
  bottom: 104px !important;
}

.fullscreenCaptionRoot [data-rmg-fs-caption-surface="true"] {
  width: 100%;
  height: 100%;
  overflow: visible;
}

@media (max-width: 1200px) {
  .fullscreenCaption {
    width: 100%;
    height: 100% !important;
    justify-content: flex-end;
    padding: 1rem clamp(1rem, 2vw, 2rem) 30px !important;
  }
}

.fullscreenCaption {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.72rem;
  padding: clamp(18px, 3vw, 34px);
  overflow: visible;
}

.fullscreenCaption > div {
  width: 100%;
  height: 100%;
}

.fullscreenCaption [data-rmg-fs-caption-content="true"] {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 0.72rem;
}

.fullscreenCaptionEyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.64);
}

.fullscreenCaptionTitle {
  font-size: clamp(1.32rem, 1.8vw, 1.9rem);
  font-weight: 600;
  line-height: 1;
}

.fullscreenCaptionCopy {
  margin: 0;
  max-width: 31ch;
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.92rem;
  line-height: 1.58;
}

.fullscreenThumbnailThumb {
  overflow: hidden;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
}

.fullscreenThumbnailThumb::before {
  content: "";
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.16);
  pointer-events: none;
  z-index: 1;
}

.fullscreenThumbnailThumb::after {
  box-sizing: border-box;
  border: 3px solid rgba(186, 230, 253, 0.9);
  box-shadow: none;
  opacity: 0;
  transition:
    opacity 180ms cubic-bezier(.2, .7, .2, 1),
    transform 220ms cubic-bezier(.2, .7, .2, 1);
  transform: scale(0.985);
  transform-origin: center;
  will-change: opacity, transform;
  z-index: 2;
}

.fullscreenThumbnailThumb[data-active="true"]::after {
  opacity: 1;
  transform: scale(1);
}

@media (min-width: 1024px) {
  .fullscreenCaption {
    justify-content: center;
  }

  .fullscreenCaption [data-rmg-fs-caption-content="true"] {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .fullscreenCaption {
    gap: 0.55rem;
    padding: 1rem;
  }

  .fullscreenCaptionCopy {
    font-size: 0.84rem;
    line-height: 1.44;
  }
}
`;
