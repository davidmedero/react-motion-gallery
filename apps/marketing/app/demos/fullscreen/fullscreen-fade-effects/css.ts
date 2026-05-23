export const css = String.raw`.slide {
  width: 100cqw;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

.fullscreenThumbnailThumb {
  overflow: hidden;
  border-radius: 10px;
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
    opacity 220ms cubic-bezier(.2, .7, .2, 1),
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

.fullscreenThumbnailThumb img {
  object-fit: cover !important;
}
`;
