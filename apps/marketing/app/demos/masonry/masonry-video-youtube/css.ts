export const css = String.raw`.masonryYoutubeCard {
  display: grid;
  gap: 14px;
  padding: 12px 12px 14px;
  border-radius: 22px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.masonryYoutubeFrame {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
}

.masonryYoutubeFrame > :not(.open_fullscreen_icon) {
  width: 100%;
  height: 100%;
}

.masonryYoutubeFrame > .open_fullscreen_icon {
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

.masonryYoutubeVideo {
  width: 100%;
  height: 100%;
}

.masonryYoutubeFrame :global(.plyr),
.masonryYoutubeFrame :global(.plyr__video-wrapper),
.masonryYoutubeFrame :global(.plyr__video-wrapper--fixed-ratio),
.masonryYoutubeFrame :global(.plyr__poster),
.masonryYoutubeFrame :global(video),
.masonryYoutubeFrame :global(iframe) {
  width: 100%;
  height: 100%;
}

.masonryYoutubeFrame :global(.plyr__poster) {
  background-size: cover;
}

.masonryYoutubeFrame :global(.plyr__video-wrapper--fixed-ratio) {
  aspect-ratio: auto;
}

.masonryYoutubeMeta {
  display: grid;
  gap: 6px;
}

.masonryYoutubeTitle {
  font-size: 1.04rem;
  letter-spacing: -0.02em;
}

.masonryYoutubeBody {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  font-size: 0.92rem;
  line-height: 1.6;
}
`;
