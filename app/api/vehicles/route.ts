import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const { db } = await connectToDatabase();

  if (id) {
    if (!ObjectId.isValid(id)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }
    const vehicle = await db
      .collection("vehicles")
      .findOne({ _id: new ObjectId(id) });
    return NextResponse.json(vehicle);
  }

  const vehicles = await db
    .collection("vehicles")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(vehicles);
}
