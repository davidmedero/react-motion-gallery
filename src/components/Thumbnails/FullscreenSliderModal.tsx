/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { Dispatch, RefObject, SetStateAction, useEffect } from "react";
import scaleStore from './scaleStore';

interface FullscreenSliderModalProps {
  open: boolean;
  onClose: () => void;
  isZoomClick: RefObject<boolean>;
  isClick: RefObject<boolean>;
  isAnimating: RefObject<boolean>;
  overlayDivRef: RefObject<HTMLDivElement | null>;
  zoomLevel: number;
  children: React.ReactNode;
  cells: RefObject<{ element: HTMLElement; index: number }[]>;
  fullscreenPosition: DOMRect;
  setShowFullscreenSlider: Dispatch<SetStateAction<boolean>>;
  imageCount: number;
  fullscreenImageWidth: RefObject<number>;
  setClosingModal: Dispatch<SetStateAction<boolean>>;
}

const FullscreenSliderModal: React.FC<FullscreenSliderModalProps> = ({
  open,
  onClose,
  isZoomClick,
  isClick,
  isAnimating,
  overlayDivRef,
  zoomLevel,
  cells,
  fullscreenPosition,
  setShowFullscreenSlider,
  imageCount,
  fullscreenImageWidth,
  setClosingModal,
  children,
}) => {  

  const pointerDownX = React.useRef<number>(0);
  const pointerDownY = React.useRef<number>(0);

  useEffect(() => {
    const closeButton = document.querySelector(".close-button");
    closeButton?.addEventListener("click", handleClose);
  
    return () => {
      closeButton?.removeEventListener("click", handleClose);
    };
  }, [open, zoomLevel, isZoomClick, children]);

  if (!open) return null;

  function handleClose(e: any) {
    if ((e.target as HTMLElement).closest(".close-button")) {
      console.log("Close button clicked; closing modal immediately.");
      proceedToClose(e);
      return;
    }
  
    const THRESHOLD = 1;
    if (
      Math.abs(e.clientX - pointerDownX.current) > THRESHOLD ||
      Math.abs(e.clientY - pointerDownY.current) > THRESHOLD
    ) {
      console.log("Drag detected; not closing modal.");
      return;
    }

    const clickedImg = (e.target as HTMLElement).closest("img");
    if (clickedImg) {
      console.log("Clicked directly on an image; not closing modal.");
      return;
    }

    proceedToClose(e);
  }
  
  function proceedToClose(e: MouseEvent) {
    isAnimating.current = false;
    isClick.current = false;
    cells.current = [];
    setClosingModal(true);
  
    const x = e.clientX;
    const y = e.clientY;
  
    const overlay = e.currentTarget as HTMLElement;
    overlay.style.pointerEvents = "none";
    const underlyingElement = document.elementFromPoint(x, y);
    overlay.style.pointerEvents = "";
  
    let targetImg: HTMLImageElement | null = null;
    if (underlyingElement) {
      if (underlyingElement.tagName.toLowerCase() === "img") {
        targetImg = underlyingElement as HTMLImageElement;
      } else {
        targetImg = underlyingElement.querySelector("img");
      }
    }

    if (imageCount > 1) {
      const counter = document.querySelector('.counter');
      const currentIndex = parseInt(targetImg?.getAttribute("data-index") || "-1", 10);
      const nextImg = document.querySelector(`.fullscreen_slider img[data-index="${Number(counter?.textContent?.split('/')[0])}"]`) as HTMLImageElement | null;

      const slider = document.querySelector('.fullscreen_slider') as HTMLElement;
      let currentTranslateX = 0;
      if (!slider) throw new Error('no .fullscreen_slider found')

      // 2. read the computed transform
      const cs = getComputedStyle(slider)
      const transform = cs.transform  // e.g. "matrix(a, b, c, d, tx, ty)"

      // 3. bail if there's no transform
      if (transform === 'none') {
        console.log('no translation:', 0)
      } else {
        // 4. parse with DOMMatrix
        const matrix = new DOMMatrixReadOnly(transform)
        const translateX = matrix.m41   // the X offset
        currentTranslateX = translateX;
      }

      if (currentIndex !== Number(counter?.textContent?.split('/')[0]) ) {
        if (currentIndex === 0 && (Math.abs(currentTranslateX) >= slider.scrollWidth - slider.getBoundingClientRect().width * 1.5 && Math.abs(currentTranslateX) <= slider.scrollWidth - slider.getBoundingClientRect().width) && React.isValidElement<{ imageCount: number }>(children)) {
          const { imageCount } = children.props
          targetImg = document.querySelector(`.fullscreen_slider img[data-index="${imageCount + 1}"]`) as HTMLImageElement | null;
        } else {
          targetImg = nextImg;
        }
      }

      if (React.isValidElement<{ imageCount: number }>(children)) {
        const { imageCount } = children.props
    
        if (currentIndex === imageCount && Number(counter!.textContent!.split('/')[0]) === 1) {
          const actualImg = document.querySelector(
            `.fullscreen_slider img[data-index="${imageCount + 1}"]`
          ) as HTMLImageElement | null
          targetImg = actualImg
        }
    
        if (currentIndex === imageCount + 1) {
          const actualImg = document.querySelector(
            `.fullscreen_slider img[data-index="${imageCount + 1}"]`
          ) as HTMLImageElement | null
          targetImg = actualImg
        }
      }

      // Get all div elements inside the slider
      const divs = slider.querySelectorAll('div');

      // Loop through each div
      divs.forEach(div => {
        // If this div contains the target image, skip it
        if (targetImg && div.contains(targetImg)) return;

        // Otherwise, apply a 0.3s opacity transition and set the opacity to 0
        Object.assign(div.style, {
          transition: 'opacity 0.3s cubic-bezier(.4,0,.22,1)',
          opacity: '0'
        });
      });
    }
  
    if (!targetImg || !overlayDivRef.current || !fullscreenPosition) return;
  
    const zoomedImg = targetImg;
    const zoomedRect = targetImg.getBoundingClientRect();

    const computedStyle = window.getComputedStyle(zoomedImg);
    const transformMatrix = new DOMMatrix(computedStyle.transform);
    const currentScale = transformMatrix.a;
    const translateX = transformMatrix.e;
    const translateY = transformMatrix.f;
  
    let deltaX: number = 0;
    let deltaY: number = 0;

    const scaledWidth = fullscreenImageWidth.current * currentScale;
    const windowOffset = window.innerWidth > scaledWidth ? window.innerWidth - scaledWidth : 0;
  
    deltaX =
      currentScale !== 1
        ? fullscreenPosition.left - (Math.abs(translateX) + zoomedRect.left + windowOffset)
        : fullscreenPosition.left - zoomedRect.left;
  
    deltaY =
      currentScale !== 1
        ? fullscreenPosition.top - (Math.abs(translateY) + zoomedRect.top)
        : fullscreenPosition.top - zoomedRect.top;
  
    const scaleX = fullscreenPosition.width / (zoomedRect.width / currentScale);

    const elementsToFade = [".left-chevron", ".right-chevron", ".counter", ".close-button"];
  
    requestAnimationFrame(() => {
      zoomedImg.style.transformOrigin = "0 0";
      zoomedImg.style.transition = "transform 0.3s cubic-bezier(.4,0,.22,1)";
    
      zoomedImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX})`;
    
      if (overlayDivRef.current) {
        overlayDivRef.current.style.backgroundColor = "transparent";
      }

      elementsToFade.forEach((selector) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) element.style.opacity = "0";
      });
    });
  
    setTimeout(() => {
      zoomedImg.style.transition = "";
      zoomedImg.style.transform = "";
  
      elementsToFade.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) document.body.removeChild(element);
      });

      const slider = document.querySelector('.fullscreen_slider') as HTMLElement;
      if (slider) {
        slider.style.opacity = '0';
      };
  
      if (overlayDivRef.current) document.body.removeChild(overlayDivRef.current);
      onClose();
      setShowFullscreenSlider(false);
      setClosingModal(false);
      scaleStore.setScale(1);
      zoomedImg.style.height = "100%";
    }, 300);
  }  

  return (
    <div
      onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
        pointerDownX.current = e.clientX;
        pointerDownY.current = e.clientY;
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        contain: 'layout style size',
        touchAction: 'none'
      }}
    >
      {children}
    </div>
  );
};

export default FullscreenSliderModal;