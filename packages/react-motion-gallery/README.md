# React Motion Gallery (RMG)

A flexible React gallery component with four layouts:

- **Slider** (default)
- **Grid**
- **Masonry**
- **Entries** (data-driven cards with media + overlays)

Includes optional **Fullscreen mode**, **Thumbnails**, customizable **controls**, and an imperative **GalleryApi** for programmatic control.

---

## Installation

```bash
npm i react-motion-gallery
# or
yarn add react-motion-gallery
# or
pnpm add react-motion-gallery
```

## Core rule: wrap every item in a div

RMG treats each direct child wrapper as an item.
That means every image/video must be inside a div:

```tsx
import * as React from "react";
import { Gallery } from "react-motion-gallery";

export function WrapperRuleExample() {
  return (
    <Gallery>
      <div>
        <img src="https://picsum.photos/seed/1/900/500" alt="" />
      </div>

      <div>
        <img src="https://picsum.photos/seed/2/900/500" alt="" />
      </div>
    </Gallery>
  );
}
```