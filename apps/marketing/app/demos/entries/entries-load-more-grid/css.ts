export const css = String.raw`.shell {
  --entries-data-grid-card-min-height: 480px;
  --entries-data-grid-copy-min-height: 194px;
  --entries-data-grid-gap: 1.5rem;
  --entries-data-grid-shell-gap: 18px;
  --entries-data-grid-row-min-height: max(
    var(--entries-data-grid-card-min-height),
    calc(100cqw + var(--entries-data-grid-copy-min-height))
  );
  --product-demo-ink: rgb(var(--rmg-logo-shadow-rgb));
  --product-demo-muted: rgba(var(--rmg-logo-shadow-rgb), 0.66);
  --product-demo-line: rgba(var(--rmg-logo-blue-rgb), 0.22);
  --product-demo-line-strong: rgba(var(--rmg-logo-blue-rgb), 0.38);
  --product-demo-surface: #ffffff;
  --product-demo-accent-deep: #2458a8;
  --product-demo-cyan: rgb(var(--rmg-logo-cyan-rgb));
  width: 100%;
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: var(--entries-data-grid-shell-gap);
  color: var(--product-demo-ink);
}

.header {
  display: flex;
  justify-content: flex-end;
}

.statusGroup {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  color: var(--product-demo-muted);
  font-size: 0.82rem;
  line-height: 1.2;
}

.statusGroup span {
  padding: 7px 9px;
  border: 1px solid var(--product-demo-line);
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
  justify-content: center;
  gap: 10px;
  overflow-anchor: none;
}

.controls {
  justify-content: space-between;
}

.controls button,
.controls a,
.notice button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.28);
  border-radius: 8px;
  background: #fff;
  color: var(--product-demo-accent-deep);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
}

.controls button:disabled,
.controls a[aria-disabled="true"],
.notice button:disabled {
  color: #8e9aa1;
  background: #eef1f2;
  cursor: not-allowed;
}

.pageButtons {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.pageButtons button,
.pageButtons a {
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

.pageButtons button[data-rmg-page-control],
.pageButtons a[data-rmg-page-control] {
  min-width: 76px;
}

.pageButtons button:hover:not(:disabled),
.pageButtons a:hover:not([aria-disabled="true"]) {
  border-color: rgba(var(--rmg-logo-cyan-rgb), 0.7);
  background: rgba(var(--rmg-logo-cyan-rgb), 0.14);
}

.pageButtons button:disabled,
.pageButtons a[aria-disabled="true"] {
  color: #8e9aa1;
  border-color: rgba(23, 33, 38, 0.12);
  background: #eef1f2;
  box-shadow: none;
}

.pageButtons button[data-selected="true"],
.pageButtons a[data-selected="true"],
.pageButtons button:hover[data-selected="true"],
.pageButtons a:hover[data-selected="true"] {
  color: #fff;
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.72);
  background: linear-gradient(
    135deg,
    var(--rmg-logo-cyan),
    var(--rmg-logo-blue)
  );
  box-shadow: 0 10px 22px rgba(var(--rmg-logo-blue-rgb), 0.22);
}

.pageButtons span {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  color: #71808a;
  font-weight: 700;
}

.primaryButton {
  display: inline-grid;
  place-items: center;
  min-width: 132px;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.46);
  border-radius: 8px;
  background: #f8fcff;
  box-shadow:
    0 10px 24px rgba(var(--rmg-logo-blue-rgb), 0.14),
    inset 0 0 0 1px rgba(var(--rmg-logo-cyan-rgb), 0.12);
  color: var(--product-demo-accent-deep);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
  position: relative;
  z-index: 1;
}

.primaryButton:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(var(--rmg-logo-cyan-rgb), 0.62);
  background: #eaf7ff;
  box-shadow:
    0 14px 28px rgba(var(--rmg-logo-blue-rgb), 0.18),
    inset 0 0 0 1px rgba(var(--rmg-logo-cyan-rgb), 0.2);
}

.primaryButton:focus-visible {
  outline: 3px solid rgba(var(--rmg-logo-cyan-rgb), 0.26);
  outline-offset: 2px;
}

.primaryButton:disabled {
  color: #7b8796;
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.2);
  background: #f1f5f8;
  box-shadow: none;
  cursor: not-allowed;
}

.buttonSpinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(var(--rmg-logo-blue-rgb), 0.24);
  border-top-color: var(--product-demo-accent-deep);
  border-radius: 999px;
  animation: productDataGridSpin 800ms linear infinite;
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

.sentinel {
  display: grid;
  place-items: center;
  min-height: 42px;
  color: var(--product-demo-muted);
  font-size: 0.86rem;
  font-weight: 800;
}

.pendingSkeletonGrid {
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--entries-data-grid-gap);
  align-items: stretch;
  margin-top: max(
    0px,
    calc(var(--entries-data-grid-gap) - var(--entries-data-grid-shell-gap))
  );
  overflow-anchor: none;
}

.entryGridRow {
  position: relative;
  min-height: var(--entries-data-grid-row-min-height);
}

.entryGridRow::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: 8px;
  box-shadow:
    0 14px 30px rgba(var(--rmg-logo-shadow-rgb), 0.07),
    0 8px 22px rgba(var(--rmg-logo-cyan-rgb), 0.09);
  pointer-events: none;
}

.card {
  --product-image-aspect-ratio: 1 / 1;
  position: relative;
  box-sizing: border-box;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--product-demo-line);
  border-radius: 8px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.98),
      rgba(var(--rmg-logo-cyan-rgb), 0.035)
    ),
    var(--product-demo-surface);
}

.media {
  position: relative;
  flex: 0 0 auto;
  min-width: 0;
  height: auto;
  aspect-ratio: var(--product-image-aspect-ratio);
  display: grid;
  align-items: stretch;
  border-bottom: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.16);
  background: #f6f8f8;
  overflow: hidden;
}

.media > * {
  width: 100%;
  height: 100%;
  min-width: 0;
}

.media > * > *,
.media :global([data-rmg-slider-core-scope]),
.media :global([data-rmg-part="viewport"]) {
  width: 100%;
  height: 100%;
  min-width: 0;
}

.media :global([data-rmg-slide="true"]) {
  width: 100%;
  height: 100%;
  min-width: 100%;
}

.productImage {
  display: block;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  background: transparent;
}

.copy {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 9px;
  min-width: 0;
  min-height: var(--entries-data-grid-copy-min-height);
  padding: 14px 14px 18px;
}

.category {
  color: var(--product-demo-accent-deep);
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: capitalize;
}

.copy h3 {
  margin: 0;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--product-demo-ink);
  font-size: 1rem;
  line-height: 1.25;
  letter-spacing: 0;
}

.rating {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  color: var(--product-demo-muted);
  font-size: 0.86rem;
  line-height: 1.2;
}

.ratingStars {
  color: var(--product-demo-cyan);
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
  color: var(--product-demo-muted);
  font-weight: 700;
}

.price {
  color: var(--product-demo-ink);
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.1;
}

.stockBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  margin-top: auto;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  line-height: 1;
}

.stockDot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.stockHigh {
  color: #155b39;
  background: #eefaf3;
}

.stockMedium {
  color: #7a5b12;
  background: #fff8db;
}

.stockLow {
  color: #8d2f21;
  background: #fff1ec;
}

.skeletonWrap {
  box-sizing: border-box;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--product-demo-line);
  border-radius: 8px;
}

.skeletonCard,
.pendingSkeletonItem {
  --product-image-aspect-ratio: 1 / 1;
  position: relative;
  box-sizing: border-box;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
}

.pendingSkeletonItem {
  min-height: var(--entries-data-grid-row-min-height);
  border: 1px solid var(--product-demo-line);
  box-shadow:
    0 14px 30px rgba(var(--rmg-logo-shadow-rgb), 0.07),
    0 8px 22px rgba(var(--rmg-logo-cyan-rgb), 0.09);
}

.skeletonCard::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.24) 22%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.24) 78%,
    transparent 100%
  );
  animation: productDataGridShimmer 1200ms linear infinite;
  animation-delay: var(--product-skeleton-animation-delay, 0ms);
  transform: translate3d(-100%, 0, 0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  pointer-events: none;
}

.skeletonLayout {
  width: 100%;
  height: 100%;
  min-height: 100%;
  flex: 1 1 auto;
}

.skeletonLayout > div {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.overlay {
  display: grid;
  gap: 10px;
  padding: 24px;
  color: #fff;
}

.overlayKicker,
.overlayMeta {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  opacity: 0.82;
}

.overlayTitle {
  font-size: clamp(1.8rem, 4vw, 3.6rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.overlayBody,
.overlayDescription {
  max-width: 48rem;
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.5;
  opacity: 0.86;
}

@keyframes productDataGridSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes productDataGridShimmer {
  100% {
    transform: translate3d(100%, 0, 0);
  }
}

@container (min-width: 37.5rem) {
  .entryGridRow,
  .pendingSkeletonItem {
    --entries-data-grid-row-min-height: max(
      var(--entries-data-grid-card-min-height),
      calc(50cqw - 0.75rem + var(--entries-data-grid-copy-min-height))
    );
  }
}

@container (min-width: 57rem) {
  .entryGridRow,
  .pendingSkeletonItem {
    --entries-data-grid-row-min-height: max(
      var(--entries-data-grid-card-min-height),
      calc(33.333cqw - 1rem + var(--entries-data-grid-copy-min-height))
    );
  }
}

@media (max-width: 560px) {
  .notice {
    align-items: flex-start;
    flex-direction: column;
  }

  .overlay {
    padding: 18px;
  }
}
`;
