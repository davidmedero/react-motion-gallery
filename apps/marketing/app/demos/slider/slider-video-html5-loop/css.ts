export const css = String.raw`.slide_wrapper {
  position: relative;
  width: 100cqw;
  max-width: 550px;
}

.open_fullscreen_icon {
  position: absolute;
  top: 12;
  right: 12;
  z-index: 9999;
  cursor: pointer;
}

.slide {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}

@media(max-width: 767px) {
  .slider_viewport {
    padding-bottom: 46px;
  }
}

@media(min-width: 768px) {
  .slider_viewport {
    padding-bottom: 52px;
  }
}`;
