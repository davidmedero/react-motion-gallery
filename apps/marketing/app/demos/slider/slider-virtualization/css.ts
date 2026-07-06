export const css = String.raw`.sliderViewport {
  height: calc((var(--rmg-slide-main-size, 220px) * 1.5) + 44px);
  padding-bottom: 44px;
}

.slide {
  width: 100%;
  display: block;
  object-fit: cover;
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  background: rgba(125, 211, 252, 0.14);
}

.scrollbar {
  --rmg-scrollbar-track: rgba(15, 23, 42, 0.16);
  --rmg-scrollbar-track-active: rgba(80, 163, 255, 0.28);
  --rmg-scrollbar-thumb: rgb(80, 163, 255);
  --rmg-scrollbar-thumb-shadow: 0 4px 14px rgba(80, 163, 255, 0.28);
}

.spinner {
  width: 52px;
  height: 52px;
  background: conic-gradient(
    from 180deg,
    #cffafe,
    #67bee5,
    #0ea5e9,
    #0284c7,
    #0369a1,
    #cffafe
  );
  filter: drop-shadow(0 10px 24px rgba(3, 105, 161, 0.28));
}

@media (min-width: 768px) {
  .sliderViewport {
    height: calc((var(--rmg-slide-main-size, 220px) * 1.5) + 52px);
    padding-bottom: 52px;
  }
}`;
