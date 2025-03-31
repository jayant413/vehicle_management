import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getVehicles, getVehicleById } from "@/lib/vehicle-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    let { userId } = await auth();

    if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
      userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (vehicleId) {
      const vehicle = await getVehicleById(vehicleId);

      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 }
        );
      }

      if (vehicle.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      return NextResponse.json(vehicle);
    }

    const vehicles = await getVehicles(userId);
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
