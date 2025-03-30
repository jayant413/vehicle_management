import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRepairById } from "@/lib/repair-service";
import { getVehicleById } from "@/lib/vehicle-service";

export async function GET(
  request: Request,
  { params }: { params: { repairId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repair = await getRepairById(params.repairId);

    if (!repair) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    // Check if the repair belongs to a vehicle owned by the current user
    const vehicle = await getVehicleById(repair.vehicleId);

    if (!vehicle || vehicle.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(repair);
  } catch (error) {
    console.error("Error fetching repair:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
