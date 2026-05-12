export const css = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}

.autoplayProgress {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 10;
  width: min(60%, 28rem);
  height: 6px;
  overflow: hidden;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.18);
  pointer-events: none;
}

.autoplayProgress[data-active="false"] {
  opacity: 0.45;
}

.autoplayProgressBar {
  width: 100%;
  height: 100%;
  transform: scaleX(0);
  transform-origin: left center;
  background: rgb(80, 163, 255);
  will-change: transform;
}

@media (max-width: 767px) {
  .sliderViewport {
    padding-bottom: 22px;
  }
}

@media (min-width: 768px) {
  .sliderViewport {
    padding-bottom: 28px;
  }
}
`;
