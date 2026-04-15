import type { Metadata } from "next";

import ShimmerReproClient from "./ShimmerReproClient";

export const metadata: Metadata = {
  title: "Shimmer Repro",
  description:
    "Standalone masonry shimmer repro page without the demos shell.",
};

export default function ShimmerReproPage() {
  return <ShimmerReproClient />;
}
