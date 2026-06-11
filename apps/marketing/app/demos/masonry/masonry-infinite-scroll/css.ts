export const css = String.raw`.shell {
  --product-demo-ink: rgb(var(--rmg-logo-shadow-rgb));
  --product-demo-muted: rgba(var(--rmg-logo-shadow-rgb), 0.66);
  --product-demo-line: rgba(var(--rmg-logo-blue-rgb), 0.22);
  --product-demo-line-strong: rgba(var(--rmg-logo-blue-rgb), 0.38);
  --product-demo-surface: #ffffff;
  --product-demo-accent: rgb(var(--rmg-logo-blue-rgb));
  --product-demo-accent-deep: #2458a8;
  --product-demo-cyan: rgb(var(--rmg-logo-cyan-rgb));
  display: grid;
  gap: 18px;
  width: 100%;
}
.toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--product-demo-line);
  border-radius: 8px;
  background:
    linear-gradient(
      135deg,
      rgba(var(--rmg-logo-cyan-rgb), 0.12),
      rgba(var(--rmg-logo-blue-rgb), 0.08)
    ),
    var(--product-demo-surface);
}
.status {
  display: flex;
  justify-content: flex-start;
  color: var(--product-demo-muted);
  font-size: 0.86rem;
}
.status button {
  min-height: 34px;
  border: 1px solid var(--product-demo-line-strong);
  border-radius: 7px;
  background: #ffffff;
  color: var(--product-demo-accent-deep);
  font: inherit;
  font-weight: 700;
}
.error {
  margin: 0;
  padding: 14px;
  border: 1px solid #f2b8a0;
  border-radius: 8px;
  background: #fff4ef;
  color: #953516;
}
.masonryRoot {
  min-height: 520px;
}
.card {
  --product-image-aspect-ratio: 1 / 1;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 100%;
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
  box-shadow:
    0 14px 30px rgba(var(--rmg-logo-shadow-rgb), 0.07),
    0 8px 22px rgba(var(--rmg-logo-cyan-rgb), 0.09);
}
.masonryCard {
  height: 100%;
}
.skeletonCard {
  --product-image-aspect-ratio: 1 / 1;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 100%;
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
  box-shadow:
    0 14px 30px rgba(var(--rmg-logo-shadow-rgb), 0.07),
    0 8px 22px rgba(var(--rmg-logo-cyan-rgb), 0.09);
}
.skeletonMasonryCard {
  height: 100%;
}
.skeletonCard > :global([data-rmg-skel-node]) {
  height: 100%;
  min-height: 100%;
}
.skeletonCard.skeletonSpacerCard {
  box-shadow: none;
}
.skeletonCard.skeletonSpacerCard::after {
  animation: none;
  opacity: 0;
  will-change: auto;
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
  animation: productDataSkeletonShimmer 1200ms linear infinite;
  transform: translateX(-100%);
  will-change: transform, opacity;
  backface-visibility: hidden;
  pointer-events: none;
}
.imageFrame {
  position: relative;
  flex: 0 0 auto;
  aspect-ratio: var(--product-image-aspect-ratio);
  overflow: hidden;
  background: #f6f8f8;
}
.image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
.copy {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  min-height: 194px;
  padding: 14px 14px 22px;
}
.category {
  color: var(--product-demo-accent-deep);
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: capitalize;
}
.card h3 {
  margin: 0;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--product-demo-ink);
  font-size: 1rem;
  line-height: 1.25;
}
.rating {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  color: var(--product-demo-muted);
  font-size: 0.88rem;
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
  font-size: 1.14rem;
  font-weight: 800;
  line-height: 1.1;
}
.stockBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 9px;
  border: 1px solid var(--product-demo-line);
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}
.stockDot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: currentColor;
}
.stockLow {
  border-color: rgba(var(--rmg-logo-lavender-rgb), 0.36);
  background: rgba(var(--rmg-logo-lavender-rgb), 0.1);
  color: #5f4788;
}
.stockMedium {
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.36);
  background: rgba(var(--rmg-logo-blue-rgb), 0.1);
  color: #35568f;
}
.stockHigh {
  border-color: rgba(var(--rmg-logo-cyan-rgb), 0.42);
  background: rgba(var(--rmg-logo-cyan-rgb), 0.12);
  color: #116a91;
}
.actionButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 28px);
  min-height: 40px;
  margin: auto 14px 14px;
  padding: 0 14px;
  border: 1px solid rgba(var(--rmg-logo-blue-rgb), 0.62);
  border-radius: 8px;
  border-color: rgba(var(--rmg-logo-blue-rgb), 0.72);
  background: var(--rmg-logo-sky);
  box-shadow: 0 10px 20px rgba(var(--rmg-logo-blue-rgb), 0.2);
  color: #ffffff;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}
.actionButton:hover {
  border-color: rgba(var(--rmg-logo-cyan-rgb), 0.72);
  background: color-mix(
    in srgb,
    var(--rmg-logo-sky) 88%,
    var(--rmg-logo-shadow)
  );
  box-shadow: 0 12px 24px rgba(var(--rmg-logo-blue-rgb), 0.24);
}
.actionButton:focus-visible {
  outline: 3px solid rgba(var(--rmg-logo-cyan-rgb), 0.26);
  outline-offset: 2px;
}

.sentinel {
  display: grid;
  place-items: center;
  min-height: 48px;
  margin-top: 6px;
  color: var(--product-demo-accent-deep);
  font-size: 0.88rem;
  font-weight: 800;
}
@keyframes productDataSkeletonShimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .skeletonCard::after {
    animation: none;
    opacity: 0;
    will-change: auto;
  }
}
@media (max-width: 760px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
  .virtualizationMeter {
    align-items: flex-start;
    flex-direction: column;
  }
  .status,
  .pageButtons {
    justify-content: flex-start;
  }
  .primaryButton {
    justify-self: start;
  }
}
.masonryItem {
  overflow: visible;
}
.placeholderItem {
  pointer-events: none;
}
`;
