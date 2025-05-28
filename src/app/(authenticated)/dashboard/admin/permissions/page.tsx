import { Metadata } from "next";
import { PermissionsManagementPage } from "@/components/dashboard/admin/permissions-management-page";

export const metadata: Metadata = {
  title: "Gestionare Permisiuni | TBSA Admin",
  description: "Gestionează rolurile și permisiunile utilizatorilor",
};

export default async function PermissionsPage() {
  return <PermissionsManagementPage />;
}
