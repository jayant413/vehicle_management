import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRepairsByVehicleId } from "@/lib/repair-service";
import { getVehicleById } from "@/lib/vehicle-service";

export async function GET(
  request: Request,
  { params }: { params: { vehicleId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const vehicle = await getVehicleById(params.vehicleId);

    if (!vehicle) {
      return new NextResponse(JSON.stringify({ error: "Vehicle not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (vehicle.userId !== userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const repairs = await getRepairsByVehicleId(params.vehicleId);

    return NextResponse.json(repairs);
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
