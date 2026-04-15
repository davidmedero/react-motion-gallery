export const css = String.raw`/* app/globals.css or Demo.module.css */

.masonryBalancedCard {
  display: grid;
  gap: 12px;
  padding: 10px 10px 14px;
  border-radius: 22px;
  background-color: #fff;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

.masonryBalancedMedia {
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: #e7edf3;
}

.masonryBalancedMedia > * {
  width: 100%;
  height: 100%;
}

.masonryBalancedImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.masonryBalancedVideo {
  width: 100%;
  height: 100%;
}

.masonryBalancedVideo :global(.plyr),
.masonryBalancedVideo :global(.plyr__video-wrapper),
.masonryBalancedVideo :global(.plyr__video-wrapper--fixed-ratio),
.masonryBalancedVideo :global(.plyr__poster),
.masonryBalancedVideo :global(video) {
  width: 100%;
  height: 100%;
}

.masonryBalancedVideo :global(.plyr__poster) {
  background-size: cover;
}

.masonryBalancedVideo :global(.plyr__video-wrapper--fixed-ratio) {
  aspect-ratio: auto;
}

.masonryBalancedVideo :global(video) {
  object-fit: cover;
}

.masonryBalancedMeta {
  display: grid;
  gap: 5px;
  padding: 0 4px;
}

.masonryBalancedBadge {
  color: rgba(21, 94, 117, 0.78);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.masonryBalancedTitle {
  font-size: 1.02rem;
  letter-spacing: -0.02em;
}

.masonryBalancedBody {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  font-size: 0.92rem;
  line-height: 1.55;
}`;
