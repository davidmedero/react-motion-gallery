export const css = String.raw`.shell {
  display: flex;
  width: 100%;
  justify-content: center;
}

.frame {
  width: min(100%, 962px);
  aspect-ratio: 962 / 580;
  max-height: 580px;
  border-radius: 16px;
  overflow: hidden;
  display: grid;
  background: transparent;
}

.content,
.zoomPan {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.skeletonSurface {
  width: 100%;
  height: 100%;
}

.image {
  border-radius: inherit;
}
`;
