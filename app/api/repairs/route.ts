import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const id = searchParams.get("id");

    const { db } = await connectToDatabase();
    const repairs = db.collection("repairs");

    if (vehicleId) {
      // Get repairs by vehicle ID
      const vehicleRepairs = await repairs
        .find({ vehicleId: vehicleId })
        .toArray();
      return NextResponse.json(vehicleRepairs);
    }

    if (id) {
      // Get repair by ID
      const repair = await repairs.findOne({ _id: new ObjectId(id) });
      if (!repair) {
        return NextResponse.json(
          { error: "Repair not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(repair);
    }

    // If no parameters provided, return all repairs
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
