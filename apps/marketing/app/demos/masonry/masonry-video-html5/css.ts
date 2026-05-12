export const css = String.raw`.masonryHtml5Card {
  display: grid;
  gap: 14px;
  padding: 12px 12px 14px;
  border-radius: 22px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.masonryHtml5Frame {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
}

.masonryHtml5Frame > :not(.open_fullscreen_icon) {
  width: 100%;
  height: 100%;
}

.masonryHtml5Frame > .open_fullscreen_icon {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 9999;
  display: block;
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));
  cursor: pointer;
}

.masonryHtml5Video {
  width: 100%;
  height: 100%;
}

.masonryHtml5Frame :global(.plyr),
.masonryHtml5Frame :global(.plyr__video-wrapper),
.masonryHtml5Frame :global(.plyr__video-wrapper--fixed-ratio),
.masonryHtml5Frame :global(.plyr__poster),
.masonryHtml5Frame :global(video) {
  width: 100%;
  height: 100%;
}

.masonryHtml5Frame :global(.plyr__poster) {
  background-size: cover;
}

.masonryHtml5Frame :global(.plyr__video-wrapper--fixed-ratio) {
  aspect-ratio: auto;
}

.masonryHtml5Frame :global(video) {
  object-fit: cover;
}

.masonryHtml5Meta {
  display: grid;
  gap: 6px;
}

.masonryHtml5Title {
  font-size: 1.04rem;
  letter-spacing: -0.02em;
}

.masonryHtml5Body {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  font-size: 0.92rem;
  line-height: 1.6;
}
`;
