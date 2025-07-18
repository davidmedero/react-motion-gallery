/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useEffect, ReactNode, cloneElement, Children, useState, ReactElement, HTMLAttributes, ClassAttributes, RefObject, useLayoutEffect} from "react";
import styles from './ProductImageSlider.module.css';

interface ProductImageSliderProps {
  children: ReactNode;
  imageCount: number;
  windowSize: { width: number; height: number };
  isClick: RefObject<boolean>;
  isWrapping: RefObject<boolean>;
  productImageSlides: RefObject<{ cells: { element: HTMLElement, index: number }[], target: number }[]>;
  productImageSliderRef: RefObject<HTMLDivElement | null>;
  visibleImagesRef: RefObject<number>;
  selectedIndex: RefObject<number>;
  firstCellInSlide: RefObject<HTMLElement | null>;
  sliderX: RefObject<number>;
  sliderVelocity: RefObject<number>;
}

// --- 1) Define the prop shape we'll be adding ---
type CarouselChildProps =
  HTMLAttributes<HTMLElement> &
  ClassAttributes<HTMLElement> & {
    style?: React.CSSProperties
  }

// --- 2) A helper to clone any slide with the right key, index & transform ---
function cloneSlide(
  child: ReactElement<any>,
  key: string,
  elementIndex: number,
  cells: React.RefObject<
    { element: HTMLElement; index: number }[]
  >
): ReactElement<CarouselChildProps> {
  return cloneElement<CarouselChildProps>(child, {
    key,
    ref: (el: HTMLElement | null) => {
      if (el && !cells.current.some(c => c.element === el)) {
        cells.current.push({ element: el, index: elementIndex })
      }
    },
    style: {
      ...child.props.style,
    },
  })
}

const ProductImageSlider = ({
  children,
  imageCount,
  windowSize,
  isClick,
  isWrapping,
  productImageSlides,
  productImageSliderRef,
  visibleImagesRef,
  selectedIndex,
  firstCellInSlide,
  sliderX,
  sliderVelocity
}: ProductImageSliderProps) => {
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const dragX = useRef(0);
  const previousDragX = useRef<number>(0);
  const dragStartPosition = useRef(0);
  const dragMoveTime = useRef<Date | null>(null);
  const isAnimating = useRef(false);
  const restingFrames = useRef(0);
  const sliderWidth = useRef(0);
  const isScrolling = useRef(false);
  const [clonedChildren, setClonedChildren] = useState<React.ReactElement[]>([]);
  const [visibleImages, setVisibleImages] = useState(1);
  const friction = 0.28;
  const attraction = 0.025;
  const cells = useRef<{ element: HTMLElement, index: number }[]>([]);
  const isDragSelect = useRef<boolean>(false);
  // const lastTranslateX = useRef<number>(0);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const isClosing = useRef(false);
  const sliderContainer = useRef<HTMLDivElement | null>(null);
  const hasPositioned = useRef<boolean>(false);
  const [slidesState, setSlidesState] = useState<{ cells: { element: HTMLElement }[] }[]>([]);
  const prevButtonRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    const container = productImageSliderRef.current;
    if (!container) return;

    const imgs = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
    if (imgs.length === 0) {
      return;
    }

    let loadedCount = 0;
    const total = imgs.length;

    function onImgLoad() {
      loadedCount += 1;
      if (loadedCount === total) {
        setAllImagesLoaded(true);
      }
    }

    imgs.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        // already cached & loaded
        onImgLoad();
      } else {
        img.addEventListener('load', onImgLoad);
        img.addEventListener('error', onImgLoad); // treat errors as “done” so you don’t hang
      }
    });

    return () => {
      imgs.forEach(img => {
        img.removeEventListener('load', onImgLoad);
        img.removeEventListener('error', onImgLoad);
      });
    };
  }, [clonedChildren, visibleImages]);

  useLayoutEffect(() => {
    if (!productImageSliderRef.current || cells.current.length === 0 || hasPositioned.current || sliderWidth.current === 0 || !productImageSlides.current || !productImageSlides.current[0] || !productImageSlides.current[0].cells[0]?.element) return;
    firstCellInSlide.current = productImageSlides.current[0].cells[0]?.element;
    const containerWidth = productImageSliderRef.current.clientWidth;
    if (sliderWidth.current <= productImageSliderRef.current.clientWidth) {
      sliderX.current = (containerWidth - sliderWidth.current) / 2;
      positionSlider();
    }
    hasPositioned.current = true;
  }, [slidesState]);

  const calculateVisibleImages = (): number => {
    const container = productImageSliderRef.current;
    if (!container || cells.current.length === 0) return 1;

    const cw = container.clientWidth;

    const widths = cells.current
      .filter(c => c.element)
      .map(c => c.element.getBoundingClientRect().width);

    const counts: number[] = [];
    for (let i = 0; i < widths.length; i++) {
      let sum = 0;
      let cnt = 0;
      for (let j = i; j < widths.length; j++) {
        sum += widths[j];
        if (sum <= cw) {
          cnt++;
        } else break;
      }
      counts.push(cnt);
    }

    const maxCount = counts.length ? Math.max(...counts) : 1;
    return Math.max(2, maxCount + 2);
  };

  useEffect(() => {
    if (!productImageSliderRef.current) return;
  
    const images = calculateVisibleImages();
    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;
  
    setVisibleImages(images);
    visibleImagesRef.current = images;

    if (childCount > images) {
      isWrapping.current = true;
    } else {
      isWrapping.current = false;
    }
  
    if (childCount === 0) return;

    cells.current = [];
  
    const slides: ReactElement<CarouselChildProps>[] = []
    
    // only do clones if we need infinite wrapping
    if (childCount > images) {
      // before-clones: map [-images .. -1] → real indices [childCount-images .. childCount-1]
      const before = childrenArray.slice(-images).map((c, i) =>
        cloneSlide(
          c as ReactElement<any>,
          `before-${i}`,
          -images + i,         // elementIndex
          cells
        )
      )

      // original slides: [0 .. childCount-1]
      const originals = childrenArray.map((c, i) =>
        cloneSlide(
          c as ReactElement<any>,
          `original-${i}`,
          i,              // elementIndex
          cells
        )
      )

      // after-clones: map [0 .. images-1] → real indices [childCount .. childCount+images-1]
      const after = childrenArray.slice(0, images).map((c, i) =>
        cloneSlide(
          c as ReactElement<any>,
          `after-${i}`,
          i,              // elementIndex
          cells
        )
      )

      slides.push(...before, ...originals, ...after)
    } else {
      // no wrapping needed
      slides.push(
        ...childrenArray.map((c, i) =>
          cloneSlide(
            c as ReactElement<any>,
            `original-${i}`,
            i,
            cells
          )
        )
      )
    }

    setClonedChildren(slides)

  }, [windowSize, children, allImagesLoaded, isWrapping.current]);

  useEffect(() => {
    const GAP = 60;
    const container = productImageSliderRef.current;
    if (!container || !allImagesLoaded) return;

    const slides = Array.from(container.children) as HTMLElement[];

    const widths = slides.map(slideEl => {
      const w = slideEl.getBoundingClientRect().width;
      slideEl.style.width = `${w}px`;
      return w;
    });

    const originalCount = Children.toArray(children).length;
    const clonesBefore  = originalCount > visibleImages ? visibleImages : 0;

    const beforeWidths = widths.slice(0, clonesBefore);
    
    let runningX = -(
      beforeWidths.reduce((sum, w) => sum + w, 0)
      + GAP * clonesBefore
    );

    slides.forEach((slideEl, idx) => {
      slideEl.style.transform = `translateX(${runningX}px)`;
      runningX += widths[idx] + GAP;
    });

    const clonesAfter = clonesBefore;
    const originalWidths = widths.slice(
      clonesBefore,
      widths.length - clonesAfter
    );

    const totalOriginalWidth =
      originalWidths.reduce((sum, w) => sum + w, 0) +
      GAP * (originalWidths.length);

    sliderWidth.current = totalOriginalWidth;

  }, [clonedChildren, windowSize, visibleImages, allImagesLoaded]);
  
  useEffect(() => {
    const containerEl = productImageSliderRef.current;
    if (!containerEl || !allImagesLoaded) return;

    const containerRect = containerEl.getBoundingClientRect();
    const cw            = containerRect.width;

    const allEls   = Array.from(containerEl.children) as HTMLElement[];
    const clonesOn = isWrapping.current; 
    const clonesBefore = clonesOn ? visibleImages : 0;
    const clonesAfter  = clonesOn ? visibleImages : 0;
    const originals = allEls.slice(clonesBefore, allEls.length - clonesAfter);
    const n = originals.length;
    if (n === 0) return;

    const data = originals.map(el => {
      const r = el.getBoundingClientRect();
      return {
        el,
        left:  r.left  - containerRect.left,
        right: r.right - containerRect.left
      };
    });

    const pages: { els: HTMLElement[]; target: number }[] = [];
    let i = 0;
    
    while (i < n) {
      const startLeft = data[i].left;
      const viewRight = startLeft + cw;
      let j = i;
      // add fully‐visible cells
      while (j < n && data[j].right <= viewRight) {
        j++;
      }

      if (j === i) j++;

      const slice = originals.slice(i, j);

      const isLast = j >= n;
      let target = startLeft;   
      
      if (isLast && !isWrapping.current) {
        target = sliderWidth.current - cw
      }

      if (i === 0) target = 0;

      pages.push({ els: slice, target });
      i = j;
    }

    const newSlides = pages.map(page => ({
      target: page.target,
      cells: page.els.map(el => {
        const cell = cells.current.find(c => c.element === el)!;
        return { element: el, index: cell?.index };
      }),
    }));

    productImageSlides.current = newSlides;
    setSlidesState(newSlides);

  }, [clonedChildren, windowSize, visibleImages, allImagesLoaded, isWrapping.current]);

  interface PointerEvent extends MouseEvent {
    touches?: Array<{
      clientX: number
      clientY: number
    }>
  }

  function handlePointerStart(e: PointerEvent) {
    if (!productImageSliderRef.current) return;
    isClick.current = true;
    isScrolling.current = false;
    isPointerDown.current = true;

    const translateX = productImageSliderRef.current ? getCurrentXFromTransform(productImageSliderRef.current) : 0;

    dragStartPosition.current = translateX;
    dragX.current = translateX;

    if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent && "touches" in e && e.touches.length > 0) {
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
    } else if ("clientX" in e) {
      startX.current = e.clientX;
      startY.current = e.clientY;
    }
    
    startAnimation();
  };

  function startAnimation() {
    if (isAnimating.current) return;

    isAnimating.current = true;
    restingFrames.current = 0;
    animate();
  };

  function animate() {
    if (isScrolling.current === true || isClosing.current) {
      isAnimating.current = false;
      restingFrames.current = 0;
      isClosing.current = false;
      return;
    };
    applyDragForce();
    applySelectedAttraction();

    const previousX = sliderX.current;

    integratePhysics();
    positionSlider();
    settle(previousX);

    if (isAnimating.current) requestAnimationFrame(() => animate());
  };

  function applyDragForce() {
    if (!isPointerDown.current) return;
  
    const dragVelocity = dragX.current - sliderX.current;
    const dragForce = dragVelocity - sliderVelocity.current;
    applyForce(dragForce);
  };

  function applyForce(force: number) {
    sliderVelocity.current += force;
  };

  function integratePhysics() {
    sliderX.current += sliderVelocity.current;
    sliderVelocity.current *= getFrictionFactor();
  };

  function getFrictionFactor() {
    return 1 - friction;
  }

  function positionSlider() {
    if (!productImageSliderRef.current) return;
    let currentPosition = sliderX.current;
    if (!isClick.current && isWrapping.current === true) {
      currentPosition = ((currentPosition % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
      currentPosition += -sliderWidth.current;
    }
    setTranslateX(currentPosition);
  };

  function settle(previousX: number) {
    const isResting = !isPointerDown.current && Math.abs(sliderX.current - previousX) < 0.01 && Math.abs(sliderVelocity.current) < 0.01;

    if (isResting) {
      restingFrames.current++;
    } else {
      restingFrames.current = 0;
    }

    if (restingFrames.current > 2) {
      isAnimating.current = false;
      restingFrames.current = 0;

      if (!productImageSliderRef.current) return;
      positionSlider();
    }
  };

  const SPEED = 0.1;

  useEffect(() => {
    let lastTime = performance.now();

    let frameId: number;
    function loop(now: number) {
      frameId = requestAnimationFrame(loop);

      // compute delta
      const dt = now - lastTime;
      lastTime = now;

      // pause if dragging or in fullscreen
      if (sliderWidth.current === 0 || !isWrapping.current) {
        return;
      }

      let translateX = productImageSliderRef.current ? getCurrentXFromTransform(productImageSliderRef.current) : 0;
      translateX -= SPEED * dt;
  
      let currentPosition = translateX;

      currentPosition = ((translateX % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
      currentPosition += -sliderWidth.current;
      
      setTranslateX(currentPosition);
    }

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  function setTranslateX(x: number) {
    if (!productImageSliderRef.current) return;
    const translateX = getPositionValue(x);
    productImageSliderRef.current.style.transform = `translate3d(${translateX},0,0)`;
    const pct =
      sliderWidth.current > 0
        ? Math.abs(x) / sliderWidth.current * 100
        : 0
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${pct > 99 ? 0 : pct}%`
    }
  };

  function getPositionValue(position: number) {
    return Math.round(position) + 'px';
  };

  interface PointerMoveEvent extends MouseEvent {
    touches?: Array<{
      clientX: number
      clientY: number
    }>
  }  

  function handlePointerMove(e: PointerMoveEvent) {
    if (!productImageSliderRef.current) return;
    if (!isPointerDown.current) return;
    e.preventDefault();

    previousDragX.current = dragX.current;

    let currentX: number = 0, currentY: number = 0;

    if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent && "touches" in e && e.touches.length > 0) {
      const touch = (e as TouchEvent).touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
    } else if ("clientX" in e) { 
      currentX = e.clientX;
      currentY = e.clientY;
    }

    const moveX = currentX - startX.current;
    const moveY = currentY - startY.current;

    dragX.current = dragStartPosition.current + moveX;

    if (!isWrapping.current) {
      const originBound = Math.max(0, dragStartPosition.current);

      if (dragX.current > originBound) {
        dragX.current = (dragX.current + originBound) * 0.5;
      }

      const lastSlide =  productImageSlides.current[productImageSlides.current.length - 1].target;
      const endBound = Math.min(-lastSlide, dragStartPosition.current);

      if (dragX.current < endBound) {
        dragX.current = (dragX.current + endBound) * 0.5;
      }
    }

    if (Math.abs(moveX) > 1 || Math.abs(moveY) > 1) {
      isClick.current = false;
    }

    dragMoveTime.current = new Date();
  };
  
  type PointerEndEvent = MouseEvent;

  const touchBlocked = useRef(false);

  function handlePointerEnd(e: PointerEndEvent) {
    if (!productImageSliderRef.current) return;
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    const hit = (e.target as Node);

    if (prevButtonRef.current?.contains(hit)) {
      return;
    }

    if (nextButtonRef.current?.contains(hit)) {
      return;
    }

    if (sliderWidth.current <= productImageSliderRef.current.clientWidth) {
      select(0);
    }

    let index = dragEndRestingSelect();

    if (isClick.current) {
    } else {
      if (!isWrapping.current) {
        if (index === selectedIndex.current) {
          index += dragEndBoostSelect();
        }
      } else {
        if (index === selectedIndex.current || (index === productImageSlides.current.length && selectedIndex.current === 0)) {
          index += dragEndBoostSelect();
        }
      }
    }

    isDragSelect.current = true;

    select(index);

    isDragSelect.current = false;
  };

  function dragEndBoostSelect() {
    const movedAt = dragMoveTime.current;
    if (
      !movedAt ||
      (new Date().getTime() - movedAt.getTime()) > 100
    ) {
      return 0;
    }
  
    const delta = previousDragX.current - dragX.current;

    if (delta > 0) {
      return 1;
    } else if (delta < 0) {
      return -1;
    };
    return 0;
  };

  function applySelectedAttraction() {
    if (isPointerDown.current) return;
    if (!productImageSliderRef.current) return;

    const index = selectedIndex.current >= productImageSlides.current.length - 1 && productImageSlides.current[productImageSlides.current.length - 1].target === sliderWidth.current ? 0 : selectedIndex.current;

    let distance = -productImageSlides.current[index].target - sliderX.current;

    const containerWidth = productImageSliderRef.current.clientWidth;
    const cellWidth = cells.current[0].element.clientWidth;

    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;

    const slideWidth = cellWidth * childCount;

    if (sliderWidth.current <= productImageSliderRef.current.clientWidth) {
      distance = (containerWidth - slideWidth) / 2 - sliderX.current;
    }
    const force = distance * attraction;
    applyForce(force);
  }

  function dragEndRestingSelect() {
    const restingX = getRestingPosition();

    const distance = Math.abs(getSlideDistance(-restingX, selectedIndex.current) ?? Infinity);

    const positiveResting = getClosestResting(restingX, distance, 1);
    const negativeResting = getClosestResting(restingX, distance, -1);
    
    return positiveResting.distance < negativeResting.distance ?
      positiveResting.index : negativeResting.index;
  };

  function getRestingPosition() {
    return sliderX.current + sliderVelocity.current / (1 - getFrictionFactor());
  };

  function getSlideDistance(x: number, index: number) {
    if (!productImageSliderRef.current) return 1;
    const length = productImageSlides.current[productImageSlides.current.length - 1].target === sliderWidth.current ? productImageSlides.current.length - 1 : productImageSlides.current.length;
    const slideIndex = ((index % length) + length) % length;
    const slide = productImageSlides.current[slideIndex];
    if (!slide) return null;
    let wrap = sliderWidth.current * Math.floor(index/length);
    if (sliderWidth.current <= productImageSliderRef.current.clientWidth) {
      wrap = 0;
    }

    return x - (slide.target + wrap);
  };

  function getClosestResting(restingX: number, distance: number, increment: number) {
    let index = selectedIndex.current;
    let minDistance = Infinity;
  
    while (distance < minDistance) {
      index += increment;
      minDistance = distance;
      distance = getSlideDistance(-restingX, index) ?? Infinity;
      if (distance === null) break;

      distance = Math.abs(distance);
    };
  
    return {
      distance: minDistance,
      index: index - increment,
    };
  };

  function previous() {
    isScrolling.current = false;
    select(selectedIndex.current - 1);
  };

  function next() {
    isScrolling.current = false;
    select(selectedIndex.current + 1);
  };

  function select(index: number) {
    if (!productImageSliderRef.current) return;
    if (sliderWidth.current > productImageSliderRef.current.clientWidth && isWrapping.current === true) {
      wrapSelect(index);
    }
    const containedIndex = index < 0 ? 0 : index > productImageSlides.current.length - 1 ? productImageSlides.current.length - 1 : index;
    const length = productImageSlides.current[productImageSlides.current.length - 1].target === sliderWidth.current ? productImageSlides.current.length - 1 : productImageSlides.current.length;
    index = ((index % length) + length) % length;
    const finalIndex = isWrapping.current === true ? index : containedIndex;
    selectedIndex.current = finalIndex;
    firstCellInSlide.current = productImageSlides.current[finalIndex].cells[0]?.element;
    startAnimation();
  };

  // function getTranslateX(element: HTMLElement): number {
  //   const style = window.getComputedStyle(element);
  //   const matrix = new DOMMatrix(style.transform);
  //   return matrix.m41 || 0;
  // }

  // useEffect(() => {
  //   if (!productImageSliderRef.current || !firstCellInSlide.current || cells.current.length === 0) return;
  //   lastTranslateX.current = getTranslateX(firstCellInSlide.current);
  //   const diff = lastTranslateX.current - Math.abs(sliderX.current);
  //   const containerWidth = productImageSliderRef.current.clientWidth;
  //   const cellWidth = cells.current[0].element.clientWidth;
  //   const childrenArray = Children.toArray(children);
  //   const childCount = childrenArray.length;
  //   const slideWidth = cellWidth * childCount;

  //   if (!isWrapping.current) {
  //     sliderX.current = 0;
  //     selectedIndex.current = 0;
  //     if (sliderWidth.current <= productImageSliderRef.current.clientWidth) {
  //       const currentPosition = (containerWidth - slideWidth) / 2;
  //       setTranslateX(currentPosition);
  //     } else {
  //       const currentPosition = sliderX.current;
  //       setTranslateX(currentPosition);
  //     }
      
  //   } else {
  //       sliderX.current -= diff;
  //       const currentPosition = Math.min(sliderX.current, 0);
  //       setTranslateX(currentPosition);
  //   }
    
  // }, [windowSize, clonedChildren, visibleImages]);

  function wrapSelect(index: number) {
    if (!productImageSliderRef.current) return;

    const length = productImageSlides.current[productImageSlides.current.length - 1].target === sliderWidth.current ? productImageSlides.current.length - 1 : productImageSlides.current.length;
    const slideableWidth = sliderWidth.current;
    const selectedIdx = selectedIndex.current;

    if (!isDragSelect.current) {
      const wrapIndex = ((index % length) + length) % length;

      const delta = Math.abs(wrapIndex - selectedIdx);
      const backWrapDelta = Math.abs((wrapIndex + length) - selectedIdx);
      const forwardWrapDelta = Math.abs((wrapIndex - length) - selectedIdx);

      if (backWrapDelta < delta) {
          index += length;
      } else if (forwardWrapDelta < delta) {
          index -= length;
      }
    }

    if (index < 0) {
      sliderX.current -= slideableWidth;
    } else if (index >= length) {
      sliderX.current += slideableWidth;
    }
  }

  interface SliderElement extends HTMLDivElement {
    style: CSSStyleDeclaration;
  }

  function getCurrentXFromTransform(slider: SliderElement): number {
    const computedStyle = window.getComputedStyle(slider);
    const transform = computedStyle.transform;
    if (!transform || transform === 'none') return 0;

    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (!matrixMatch) return 0;

    const matrixValues = matrixMatch[1].split(',').map(parseFloat);
    const tx = matrixValues[4];

    return tx;
  }

  interface WheelEvent extends Event {
    deltaX: number;
    deltaY: number;
  }

  function handleWheel(e: WheelEvent) {
    if (!productImageSliderRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      const page = document.getElementById('page_container') as HTMLDivElement;
      page.scrollTop += e.deltaY;
      return;
    }
    if (sliderWidth.current <= productImageSliderRef.current.clientWidth) {
      return;
    }
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);

    if (isHorizontalScroll) {
      isScrolling.current = true;
      e.preventDefault();
  
      let translateX = getCurrentXFromTransform(productImageSliderRef.current);
      translateX -= e.deltaX;
  
      let currentPosition = translateX;

      if (isWrapping.current === true) {
        currentPosition = ((translateX % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
        currentPosition += -sliderWidth.current;
      } else {
        const containerWidth = productImageSliderRef.current.clientWidth;
        const contentWidth   = productImageSliderRef.current.scrollWidth;
      
        const maxTranslateX = 0;

        const minTranslateX = containerWidth - contentWidth;
      
        currentPosition = Math.max(minTranslateX, Math.min(maxTranslateX, translateX));
      }
      
      setTranslateX(currentPosition);
  
      const index = Math.round(Math.abs(currentPosition) / (sliderWidth.current / productImageSlides.current.length));
      selectedIndex.current = index;
      sliderX.current = currentPosition;
      firstCellInSlide.current = productImageSlides.current[index].cells[0]?.element;
    } else {
      isScrolling.current = false;
    }
  };

  useEffect(() => {
    const sliderRef = productImageSliderRef.current;
    const sliderContainerRef = sliderContainer.current;
  
    if (sliderRef && sliderContainerRef) {
      sliderContainerRef.addEventListener("pointerdown", handlePointerStart);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", (e) => handlePointerEnd(e));
      sliderContainerRef.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        sliderContainerRef.removeEventListener("pointerdown", handlePointerStart);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerEnd);
        sliderContainerRef.removeEventListener("wheel", handleWheel);
      };
    };
  }, [handlePointerStart, handlePointerMove, handlePointerEnd, handleWheel, productImageSliderRef.current, isScrolling.current]);

  const Arrow = ({ direction, size = 32 }: { direction: "prev" | "next"; size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {direction === "prev" ? (
        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
      ) : (
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      )}
    </svg>
  );

  const VERT_ANGLE_MIN =  60;
  const VERT_ANGLE_MAX = 120;

  function onTouchStart(e: TouchEvent) {
    if (touchBlocked.current) {
      const page = document.getElementById('page_container') as HTMLDivElement;
      if (page) {
        page.style.overflowY = 'hidden';
      }
      return;
    }
    if (e.touches.length !== 1) return;
    const page = document.getElementById('page_container') as HTMLDivElement;
    if (page) {
      page.style.overflowY = 'auto';
    }
    const t0 = e.touches[0];
    startX.current = t0.clientX;
    startY.current = t0.clientY;
  }

  function onTouchMove(e: TouchEvent) {
    if (touchBlocked.current) {
      const page = document.getElementById('page_container') as HTMLDivElement;
      if (page) {
        page.style.overflowY = 'hidden';
      }
      return;
    }
    if (e.touches.length !== 1) return;    
    const t0 = e.touches[0];
    const dx = t0.clientX - startX.current;
    const dy = t0.clientY - startY.current;

    const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
      // vertical if within [60°,120°]
    const isVerticalScroll = angle >= VERT_ANGLE_MIN && angle <= VERT_ANGLE_MAX;

    if (isVerticalScroll) {
      // vertical → handle scroll
      const page = document.getElementById('page_container') as HTMLDivElement;
      if (page) {
        page.style.overflowY = 'auto';
      }

    } else {
      // horizontal → let your slider logic run (no preventDefault)
      e.preventDefault();
      const page = document.getElementById('page_container') as HTMLDivElement;
      if (page) {
        page.style.overflowY = 'hidden';
      }
    }
  }

  function onTouchEnd() {
    if (touchBlocked.current) {
      const page = document.getElementById('page_container') as HTMLDivElement;
      if (page) {
        page.style.overflowY = 'hidden';
      }
      return;
    }
    const page = document.getElementById('page_container') as HTMLDivElement;
    if (page) {
      page.style.overflowY = 'auto';
    }
  }

  useEffect(() => {
    const sliderContainerRef = sliderContainer.current!;
    sliderContainerRef.addEventListener('touchstart', onTouchStart, { passive: false })
    sliderContainerRef.addEventListener('touchmove',  onTouchMove,  { passive: false })
    sliderContainerRef.addEventListener('touchend',   onTouchEnd)
    sliderContainerRef.addEventListener('touchcancel',onTouchEnd)
    return () => {
      sliderContainerRef.removeEventListener('touchstart', onTouchStart)
      sliderContainerRef.removeEventListener('touchmove',  onTouchMove)
      sliderContainerRef.removeEventListener('touchend',   onTouchEnd)
      sliderContainerRef.removeEventListener('touchcancel',onTouchEnd)
    }
  }, []);
  

  return (
    <div ref={sliderContainer} className={styles.slider_container} style={{ position: 'relative', height: '120px', zIndex: 1 }}>
    {/* Previous Button */}
    <div
      onClick={() => previous()}
      ref={prevButtonRef}
      style={{
        position: "absolute",
        display:
          imageCount > 1 && productImageSliderRef.current && sliderWidth.current > productImageSliderRef.current.clientWidth
            ? "flex"
            : "none",
        left: 10,
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
        borderRadius: "100%",
        zIndex: 2,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <Arrow direction="prev" size={32} />
    </div>

    <div
      onClick={() => next()}
      ref={nextButtonRef}
      style={{
        position: "absolute",
        display:
          imageCount > 1 && productImageSliderRef.current && sliderWidth.current > productImageSliderRef.current.clientWidth
            ? "flex"
            : "none",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
        borderRadius: "100%",
        zIndex: 2,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <Arrow direction="next" size={32} />
    </div>
      {/* Slider */}
      <div 
        ref={productImageSliderRef}
        style={{ 
          overflow: "visible",
          position: 'absolute',
          left: 0,
          width: '100%',
          height: '100%',
          willChange: 'opacity'
        }}
      >
        {clonedChildren}
      </div>
      {/* progress track */}
      <div
        style={{
          position: 'absolute',
          display: imageCount > 2 ? 'block' : 'none',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '6px',
          backgroundColor: 'grey.300',
        }}
      >
        {/* progress fill */}
        <span
          ref={progressFillRef}
          style={{
            display: 'block',
            height: '100%',
            width: '0%',
            backgroundColor: '#2d2a26',
            transition: 'width 0.2s ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default ProductImageSlider;