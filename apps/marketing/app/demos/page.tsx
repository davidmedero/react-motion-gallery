import type { Metadata } from "next";
import DemosPageClient from "./DemosPageClient";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Editable React Motion Gallery demo slots with a sticky sidebar for browsing planned layouts and patterns.",
};

export default function DemosPage() {
  return <DemosPageClient />;
}
