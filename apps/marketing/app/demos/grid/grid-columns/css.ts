export const css = String.raw`/* app/globals.css or Demo.module.css */

.gridCard {
  display: grid;
  gap: 12px;
}

.gridImage {
  width: 100%;
  display: block;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 12px;
}

.gridCopy {
  display: grid;
  gap: 5px;
}

.gridBadge {
  color: rgba(21, 94, 117, 0.78);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gridTitle {
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}

.gridBody {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  font-size: 0.92rem;
  line-height: 1.55;
}`;
