import { Metadata } from "next";
import { BuildingDetailsPage } from "@/components/dashboard/admin/building-details-page";

export const metadata: Metadata = {
  title: "Building Details | TBSA Admin",
  description: "View detailed information about a specific building",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BuildingPage({ params }: Props) {
  const { id } = await params;
  return <BuildingDetailsPage buildingId={id} />;
}
