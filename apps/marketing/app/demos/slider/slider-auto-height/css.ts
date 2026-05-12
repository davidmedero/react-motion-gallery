export const css = String.raw`.cell {
  width: 100cqw;
  max-width: 560px;
  display: grid;
  grid-template-rows: var(--media-height) auto;
  margin-bottom: 58px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.14);
}

.media {
  position: relative;
  min-height: 0;
  background: var(--accent);
}

.media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.body {
  min-width: 0;
  display: grid;
  gap: 15px;
  padding: 20px;
}

.headingGroup {
  min-width: 0;
  display: grid;
  gap: 9px;
}

.kicker {
  display: block;
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.2;
  text-transform: uppercase;
  overflow-wrap: break-word;
}

.title {
  margin: 0;
  color: #0f172a;
  font-size: 2rem;
  line-height: 1.1;
  letter-spacing: 0;
  overflow-wrap: break-word;
}

.copy {
  margin: 0;
  color: rgba(15, 23, 42, 0.72);
  font-size: 1rem;
  line-height: 1.45;
  overflow-wrap: break-word;
}

.footer {
  width: max-content;
  max-width: 100%;
  padding: 7px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, white);
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 750;
  line-height: 1.25;
  overflow-wrap: break-word;
}

@media (max-width: 640px) {
  .cell {
    grid-template-rows: calc(var(--media-height) - 28px) auto;
    margin-bottom: 62px;
  }

  .body {
    gap: 13px;
    padding: 16px;
  }

  .headingGroup {
    gap: 8px;
  }

  .title {
    font-size: 1.45rem;
  }

  .copy {
    font-size: 0.94rem;
  }
}
`;
