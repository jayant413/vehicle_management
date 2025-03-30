import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getVehicles } from "@/lib/vehicle-service";

export async function GET() {
  try {
    let { userId } = await auth();

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    //   userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
    // }

    const vehicles = await getVehicles(userId);

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
