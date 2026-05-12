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
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

.fullscreenThumbnailThumb img {
  object-fit: cover !important;
}
`;
