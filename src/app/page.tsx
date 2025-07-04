export const dynamic    = 'force-static';
export const fetchCache = 'force-cache';

import FixedHeightSlider from "@/components/FixedHeight/FixedHeightSlider";
import styles from "./page.module.css";
import ThumbnailSlider from "@/components/Thumbnails/ThumbnailSlider";
import ResponsiveSlider from "@/components/Responsive/ResponsiveSlider";

export default function Home() {

  const images: string[] = [
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-1.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-2.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-3.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-4.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-5.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-6.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-7.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-8.jpg'
  ];

  return (
    <div className={styles.page} id='page_container'>
      <h1 className={styles.title}>REACT MOTION GALLERY</h1>
      <h2 className={styles.headers}>Thumbnails</h2>
      <p className={styles.description}>Resize the browser to 500px to see the horizontal thumbnail scrollbar.</p>
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '32px' }}>
        <ThumbnailSlider urls={images} />
      </div>
      <h2 className={styles.headers}>Fixed Height</h2>
      <p className={styles.description}>Width and height of all images are fixed, and the slider height is fixed.</p>
      <div style={{ overflow: 'hidden' }}>
        <FixedHeightSlider urls={images} />
      </div>
      <h2 className={styles.headers} style={{ paddingTop: '32px' }}>Responsive</h2>
      <p className={styles.description}>Column based layout which guarantees a slide shows 100% of each image, can be easily adjusted by simply modifying the maxWidth in the calculateImagesPerSlide function.</p>
      <div style={{ overflow: 'hidden' }}>
        <ResponsiveSlider urls={images} />
      </div>
    </div>
  );
}
