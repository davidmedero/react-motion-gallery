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

.pageButtons {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  align-items: center;
  gap: 10px;
  overflow: visible;
}
.pageButtons [data-rmg-page-items="true"] {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.pageButtons [data-rmg-page-items="true"] button,
.pageButtons [data-rmg-page-items="true"] a {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 38px;
  padding: 0 10px;
  border: 1px solid rgba(23, 33, 38, 0.16);
  border-radius: 8px;
  color: #24394d;
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.28);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 8px 18px rgba(var(--rmg-logo-cyan-rgb), 0.08);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.pageButtons [data-rmg-page-items="true"] button[data-rmg-page-control],
.pageButtons [data-rmg-page-items="true"] a[data-rmg-page-control] {
  min-width: 76px;
}
.pageButtons [data-rmg-items-per-page="true"] {
  position: relative;
  z-index: 2;
  justify-self: start;
  min-height: 44px;
  display: inline-grid;
  grid-template-columns: auto minmax(78px, auto);
  align-items: center;
  gap: 9px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 4px 5px 4px 12px;
  border: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.24);
  border-radius: 8px;
  background:
    linear-gradient(180deg, #ffffff, rgba(var(--rmg-logo-cyan-rgb), 0.055)),
    #ffffff;
  box-shadow:
    0 8px 18px rgba(var(--rmg-logo-cyan-rgb), 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.84);
  color: #516068;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
}
.pageButtons [data-rmg-items-per-page="true"] > span {
  min-height: auto;
  padding: 0;
  color: inherit;
  white-space: nowrap;
}
.pageButtons [data-rmg-items-per-page-trigger="true"] {
  appearance: none;
  min-height: 34px;
  display: inline-grid;
  grid-template-columns: minmax(24px, 1fr) 12px;
  align-items: center;
  gap: 9px;
  box-sizing: border-box;
  padding: 0 10px 0 12px;
  border: 0;
  border-radius: 6px;
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(255, 255, 255, 0.9),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      rgba(var(--rmg-logo-cyan-rgb), 0.18),
      rgba(var(--rmg-logo-cyan-rgb), 0.1)
    );
  box-shadow:
    inset 0 -2px 0 rgba(var(--rmg-logo-blue-rgb), 0.44),
    0 5px 14px rgba(var(--rmg-logo-blue-rgb), 0.09);
  color: #24394d;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease;
}
.pageButtons [data-rmg-items-per-page-trigger="true"]::after {
  content: "";
  width: 7px;
  height: 7px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
  transform-origin: 50% 50%;
  transition: transform 180ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
.pageButtons
  [data-rmg-items-per-page-trigger="true"][data-state="open"]::after {
  transform: rotate(225deg) translate(-1px, -1px);
}
.pageButtons [data-rmg-items-per-page-trigger="true"]:hover:not(:disabled) {
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(255, 255, 255, 0.95),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      rgba(var(--rmg-logo-cyan-rgb), 0.24),
      rgba(var(--rmg-logo-cyan-rgb), 0.14)
    );
  box-shadow:
    inset 0 -2px 0 rgba(var(--rmg-logo-blue-rgb), 0.62),
    0 7px 16px rgba(var(--rmg-logo-blue-rgb), 0.12);
}
.pageButtons [data-rmg-items-per-page-trigger="true"]:focus-visible {
  outline: 3px solid rgba(var(--rmg-logo-cyan-rgb), 0.24);
  outline-offset: 2px;
}
.pageButtons [data-rmg-items-per-page-trigger="true"]:disabled {
  background: #eef1f2;
  box-shadow: none;
  color: #8e9aa1;
  cursor: not-allowed;
}
.pageButtons [data-rmg-items-per-page-value="true"] {
  min-width: 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pageButtons [data-rmg-items-per-page-menu="true"] {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  min-width: 96px;
  width: max-content;
  max-width: min(180px, calc(100vw - 32px));
  box-sizing: border-box;
  padding: 5px;
  border: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 18px 36px rgba(var(--rmg-logo-shadow-rgb), 0.13),
    0 7px 18px rgba(var(--rmg-logo-cyan-rgb), 0.12);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-5px) scale(0.96);
  transform-origin: top right;
  visibility: hidden;
  transition:
    opacity 170ms ease,
    transform 170ms cubic-bezier(0.2, 0.7, 0.2, 1),
    visibility 0s linear 170ms;
}
.pageButtons [data-rmg-items-per-page-menu="true"][data-state="open"] {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
  visibility: visible;
  transition:
    opacity 170ms ease,
    transform 170ms cubic-bezier(0.2, 0.7, 0.2, 1),
    visibility 0s;
}
.pageButtons [data-rmg-items-per-page-option="true"] {
  position: relative;
  width: 100%;
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  padding: 0 32px 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #24394d;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}
.pageButtons [data-rmg-items-per-page-option="true"]:hover,
.pageButtons [data-rmg-items-per-page-option="true"][data-active="true"] {
  background: rgba(var(--rmg-logo-cyan-rgb), 0.15);
  color: #2458a8;
}
.pageButtons [data-rmg-items-per-page-option="true"][data-selected="true"] {
  background: rgba(var(--rmg-logo-blue-rgb), 0.11);
  color: #2458a8;
}
.pageButtons
  [data-rmg-items-per-page-option="true"][data-selected="true"]::after {
  content: "";
  position: absolute;
  right: 12px;
  width: 6px;
  height: 10px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg) translateY(-1px);
}
.pageButtons [data-rmg-page-items="true"] button:hover:not(:disabled),
.pageButtons [data-rmg-page-items="true"] a:hover:not([aria-disabled="true"]) {
  border-color: rgba(var(--rmg-logo-cyan-rgb), 0.7);
  background: rgba(var(--rmg-logo-cyan-rgb), 0.14);
}
.pageButtons [data-rmg-page-items="true"] button:disabled,
.pageButtons [data-rmg-page-items="true"] a[aria-disabled="true"] {
  color: #8e9aa1;
  border-color: rgba(23, 33, 38, 0.12);
  background: #eef1f2;
  box-shadow: none;
}
.pageButtons [data-rmg-page-items="true"] button[data-selected="true"],
.pageButtons [data-rmg-page-items="true"] a[data-selected="true"],
.pageButtons [data-rmg-page-items="true"] button:hover[data-selected="true"],
.pageButtons [data-rmg-page-items="true"] a:hover[data-selected="true"] {
  color: #fff;
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.72);
  background: linear-gradient(
    135deg,
    var(--rmg-logo-cyan),
    var(--rmg-logo-blue)
  );
  box-shadow: 0 10px 22px rgba(var(--rmg-logo-blue-rgb), 0.22);
}
.pageButtons [data-rmg-page-break="true"] {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  color: #71808a;
  font-weight: 700;
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
