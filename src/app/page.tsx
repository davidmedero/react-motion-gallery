export const dynamic    = 'force-static';
export const fetchCache = 'force-cache';

import GroupedCellsSlider from "@/components/Grouped Cells";
import styles from "./page.module.css";
import ThumbnailSlider from "@/components/Thumbnails/ThumbnailSlider";
import ResponsiveSlider from "@/components/Responsive/ResponsiveSlider";
import HeroSlider from "@/components/Hero/HeroSlider";
import SeamlessSlider from "@/components/Seamless AutoPlay/SeamlessSlider";
import PerSlideAutoPlaySlider from "@/components/Per Slide AutoPlay/PerSlideAutoPlaySlider";
import MediaQuerySlider from "@/components/Media Query/ResponsiveSlider";

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
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Canva_Logo.svg/1114px-Canva_Logo.svg.png?20250530000654',
    'https://wallpapers.com/images/featured-full/github-logo-png-s8wb6yxlatsyp8s1.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Adobe_Corporate_logo.svg/1024px-Adobe_Corporate_logo.svg.png?20220820114255',
    'https://tbkconsult.com/wp-content/uploads/2016/11/HubSpot-Logo-PNG-600x173.png',
    'https://cdn.worldvectorlogo.com/logos/instagram-1.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/1024px-Microsoft_logo_%282012%29.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/996px-Slack_Technologies_Logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/1118px-Spotify_logo_with_text.svg.png?20160123211747',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1024px-Stripe_Logo%2C_revised_2016.svg.png?20240909030005',
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
        Resize the browser to 500px to see the horizontal thumbnail scrollbar. One cell is equal to one slide. Every image is the same size.
      </p>
      <div className={styles.sliderContainer}>
        <ThumbnailSlider urls={images} />
      </div>
    
      {/** Grouped Cells Section **/}
    
      <h2 className={styles.headers}>Grouped Cells</h2>
      <p className={styles.description}>
        I gave this slider a height of 300px then change it to 50vw when the viewport is 600px and below. Cells are grouped. Accomodates images of any size. I disable wrapping once the second to last image is visible (you have complete control over when and why wrapping happens).
      </p>
      <div className={styles.sliderContainer}>
        <GroupedCellsSlider urls={heroImages} />
      </div>
    
      {/** Responsive Section **/}
    
      <h2 className={styles.headers}>Responsive</h2>
      <p className={styles.description}>
        Column-based layout guaranteeing full image visibility per slide. The number of cells per slide is derived from the maxWidth value you assign it which is 220 in the example below. The minimum number of slides is set to 2. 
      </p>
      <div className={styles.sliderContainer}>
        <ResponsiveSlider urls={images} />
      </div>
    
      {/** Hero Section **/}
    
      <h2 className={styles.headers}>Hero</h2>
      <p className={styles.description}>
        Slides are centered. One cell is equal to one slide.
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

      {/** Media Query Section **/}
    
      <h2 className={styles.headers}>Media Query</h2>
      <p className={styles.description}>
        Full control over how many cells to show per slide.
      </p>
      <div className={styles.sliderContainer}>
        <MediaQuerySlider urls={images} />
      </div>
      
    </div>
  );
}
