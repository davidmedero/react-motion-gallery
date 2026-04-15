export const css = String.raw`/* app/globals.css or Demo.module.css */

.masonryRoundRobinCard {
  display: grid;
  gap: 12px;
  padding: 12px;
  border-radius: 24px;
  border: 1px solid rgba(11, 18, 32, 0.08);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.06);
}

.masonryRoundRobinMedia {
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
}

.masonryRoundRobinMedia > * {
  width: 100%;
  height: 100%;
}

.masonryRoundRobinImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.masonryRoundRobinVideo {
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
  padding: 0 2px;
}

.masonryRoundRobinBadge {
  color: rgba(21, 94, 117, 0.78);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.masonryRoundRobinTitle {
  font-size: 1rem;
  letter-spacing: -0.02em;
}

.masonryRoundRobinBody {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  font-size: 0.92rem;
  line-height: 1.55;
}`;
