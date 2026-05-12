export const css = String.raw`.shell {
  width: 100%;
}

.stage {
  display: grid;
  width: 100%;
}

.skeleton {
  width: 100%;
}

.textDemo {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.headerRow {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
}

.headerCopy {
  container-type: inline-size;
  flex: 1 1 260px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.headerTitle {
  max-width: min(100%, 620px);
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.18;
}

.headerMeta {
  max-width: min(100%, 520px);
  margin: 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}

.filterRow {
  flex: 0 1 260px;
  display: flex;
  gap: 9px;
  justify-content: flex-end;
}

.filterRow button {
  width: 52px;
  height: 30px;
  flex-shrink: 0;
  border: 0;
  border-radius: 999px;
  background: #e2e8f0;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.filterRow button:first-child {
  width: 74px;
  background: #0f172a;
  color: #ffffff;
}

.articleGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: stretch;
}

.articleCard {
  container-type: inline-size;
  flex: 1 1 var(--article-width, 260px);
  min-width: 0;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: #ffffff;
}

.articleCard:nth-child(1) {
  --article-width: 340px;
}

.articleCard:nth-child(2) {
  --article-width: 260px;
}

.articleCard:nth-child(3) {
  --article-width: 220px;
}

.articleImage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 8;
  border-radius: 14px;
  overflow: hidden;
  background: #0f172a;
}

.articleVideo,
.articleVideo :global(.plyr),
.articleVideo :global(.plyr__video-wrapper),
.articleVideo :global(.plyr__poster),
.articleVideo :global(video),
.articleVideo :global(iframe) {
  width: 100%;
  height: 100%;
}

.articleVideo :global(.plyr__poster) {
  background-size: cover;
}

.articleVideo :global(video) {
  object-fit: cover;
}

.articleImage span {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  min-width: 0;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  color: #334155;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}

.articleTitle,
.articleBody {
  width: 100%;
  margin: 0;
}

.articleTitle {
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.articleBody {
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.62;
}
`;
