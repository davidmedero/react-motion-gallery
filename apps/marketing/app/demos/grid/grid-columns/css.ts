export const css = String.raw`.gridTile {
  display: grid;
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  height: 100%;
  place-content: start; 
}

.gridTileMedia {
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(226, 232, 240, 0.9);
}

.gridTileImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.gridTileCopy {
  display: grid;
  gap: 6px;
  padding: 0 2px 2px;
}

.gridTileTitle {
  display: block;
  color: rgba(15, 23, 42, 0.96);
  font-size: 1.02rem;
  line-height: 1.2;
}

.gridTileBody {
  margin: 0;
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.94rem;
  line-height: 1.5;
  text-wrap: pretty;
}
`;
