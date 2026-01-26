// This file runs in the OUTER Storybook UI (manager), not the preview iframe.
const style = document.createElement("style");
style.textContent = `
  html, body {
    overscroll-behavior-x: none !important;
  }

  /* Storybook manager roots/containers */
  #storybook-manager-root, #root {
    overscroll-behavior-x: none !important;
  }

  /* The preview iframe element exists on the manager page */
  #storybook-preview-iframe {
    overscroll-behavior-x: none !important;
  }
`;
document.head.appendChild(style);