export const css = String.raw`.shell {
  width: min(100%, 860px);
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.card {
  appearance: none;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #e2e8f0;
  cursor: zoom-in;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  transition:
    box-shadow 180ms ease,
    transform 180ms ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
}

.card:focus-visible {
  outline: 3px solid rgba(20, 184, 166, 0.45);
  outline-offset: 3px;
}

.image {
  width: 100%;
  display: block;
  aspect-ratio: 900 / 580;
  object-fit: cover;
}

.spinner {
  border-top-color: #67e8f9;
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

@media (max-width: 720px) {
  .shell {
    grid-template-columns: 1fr;
    max-width: 520px;
  }
}
`;
