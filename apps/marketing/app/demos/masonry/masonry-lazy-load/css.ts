export const css = String.raw`.masonryLazyCard {
  display: grid;
  gap: 12px;
  padding: 10px 10px 14px;
  border-radius: 22px;
  border: 1px solid rgba(125, 211, 252, 0.3);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.masonryLazyMedia {
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: #fff;
}

.masonryLazyMedia > * {
  width: 100%;
  height: 100%;
}

.masonryLazyImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.masonryLazyMeta {
  display: grid;
  gap: 5px;
  padding: 0 4px;
}

.masonryLazyBadge {
  color: rgba(21, 94, 117, 0.78);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.masonryLazyTitle {
  font-size: 1.02rem;
  letter-spacing: -0.02em;
}

.masonryLazyBody {
  margin: 0;
  color: rgba(11, 18, 32, 0.72);
  font-size: 0.92rem;
  line-height: 1.55;
}

.masonryLazySpinner {
  width: 46px;
  height: 46px;
  border-radius: 999px;
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
}

.masonryRoot {
  margin-bottom: -12px;
}

@media(min-width: 1140px) {
  .masonryRoot {
    margin-bottom: -18px;
  }
}`;
