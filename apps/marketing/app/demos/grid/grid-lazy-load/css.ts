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
}

.spinner {
  width: 52px;
  height: 52px;
  background: conic-gradient(
    from 180deg,
    #cffafe,
    #67bee5,
    #0ea5e9,
    #0284c7,
    #0369a1,
    #cffafe
  );
  filter: drop-shadow(0 10px 24px rgba(3, 105, 161, 0.28));
}`;
