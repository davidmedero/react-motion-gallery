import styles from "./page.module.css";
import ProductImages from "@/components/Thumbnails/ProductImages";

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
        <ProductImages urls={thumbnailSliderImages} />
      </div>
    </div>
  );
}
