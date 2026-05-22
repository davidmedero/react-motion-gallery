export const css = String.raw`.masonryRoundRobinCard {
  display: grid;
  gap: 12px;
  padding: 10px 10px 14px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.masonryRoundRobinMedia {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: #e7edf3;
}

.masonryRoundRobinImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.masonryRoundRobinIndex {
  position: absolute;
  inset-block-start: 10px;
  inset-inline-start: 10px;
  z-index: 20;
  display: grid;
  place-items: center;
  min-width: 32px;
  height: 32px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(11, 18, 32, 0.78);
  color: #fff;
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
  pointer-events: none;
}

.masonryRoundRobinMedia > .open_fullscreen_icon {
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

.masonryRoundRobinVideo {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
}

.masonryRoundRobinVideo :global(.plyr),
.masonryRoundRobinVideo :global(.plyr__video-wrapper),
.masonryRoundRobinVideo :global(.plyr__video-wrapper--fixed-ratio),
.masonryRoundRobinVideo :global(.plyr__poster),
.masonryRoundRobinVideo :global(video) {
  width: 100%;
  height: 100%;
}

.masonryRoundRobinVideo :global(.plyr__poster) {
  background-size: cover;
}

.masonryRoundRobinVideo :global(.plyr__video-wrapper--fixed-ratio) {
  aspect-ratio: auto;
}

.masonryRoundRobinVideo :global(video) {
  object-fit: cover;
}

.masonryRoundRobinMeta {
  display: grid;
  gap: 5px;
  padding: 0 4px;
}

.masonryRoundRobinBadge {
  color: rgba(21, 94, 117, 0.78);
  font-size: 11.84px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.masonryRoundRobinTitle {
  font-size: 16.32px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0;
}

.masonryRoundRobinBody {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  font-size: 14.72px;
  line-height: 1.55;
}`;
