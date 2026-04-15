export const css = String.raw`/* app/globals.css or Demo.module.css */

.masonryYoutubeCard {
  display: grid;
  gap: 14px;
  padding: 12px 12px 14px;
  border-radius: 22px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  background: #ffffff;
}

.masonryYoutubeFrame {
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: #020617;
}

.masonryYoutubeFrame > * {
  width: 100%;
  height: 100%;
}

.masonryYoutubeVideo {
  width: 100%;
  height: 100%;
}

.masonryYoutubeFrame :global(.plyr),
.masonryYoutubeFrame :global(.plyr__video-wrapper),
.masonryYoutubeFrame :global(.plyr__poster),
.masonryYoutubeFrame :global(video),
.masonryYoutubeFrame :global(iframe) {
  width: 100%;
  height: 100%;
}

.masonryYoutubeFrame :global(.plyr__poster) {
  background-size: cover;
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
}`;
