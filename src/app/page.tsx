export const dynamic    = 'force-static';
export const fetchCache = 'force-cache';

import FixedHeightSlider from "@/components/FixedHeight/FixedHeightSlider";
import styles from "./page.module.css";
import ThumbnailSlider from "@/components/Thumbnails/ThumbnailSlider";
import ResponsiveSlider from "@/components/Responsive/ResponsiveSlider";
import HeroSlider from "@/components/Hero/HeroSlider";
import SeamlessSlider from "@/components/Seamless AutoPlay/SeamlessSlider";
import PerSlideAutoPlaySlider from "@/components/Per Slide AutoPlay/PerSlideAutoPlaySlider";

export default function Home() {

  const images: string[] = [
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/standard/thumbnail-slider-image-1.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/standard/thumbnail-slider-image-2.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/standard/thumbnail-slider-image-3.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/standard/thumbnail-slider-image-4.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/standard/thumbnail-slider-image-5.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/standard/thumbnail-slider-image-6.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/standard/thumbnail-slider-image-7.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/standard/thumbnail-slider-image-8.jpg'
  ];

  const heroImages: string[] = [
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/ds/rmg-ds-image-1.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/ds/rmg-ds-image-2.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/ds/rmg-ds-image-3.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/ds/rmg-ds-image-4.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/ds/rmg-ds-image-5.jpg'
  ];

  const logoImages = [
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/adobe.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/canva.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/github.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/google.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/hubspot.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/instagram.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/microsoft.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/slack.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/spotify.png',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/seamless/stripe.png',
  ];

  return (
    <div className={styles.page} id='page_container'>
      <h1 className={styles.title}>React Motion Gallery</h1>
      <p className={styles.subtitle}>
        Tap or click on the image to toggle fullscreen mode. Tap, click or pinch-zoom on the fullscreen image to zoom in and out. On laptops, you can also zoom in by 1: holding ctrl and scrolling on the touchpad vertically and 2: pinch-zooming on the touchpad. Image panning can be done via mouse, touch, pointer and wheel gestures. Sliders can be dragged via mouse, touch, pointer and wheel gestures (which are wrapped for infinite looping). In fullscreen mode, you can close the fullscreen modal by swiping the image vertically if the image is completely zoomed out.
      </p>

      {/** Thumbnails Section **/}
      
        <h2 className={styles.headers}>Thumbnails</h2>
        <p className={styles.description}>
          Resize the browser to 500px to see the horizontal thumbnail scrollbar. One image is equal to one slide.
        </p>
        <div className={styles.sliderContainer}>
          <ThumbnailSlider urls={images} />
        </div>
      

      {/** Fixed Height Section **/}
      
        <h2 className={styles.headers}>Fixed Height</h2>
        <p className={styles.description}>
          Height of all images is fixed, and the slider container height is fixed. Wrapping disabled if there are 2 images or less.
        </p>
        <div className={styles.sliderContainer}>
          <FixedHeightSlider urls={heroImages} />
        </div>
      

      {/** Responsive Section **/}
      
        <h2 className={styles.headers}>Responsive</h2>
        <p className={styles.description}>
          Column-based layout guaranteeing a full image per slide. Adjust `maxWidth` in <code>calculateImagesPerSlide</code>.
        </p>
        <div className={styles.sliderContainer}>
          <ResponsiveSlider urls={images} />
        </div>
      

      {/** Hero Section **/}
      
        <h2 className={styles.headers}>Hero</h2>
        <p className={styles.description}>
          Slides are centered. Each image has a different size and aspect ratio.
        </p>
        <div className={styles.sliderContainer}>
          <HeroSlider urls={heroImages} />
        </div>
      

      {/** Seamless Autoplay Section **/}
      
        <h2 className={styles.headers}>Seamless Autoplay</h2>
        <p className={styles.description}>
          Constant-speed horizontal scroll. Wrapping enabled; no fullscreen.
        </p>
        <div className={styles.sliderContainer}>
          <SeamlessSlider urls={logoImages} />
        </div>
      

      {/** Per-Slide Autoplay Section **/}
      
        <h2 className={styles.headers}>Per-Slide Autoplay</h2>
        <p className={styles.description}>
          Automatically advance to the next slide every 3 seconds.
        </p>
        <div className={styles.sliderContainer}>
          <PerSlideAutoPlaySlider urls={images} />
        </div>
      
    </div>
  );
}
