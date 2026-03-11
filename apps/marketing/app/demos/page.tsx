import type { Metadata } from "next";
import DemosPageClient from "./DemosPageClient";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Interactive React Motion Gallery demos with a sticky sidebar for browsing layouts, sync patterns, and fullscreen flows.",
};

export default function DemosPage() {
  return <DemosPageClient />;
}
