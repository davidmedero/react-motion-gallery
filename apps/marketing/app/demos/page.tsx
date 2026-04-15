import type { Metadata } from "next";
import DemosPageClient from "./DemosPageClient";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Editable React Motion Gallery demo slots with a sticky sidebar for browsing planned layouts and patterns.",
};

type DemosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSearchParamsString(
  searchParams: Record<string, string | string[] | undefined>
) {
  const nextSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      nextSearchParams.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        nextSearchParams.append(key, entry);
      }
    }
  }

  return nextSearchParams.toString();
}

export default async function DemosPage({ searchParams }: DemosPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialSearchParamsString = toSearchParamsString(resolvedSearchParams);

  return (
    <DemosPageClient initialSearchParamsString={initialSearchParamsString} />
  );
}
