import {
  errorApiResultResponse,
  Handler,
  internalServerErrorResponse,
  toSuccessApiResponse,
} from "@/lib/withAuth";
import { SubscriptionSyncService } from "@/services/subscription-sync.service";

export const syncSubscriptions: Handler<Response> = async (
  _request,
  _session
): Promise<Response> => {
  try {
    // TODO: Parse request body if needed for sync options
    // const body = await request.json();

    // Execute subscription sync using service
    const result = await SubscriptionSyncService.syncSubscriptions();

    if (!result.success) {
      return errorApiResultResponse(result, "Failed to sync subscriptions");
    }

    return toSuccessApiResponse(result, 200);
  } catch (error) {
    console.error("Subscription sync error:", error);
    return internalServerErrorResponse();
  }
};

export const getSyncStatus: Handler<Response> = async (
  _request,
  _session
): Promise<Response> => {
  try {
    // Fetch sync status using service
    const result = await SubscriptionSyncService.getSyncStatus();

    if (!result.success) {
      return errorApiResultResponse(result, "Failed to get sync status");
    }

    // Format response data
    const formattedStatus = {
      lastSyncTime: result.data!.lastSyncTime,
      isRunning: result.data!.isRunning,
      totalErrors: result.data!.totalErrors,
      lastErrors: result.data!.lastErrors,
    };

    return toSuccessApiResponse(
      {
        success: true,
        data: formattedStatus,
      },
      200
    );
  } catch (error) {
    console.error("Get sync status error:", error);
    return internalServerErrorResponse();
  }
};

export const syncSingleProduct: Handler<Response> = async (
  request,
  _session
): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return errorApiResultResponse(
        { success: false, error: "Product ID is required" },
        "Missing product ID parameter"
      );
    }

    // Execute single product sync using service
    const result =
      await SubscriptionSyncService.syncSingleProductById(productId);

    if (!result.success) {
      return errorApiResultResponse(result, "Failed to sync product");
    }

    return toSuccessApiResponse(result, 200);
  } catch (error) {
    console.error("Single product sync error:", error);
    return internalServerErrorResponse();
  }
};

export const SubscriptionSyncController = {
  syncSubscriptions,
  getSyncStatus,
  syncSingleProduct,
};
