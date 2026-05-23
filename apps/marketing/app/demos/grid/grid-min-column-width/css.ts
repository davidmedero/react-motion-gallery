export const css = String.raw`.gridCard {
  display: grid;
  gap: 12px;
}

.gridImage {
  width: 100%;
  display: block;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 12px;
  cursor: zoom-in;
}

.gridCopy {
  display: grid;
  gap: 5px;
}

.gridBadge {
  color: rgba(21, 94, 117, 0.78);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
}

.gridTitle {
  font-size: 1.05rem;
  line-height: 1.2;
}

.gridBody {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  font-size: 0.92rem;
  line-height: 1.5;
}`;
