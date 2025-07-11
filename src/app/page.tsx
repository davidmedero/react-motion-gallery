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
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/hero/rmg-hero-image-1.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/hero/rmg-hero-image-2.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/hero/rmg-hero-image-3.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/hero/rmg-hero-image-4.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/hero/rmg-hero-image-5.jpg'
  ];

  return (
    <div className={styles.page} id='page_container'>
      <h1 className={styles.title}>REACT MOTION GALLERY</h1>
      <h2 className={styles.headers}>Thumbnails</h2>
      <p className={styles.description}>Resize the browser to 500px to see the horizontal thumbnail scrollbar. One image is equal to one slide.</p>
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '32px' }}>
        <ThumbnailSlider urls={images} />
      </div>
      <h2 className={styles.headers}>Fixed Height</h2>
      <p className={styles.description}>Width and height of all images are fixed, and the slider height is fixed. Images are grouped into slides based on image per slide visibility. Wrapping (loop) is disabled if there are 2 images or less that aren&#39;t visible. Resize the browser to toggle wrapping and see the slide count change.</p>
      <div style={{ overflow: 'hidden' }}>
        <FixedHeightSlider urls={images} />
      </div>
      <h2 className={styles.headers} style={{ paddingTop: '32px' }}>Responsive</h2>
      <p className={styles.description}>Column based layout which guarantees a slide shows 100% of each image, can be easily adjusted by simply modifying the maxWidth in the calculateImagesPerSlide function. Images are grouped into slides based on image per slide visibility. Wrapping (loop) is disabled if there are 2 images or less that aren&#39;t visible. Resize the browser to toggle wrapping and see the slide count change.</p>
      <div style={{ overflow: 'hidden' }}>
        <ResponsiveSlider urls={images} />
      </div>
      <h2 className={styles.headers} style={{ paddingTop: '32px' }}>Hero</h2>
      <p className={styles.description}>Slides are centered. One image is equal to one slide.</p>
      <div style={{ overflow: 'hidden' }}>
        <HeroSlider urls={heroImages} />
      </div>
      <h2 className={styles.headers} style={{ paddingTop: '32px' }}>Seamless Autoplay</h2>
      <p className={styles.description}>Fixed Height Slider with a constant speed for autoplay.</p>
      <div style={{ overflow: 'hidden' }}>
        <SeamlessSlider urls={images} />
      </div>
      <h2 className={styles.headers} style={{ paddingTop: '32px' }}>Per Slide Autoplay</h2>
      <p className={styles.description}>Fixed Height Slider that autoplays per slide every 3ms.</p>
      <div style={{ overflow: 'hidden' }}>
        <PerSlideAutoPlaySlider urls={images} />
      </div>
    </div>
  );
}
