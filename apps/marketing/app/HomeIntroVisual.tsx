"use client";

import Image from "next/image";
import { useImageDecodeReady } from "react-motion-gallery/media/ready";
import { Reveal } from "react-motion-gallery/reveal";

const HOME_INTRO_IMAGE_SRC =
  "https://cdn.react-motion-gallery.com/nav/rmg-icon-v5.png";

export function HomeIntroVisual() {
  const image = useImageDecodeReady({
    src: HOME_INTRO_IMAGE_SRC,
    timeoutMs: 7000,
  });

  return (
    <Reveal
      as="div"
      className="home-intro__visual"
      aria-hidden
      ready={image.ready}
      transform={{ y: 18, scale: 0.96, rotate: 1.2 }}
      delayMs={120}
      durationMs={{
        opacity: 1000,
        transform: 660,
      }}
    >
      <Image
        className="home-intro__visualImage"
        src={HOME_INTRO_IMAGE_SRC}
        alt=""
        fill
        priority
        unoptimized
        sizes="(max-width: 640px) 70vw, (max-width: 920px) 34vw, 360px"
      />
    </Reveal>
  );
}
