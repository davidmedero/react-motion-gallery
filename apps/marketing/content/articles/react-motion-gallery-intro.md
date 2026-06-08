React Motion Gallery is a collection of primitives for complex layouts, modals, pointer/touch events, motion and data patterns – a library engineered around two principles: fluid animations and zero layout shift.

It all began in the year 2022 with my first side project, an e-commerce template for Next.js.

I noticed the bar was set extremely low in terms of UX for e-com sites, even the most profitable ones. So, I took it upon myself to change that, and give developers the tools to make sites fast, smooth, stable and user-friendly. 

This was also my first time really tinkering with npm libraries. I wasn't completely satisfied with a single one though. There was always something missing or an existing feature I couldn't change unless I forked the library and modified it which is not exactly maintainable. It would haunt me and trigger my OCD.

In the midst of my neuroticism, I became obsessed with carousels since this is an integral component to any good e-com site. I studied their source code, tried them all and even made a few of my own from scratch. However, I didn't want to reinvent the wheel, so I had to pick one that was already well-established and tested by thousands of developers. One library was very popular with a super rich API, but the slide animations were choppy as hell. Another was very smooth, but lacked features and the smoothness was limited to a fixed 60 fps. This other library had a carousel + lightbox combo which is what I needed, but still lacked features and wasn't exactly the smoothest one either. My perfectionism was clearly getting the better of me. Luckily, I found the one with the best animation engine. It uses alpha interpolation which guarantees consistent speeds across all devices and refresh rates. So, I made a heavily modded version of that library, but in React. This carousel and the lightbox I subsequently built around it is what laid the foundation for React Motion Gallery.

As I continued to build the template, it became clear to me that the most difficult and time-consuming parts of development were these components that involved complex layouts and animations, and then keeping them stable from server to client. So, I shifted my focus from websites to components, and completely dedicated myself to solving these tiny front-end issues that end up compounding and inevitably make sites feel and look cheap.

The carousel + lightbox combo was only the beginning. I started thinking in terms of building blocks and primitives. I had to make an API that was both easy to use and feature-rich, yet modular and lightweight. It was initially monolithic, then through countless refactors and iterations evolved into a feature-based architecture so you only import what you need. 

The product pages from e-commerce sites are what inspired the development of the carousel + thumbnails + lightbox components. The category/collection pages that display product cards inspired the Grid component. Masonry felt like a natural extension and works for both home pages and category pages. Customer reviews inspired the Entries component. It's record-based: each entry can hold multiple media items — images, videos, whatever — and you decide whether that media renders as a slider, grid, or masonry block.

But the components are only half the story. A grid full of product cards is useless if it janks while the images load, or if everything jumps around the moment data comes back from the server. That's where the rest of the library comes in.

Skeletons were my answer to layout shift. On most e-com sites you watch the page assemble itself in real time — images snap in, prices appear, and the whole layout nudges a few pixels every time something settles. Skeletons reserve that space up front, so the layout is locked from the first paint. Nothing moves; it just fades in smoothly.

Reveal handles the other principle: motion. Instead of product cards blinking into existence, they ease in as they scroll into view. It's a small touch, but it's the difference between a page that feels alive and one that feels like a spreadsheet.

And then there's the question every category page eventually has to answer: how do you actually load hundreds or thousands of products? That's why pagination, infinite scroll, load-more, and virtualization all ship as first-class data patterns. Pagination and load-more give you control and predictability, infinite scroll gives you that endless browse-y feel, and virtualization keeps everything fast by only rendering what's on screen — so a 10,000-product collection scrolls just as smoothly as a 10-product one.

Enough backstory — here's the default slider demo in full. It's a good snapshot of how the pieces fit together:

```tsx
"use client";

import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import { sliderArrows } from "react-motion-gallery/slider/arrows";
import { sliderDots } from "react-motion-gallery/slider/dots";
import { sliderRipple } from "react-motion-gallery/slider/ripple";
import styles from "./slider-default-demo.module.css";

const URLS = [
  "https://picsum.photos/id/10/1600/900",
  "https://picsum.photos/id/11/1600/900",
  "https://picsum.photos/id/12/1600/900",
  "https://picsum.photos/id/13/1600/900",
  "https://picsum.photos/id/14/1600/900",
  "https://picsum.photos/id/15/1600/900",
];

const FS_URLS = [
  "https://picsum.photos/id/10/2400/1350",
  "https://picsum.photos/id/11/2400/1350",
  "https://picsum.photos/id/12/2400/1350",
  "https://picsum.photos/id/13/2400/1350",
  "https://picsum.photos/id/14/2400/1350",
  "https://picsum.photos/id/15/2400/1350",
];

function Slide({ src, i }: { src: string; i: number }) {
  return <img src={src} alt={`Slide ${i + 1}`} className={styles.slide} />;
}

function FullscreenAddon() {
  const { fullscreenNode } = useFullscreenController({
    plugins: [fullscreenSlider(), fullscreenZoomPan()],
    fullscreen: {
      enabled: true,
      slider: {
        gap: {
          0: 40,
          768: 60,
        },
      },
    },
  });

  return <>{fullscreenNode}</>;
}

export function SliderDefaultDemo() {
  const media = toMediaItems(URLS);
  const fullscreenMedia = toMediaItems(FS_URLS);

  const { ref: sliderRef, ready: sliderReady } = useSliderReady();

  return (
    <GalleryCore layout="slider" fullscreenItems={fullscreenMedia}>
      <SliderSkeleton
        layout={{
          visibleCount: 2,
          mode: "peek",
          layout: {
            kind: "slider",
            direction: "row",
            style: {
              gap: 20,
            },
            item: {
              kind: "rect",
              style: {
                width: "100cqw",
                maxWidth: "550px",
                aspectRatio: "16 / 9",
                borderRadius: 12,
              },
            },
          },
        }}
        ready={sliderReady}
      >
        <Slider
          ref={sliderRef}
          reveal={{
            staggerMs: 160,
          }}
          plugins={[
            sliderFullscreen(),
            sliderRipple(),
            sliderArrows(),
            sliderDots(),
          ]}
        >
          {media.map((item, i) => (
            <Slide
              key={`img-${item.kind === "image" ? item.src : ""}-${i}`}
              src={item.kind === "image" ? item.src : ""}
              i={i}
            />
          ))}
        </Slider>
      </SliderSkeleton>
      <FullscreenAddon />
    </GalleryCore>
  );
}
```

Look at how it reads top to bottom — it's basically this whole article in code. `GalleryCore` coordinates fullscreen state, `SliderSkeleton` holds the exact layout until the images decode (zero layout shift), `reveal` staggers the slides in as they appear (motion), and every extra — arrows, dots, ripple, fullscreen, zoom/pan — is a plugin you opt into. Nothing you don't use ends up in your bundle.

So that's the story. If you've made it this far, the best thing you can do is go try it. Better yet, try to break it — throw weird data at it, resize the window mid-drag, hammer the buttons, scroll it on a slow phone. If anything feels off or janky, I genuinely want to hear about it. I built this library because these tiny details matter to me, and I plan on improving and developing it for as long as I'm able — every piece of feedback helps shape where it goes next.

- [Live demos](https://react-motion-gallery.com/demos)
- [Docs](https://react-motion-gallery.com/docs)
- [GitHub](https://github.com/davidmedero/react-motion-gallery)
- [npm](https://www.npmjs.com/package/react-motion-gallery)
- [Feedback & bug reports](https://github.com/davidmedero/react-motion-gallery/issues)