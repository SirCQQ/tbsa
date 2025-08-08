import { NextRequest } from "next/server";

import { withAuth } from "@/lib/withAuth";
import { SubscriptionSyncController } from "@/controllers/subscription-sync.controller";

export async function POST(request: NextRequest) {
  return withAuth(SubscriptionSyncController.syncSubscriptions, [
    // { resource: ResourcesEnum.SUPER_ADMIN, action: ActionsEnum.CREATE },
  ])(request);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");

  // If productId is provided, sync single product
  if (productId) {
    return withAuth(SubscriptionSyncController.syncSingleProduct, [
      // { resource: ResourcesEnum., action: ActionsEnum.CREATE },
    ])(request);
  }

  // Otherwise, get sync status
  return withAuth(SubscriptionSyncController.getSyncStatus, [
    // { resource: ResourcesEnum.SUPER_ADMIN, action: ActionsEnum.READ },
  ])(request);
}
