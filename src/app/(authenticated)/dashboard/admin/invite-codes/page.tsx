import { Metadata } from "next";
import { AdminInviteCodesPage } from "@/components/dashboard/admin/invite-codes/admin-invite-codes-page";

export const metadata: Metadata = {
  title: "Invite Codes Management | TBSA Admin",
  description: "Manage apartment invite codes for building residents",
};

export default function InviteCodesPage() {
  return <AdminInviteCodesPage />;
}
