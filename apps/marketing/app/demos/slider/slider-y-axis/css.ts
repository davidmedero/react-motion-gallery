export const css = String.raw`.demoCanvasSliderYAxis {
  height: min(560px, calc(100dvh - 345px));
  min-height: 320px;
  container-type: size;
}

.slide {
  width: 100cqw;
  display: block;
  aspect-ratio: 16 / 7;
  object-fit: cover;
  border-radius: 12px;
}

@media (max-width: 640px) {
  .demoCanvasSliderYAxis {
    min-height: 280px;
  }
}`;
