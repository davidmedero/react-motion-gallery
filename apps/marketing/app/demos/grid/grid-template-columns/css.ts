export const css = String.raw`.tile {
  position: relative;
  display: grid;
  gap: 14px;
  min-height: 100%;
  padding: 14px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  isolation: isolate;
  place-content: start;
}

.tileMedia {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(226, 232, 240, 0.88);
}

.tileImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  cursor: zoom-in;
}

.tileCopy {
  display: grid;
  gap: 8px;
  padding: 0 2px 2px;
  align-content: start;
}

.tileTitle {
  display: block;
  color: rgba(15, 23, 42, 0.96);
  font-size: 1.02rem;
  line-height: 1.2;
}

.tileBody {
  margin: 0;
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.94rem;
  line-height: 1.5;
  text-wrap: pretty;
}
`;
