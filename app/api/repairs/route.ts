import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";
import { getRepairById } from "@/lib/repair-service";
import { getVehicleById } from "@/lib/vehicle-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repairId = searchParams.get("repairId");
    const vehicleId = searchParams.get("vehicleId");

    if (repairId) {
      let { userId } = await auth();

      if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
        userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
      }
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const repair = await getRepairById(repairId);
      if (!repair) {
        return NextResponse.json(
          { error: "Repair not found" },
          { status: 404 }
        );
      }

      const vehicle = await getVehicleById(repair.vehicleId);
      if (!vehicle || vehicle.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      return NextResponse.json(repair);
    }

    if (vehicleId) {
      let { userId } = await auth();

      if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
        userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
      }
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const vehicle = await getVehicleById(vehicleId);
      if (!vehicle || vehicle.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const { db } = await connectToDatabase();
      const repairs = db.collection("repairs");
      const vehicleRepairs = await repairs
        .find({ vehicleId: vehicleId })
        .toArray();
      return NextResponse.json(vehicleRepairs);
    }

    // If no parameters provided, return all repairs
    const { db } = await connectToDatabase();
    const repairs = db.collection("repairs");
    const allRepairs = await repairs.find({}).toArray();
    return NextResponse.json(allRepairs);
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return NextResponse.json(
      { error: "Failed to fetch repairs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    const repairs = db.collection("repairs");

    const result = await repairs.insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating repair:", error);
    return NextResponse.json(
      { error: "Failed to create repair" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Repair ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { db } = await connectToDatabase();
    const repairs = db.collection("repairs");

    const result = await repairs.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating repair:", error);
    return NextResponse.json(
      { error: "Failed to update repair" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Repair ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const repairs = db.collection("repairs");

    const result = await repairs.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting repair:", error);
    return NextResponse.json(
      { error: "Failed to delete repair" },
      { status: 500 }
    );
  }
}
