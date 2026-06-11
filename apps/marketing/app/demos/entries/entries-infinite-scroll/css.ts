export const css = String.raw`.shell {
  --entries-data-row-height: 430px;
  --entries-data-media-height: calc(var(--entries-data-row-height) - 38px);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: #172126;
}

.header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
}

.statusGroup {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  color: #516068;
  font-size: 0.82rem;
  line-height: 1.2;
}

.statusGroup span {
  padding: 7px 9px;
  border: 1px solid rgba(23, 33, 38, 0.14);
  border-radius: 8px;
  background: #fff;
}

.statusGroup span[data-ready="true"] {
  color: #155b39;
  border-color: rgba(21, 91, 57, 0.22);
  background: #f0faf4;
}

.controls,
.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow-anchor: none;
}

.controls button,
.controls a,
.footer button,
.notice button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border: 1px solid rgba(23, 33, 38, 0.16);
  border-radius: 8px;
  background: #172126;
  color: #fff;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.controls button:disabled,
.controls a[aria-disabled="true"],
.footer button:disabled {
  cursor: not-allowed;
  color: #8e9aa1;
  background: #eef1f2;
}

.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(153, 64, 44, 0.2);
  border-radius: 8px;
  background: #fff5f2;
  color: #7a2f1f;
  font-size: 0.9rem;
}

.entryList {
  gap: 18px;
}

.entryList :global([data-rmg-entry-owner])::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 8px;
  box-shadow: 0 14px 32px rgba(23, 33, 38, 0.08);
  pointer-events: none;
}

.pendingSkeletonList {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 0;
}

.pendingSkeletonRow {
  position: relative;
  min-height: var(--entries-data-row-height);
  border-radius: 8px;
}

.pendingSkeletonRow::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 8px;
  box-shadow: 0 14px 32px rgba(23, 33, 38, 0.08);
  pointer-events: none;
}

.pendingSkeletonWrap {
  height: var(--entries-data-row-height);
  min-height: var(--entries-data-row-height);
}

.card {
  height: 100%;
  min-height: var(--entries-data-row-height);
  display: grid;
  grid-template-columns: minmax(260px, 0.92fr) minmax(0, 1.08fr);
  gap: 18px;
  padding: 18px;
  border: 1px solid rgba(23, 33, 38, 0.12);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), #fff), #fff;
  box-shadow: none;
  overflow: hidden;
}

:global([data-rmg-entry-compare="1"]) .card {
  box-shadow: none;
}

.copy {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 20px;
  padding: 2px 0;
}

.copyMain {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.inventory {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: auto 0 0;
  padding: 0;
}

.inventory div {
  min-width: 78px;
  padding: 7px 9px;
  border-radius: 8px;
  background: #edf3f2;
}

.inventory dt {
  margin: 0 0 3px;
  color: #7a8991;
  font-size: 0.64rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.inventory dd {
  margin: 0;
  color: #42525a;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: capitalize;
}

.rating {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  color: #5d6b73;
  font-size: 0.88rem;
  line-height: 1.2;
}

.ratingStars {
  color: #f5a524;
  font-size: 1rem;
}

.ratingStar {
  flex: 0 0 auto;
}

.ratingLabel {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #5d6b73;
  font-weight: 700;
}

.price {
  color: #132027;
  font-size: 1.14rem;
  font-weight: 800;
  line-height: 1.1;
}

.copy h3 {
  margin: 0;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #132027;
  font-size: clamp(1.28rem, 2vw, 1.85rem);
  line-height: 1.08;
  letter-spacing: 0;
}

.copy p {
  margin: 0;
  color: #405058;
  font-size: 1rem;
  line-height: 1.55;
}

.media {
  --rmg-slider-height: var(--entries-data-media-height);
  --rmg-slider-initial-height: var(--entries-data-media-height);
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: grid;
  align-items: stretch;
  border-radius: 8px;
  background: #f6f8f8;
  box-shadow: inset 0 0 0 1px rgba(23, 33, 38, 0.1);
  overflow: hidden;
}

.media > * {
  min-width: 0;
}

.productImage {
  display: block;
  width: 100%;
  max-width: 414px;
  height: 100%;
  max-height: var(--entries-data-media-height);
  object-fit: contain;
  box-sizing: border-box;
  background: transparent;
}

.skeletonWrap {
  box-sizing: border-box;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(23, 33, 38, 0.12);
  border-radius: 8px;
  box-shadow: none;
}

.skeletonCard {
  position: relative;
  height: 100%;
  min-height: calc(var(--entries-data-row-height) - 2px);
  padding: 18px;
  box-sizing: border-box;
  background: #fff;
  overflow: hidden;
}

.skeletonCard::after {
  --product-skeleton-sheen: rgba(255, 255, 255, 0.48);
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.24) 22%,
    var(--product-skeleton-sheen, rgba(255, 255, 255, 0.48)) 50%,
    rgba(255, 255, 255, 0.24) 78%,
    transparent 100%
  );
  animation: productSkeletonShimmer 1200ms linear infinite;
  transform: translate3d(-100%, 0, 0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  pointer-events: none;
}

.skeletonLayout {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.skeletonLayout > div {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(260px, 0.92fr) minmax(0, 1.08fr);
  align-items: stretch;
  gap: 18px;
}

.skeletonLayout > div > div:first-child {
  position: relative;
  min-width: 0;
  min-height: 0;
  height: 100%;
  box-shadow: inset 0 0 0 1px rgba(23, 33, 38, 0.1);
}

.skeletonLayout > div > div:nth-child(2) {
  container: product-skeleton-copy / inline-size;
}

@container product-skeleton-copy (min-width: 420px) {
  .skeletonLayout
    > div
    > div:nth-child(2)
    > div:first-child
    > div:nth-child(4)
    > div:nth-child(n + 4) {
    display: none;
  }
}

@keyframes productSkeletonShimmer {
  0% {
    transform: translate3d(-100%, 0, 0);
  }

  100% {
    transform: translate3d(100%, 0, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .skeletonCard::after {
    animation: none;
  }
}

@media (max-width: 1279px) {
  .shell {
    --entries-data-row-height: 620px;
    --entries-data-media-height: 270px;
  }

  .card {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    align-content: start;
    padding: 14px;
  }

  .skeletonCard {
    padding: 14px;
  }

  .skeletonLayout > div {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    align-content: start;
    gap: 18px;
  }

  .media {
    min-height: var(--entries-data-media-height);
    height: auto;
  }

  .skeletonLayout > div > div:first-child {
    min-height: var(--entries-data-media-height);
    height: auto;
  }

  .productImage {
    max-height: var(--entries-data-media-height);
  }
}

.overlay {
  box-sizing: border-box;
  display: grid;
  align-content: end;
  gap: 12px;
  width: 100%;
  min-height: 100%;
  padding: clamp(18px, 3vw, 34px);
  max-width: min(100%, 42rem);
}

.overlayKicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.14);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.overlayTitle {
  color: #f8fafc;
  font-size: clamp(1.05rem, 1.4vw, 1.45rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0;
  text-wrap: balance;
}

.overlayBody {
  max-width: 34rem;
  margin: -4px 0 0;
  color: rgba(248, 250, 252, 0.86);
  font-size: 0.95rem;
  line-height: 1.58;
}

.overlayMeta {
  color: rgba(248, 250, 252, 0.82);
  font-size: 0.88rem;
  font-weight: 600;
}

.overlayDescription {
  max-width: 32rem;
  margin: -2px 0 0;
  color: rgba(248, 250, 252, 0.76);
  font-size: 0.92rem;
  line-height: 1.55;
}

.sentinel {
  min-height: 42px;
  display: grid;
  place-items: center;
  color: #5d6b73;
  font-size: 0.9rem;
}

@media (max-width: 760px) {
  .shell {
    --entries-data-row-height: 620px;
    --entries-data-media-height: 270px;
  }

  .header {
    justify-content: flex-start;
  }

  .statusGroup {
    justify-content: flex-start;
  }

  .card {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    align-content: start;
    padding: 14px;
  }

  .skeletonCard {
    padding: 14px;
  }

  .skeletonLayout > div {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    align-content: start;
    gap: 18px;
  }

  .media {
    min-height: var(--entries-data-media-height);
    height: auto;
  }

  .skeletonLayout > div > div:first-child {
    min-height: var(--entries-data-media-height);
    height: auto;
  }

  .productImage {
    max-height: var(--entries-data-media-height);
  }

  .overlay {
    padding: 18px;
  }
}
`;
