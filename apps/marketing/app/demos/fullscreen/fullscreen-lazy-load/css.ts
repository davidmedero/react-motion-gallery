export const css = String.raw`.shell {
  width: min(100%, 720px);
  margin-inline: auto;
  display: grid;
  justify-items: start;
  gap: 18px;
  padding-block: 18px;
}

.copy {
  display: grid;
  gap: 10px;
}

.kicker {
  color: #155e75;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.explainer {
  margin: 0;
  max-width: 64ch;
  color: rgba(15, 23, 42, 0.74);
  font-size: 1rem;
  line-height: 1.65;
}

.button {
  appearance: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: #0f172a;
  color: #f8fafc;
  cursor: pointer;
  font: inherit;
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1;
  padding: 12px 18px;
  transition:
    background-color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
}

.button:hover {
  background: #164e63;
  transform: translateY(-1px);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.2);
}

.button:focus-visible {
  outline: 3px solid rgba(20, 184, 166, 0.42);
  outline-offset: 3px;
}

.spinner {
  border-top-color: #67e8f9;
}
`;
