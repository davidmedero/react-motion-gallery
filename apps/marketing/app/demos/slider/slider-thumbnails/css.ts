export const css = String.raw`.slide {
  width: 100cqw;
  max-width: 550px;
  display: block;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}

.thumbnailThumb {
  overflow: hidden;
  border-radius: 10px;
}

.thumbnailSkeletonContainer {
  padding: 4px;
}

.thumbnailSkeletonThumb {
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(11, 18, 32, 0.08);
}

.fullscreenThumbnailThumb {
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
}

.thumbnailImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}`;
