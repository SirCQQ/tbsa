import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apartmentService } from "@/services/apartment.service";
import { hasPermissionServerSide } from "@/lib/auth-helpers";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ apartmentId: string }> }
) {
  try {
    const { apartmentId } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu sunteți autentificat" },
        { status: 401 }
      );
    }

    // Check permission to read apartments
    const hasReadPermission = await hasPermissionServerSide(
      session.user.permissions || [],
      ResourcesEnum.APARTMENTS.toLowerCase(),
      ActionsEnum.READ.toLowerCase()
    );

    if (!hasReadPermission) {
      return NextResponse.json(
        { error: "Nu aveți permisiunea de a vizualiza apartamentele" },
        { status: 403 }
      );
    }

    // Validate organization access
    if (!session.user.currentOrganizationId) {
      return NextResponse.json(
        { error: "Nu s-a găsit contextul organizației" },
        { status: 400 }
      );
    }

    // Validate apartment ID
    if (!apartmentId) {
      return NextResponse.json(
        { error: "ID-ul apartamentului este obligatoriu" },
        { status: 400 }
      );
    }

    // Create apartment service instance

    // Get apartment by ID
    const result = await apartmentService.getApartmentById(
      apartmentId,
      session.user.currentOrganizationId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Apartamentul nu a fost găsit" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Get apartment error:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ apartmentId: string }> }
) {
  try {
    const { apartmentId } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu sunteți autentificat" },
        { status: 401 }
      );
    }

    // Check permission to update apartments
    const hasUpdatePermission = await hasPermissionServerSide(
      session.user.permissions || [],
      ResourcesEnum.APARTMENTS.toLowerCase(),
      ActionsEnum.UPDATE.toLowerCase()
    );

    if (!hasUpdatePermission) {
      return NextResponse.json(
        { error: "Nu aveți permisiunea de a modifica apartamentele" },
        { status: 403 }
      );
    }

    // Validate organization access
    if (!session.user.currentOrganizationId) {
      return NextResponse.json(
        { error: "Nu s-a găsit contextul organizației" },
        { status: 400 }
      );
    }

    // Validate apartment ID
    if (!apartmentId) {
      return NextResponse.json(
        { error: "ID-ul apartamentului este obligatoriu" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Create apartment service instance

    // Update apartment
    const result = await apartmentService.updateApartment(
      apartmentId,
      session.user.currentOrganizationId,
      body
    );

    if (!result.success) {
      // Handle specific error types
      if (result.error?.includes("Apartamentul cu numărul")) {
        return NextResponse.json(
          {
            error: result.error,
            details: {
              number: "Numărul apartamentului există deja pe acest etaj",
            },
          },
          { status: 409 }
        );
      }

      if (result.error?.includes("Etajul")) {
        return NextResponse.json(
          {
            error: result.error,
            details: {
              floor: "Etajul specificat nu este valid pentru această clădire",
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: result.error || "Nu s-a putut actualiza apartamentul" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Apartamentul a fost actualizat cu succes",
    });
  } catch (error) {
    console.error("Update apartment error:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ apartmentId: string }> }
) {
  try {
    const { apartmentId } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nu sunteți autentificat" },
        { status: 401 }
      );
    }

    // Check permission to delete apartments
    const hasDeletePermission = await hasPermissionServerSide(
      session.user.permissions || [],
      ResourcesEnum.APARTMENTS.toLowerCase(),
      ActionsEnum.DELETE.toLowerCase()
    );

    if (!hasDeletePermission) {
      return NextResponse.json(
        { error: "Nu aveți permisiunea de a șterge apartamentele" },
        { status: 403 }
      );
    }

    // Validate organization access
    if (!session.user.currentOrganizationId) {
      return NextResponse.json(
        { error: "Nu s-a găsit contextul organizației" },
        { status: 400 }
      );
    }

    // Validate apartment ID
    if (!apartmentId) {
      return NextResponse.json(
        { error: "ID-ul apartamentului este obligatoriu" },
        { status: 400 }
      );
    }

    // Create apartment service instance

    // Delete apartment
    const result = await apartmentService.deleteApartment(
      apartmentId,
      session.user.currentOrganizationId
    );

    if (!result.success) {
      // Handle specific error types
      if (result.error?.includes("are rezidenți")) {
        return NextResponse.json(
          {
            error: result.error,
            details: {
              residents: "Nu se poate șterge un apartament cu rezidenți activi",
            },
          },
          { status: 409 }
        );
      }

      if (result.error?.includes("contoare")) {
        return NextResponse.json(
          {
            error: result.error,
            details: {
              meters: "Nu se poate șterge un apartament cu contoare active",
            },
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: result.error || "Nu s-a putut șterge apartamentul" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Apartamentul a fost șters cu succes",
    });
  } catch (error) {
    console.error("Delete apartment error:", error);
    return NextResponse.json(
      { error: "Eroare internă de server" },
      { status: 500 }
    );
  }
}
