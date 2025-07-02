export const dynamic    = 'force-static';
export const fetchCache = 'force-cache';

import FixedHeightSlider from "@/components/FixedHeight/FixedHeightSlider";
import styles from "./page.module.css";
import ThumbnailSlider from "@/components/Thumbnails/ThumbnailSlider";
import ResponsiveSlider from "@/components/Responsive/ResponsiveSlider";

export default function Home() {

  const thumbnailSliderImages: string[] = [
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-1.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-2.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-3.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-4.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-5.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-6.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-7.jpg',
    'https://react-motion-gallery.s3.us-east-1.amazonaws.com/thumbnail-slider-image-8.jpg'
  ]

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ThumbnailSlider urls={thumbnailSliderImages} />
      </div>
      <div>
        <FixedHeightSlider urls={thumbnailSliderImages} />
      </div>
      <div>
        <ResponsiveSlider urls={thumbnailSliderImages} />
      </div>
    </div>
  );
}
