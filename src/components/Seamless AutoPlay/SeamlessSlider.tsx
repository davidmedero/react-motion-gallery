/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from "react";
import ProductImageSlider from "./ProductImageSlider";
import styles from './SeamlessSlider.module.css';

interface Props {
  urls: string[];
}

export default function SeamlessSlider({ urls }: Props) {
  const isClick = useRef(false);

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isWrapping = useRef(false);
  const productImageSlides = useRef<{ cells: { element: HTMLElement, index: number }[], target: number }[]>([]);
  const productImageSliderRef = useRef<HTMLDivElement | null>(null);
  const visibleImagesRef = useRef(0);
  const selectedIndex = useRef(0);
  const firstCellInSlide = useRef<HTMLElement | null>(null);
  const sliderX = useRef(0);
  const sliderVelocity = useRef(0);

  return (
    <>
      <div className={styles.container}>
        <ProductImageSlider imageCount={urls.length} windowSize={windowSize} isClick={isClick} isWrapping={isWrapping} productImageSlides={productImageSlides} productImageSliderRef={productImageSliderRef} visibleImagesRef={visibleImagesRef} selectedIndex={selectedIndex} firstCellInSlide={firstCellInSlide} sliderX={sliderX} sliderVelocity={sliderVelocity}>
          {
            urls.map((url, index) => {

              return (
                <img
                    key={index}
                    src={url}
                    className={styles.image}
                    alt={`Low-Res ${index}`}
                    draggable="false"
                  />
              )
            })
          }
        </ProductImageSlider>
      </div>
    </>
  );
}