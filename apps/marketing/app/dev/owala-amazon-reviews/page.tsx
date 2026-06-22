import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OwalaAmazonReviewsSection } from "@/content/owala-amazon-reviews/OwalaAmazonReviewsSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owala Amazon Reviews Section",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwalaAmazonReviewsDevPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <OwalaAmazonReviewsSection />;
}
