"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

interface VehicleData {
  name: string;
  ownerName: string;
  vehicleNumber: string;
  imageUrl: string;
}

export async function createVehicle(data: VehicleData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  const result = await db.collection("vehicles").insertOne({
    ...data,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/");

  return { id: result.insertedId };
}

export async function updateVehicle(id: string, data: VehicleData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await db.collection("vehicles").findOne({
    _id: new ObjectId(id),
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.collection("vehicles").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/");
  revalidatePath(`/vehicle/${id}`);

  return { id };
}

export async function deleteVehicle(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await db.collection("vehicles").findOne({
    _id: new ObjectId(id),
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Delete the vehicle
  await db.collection("vehicles").deleteOne({ _id: new ObjectId(id) });

  // Delete all repairs associated with this vehicle
  await db.collection("repairs").deleteMany({ vehicleId: id });

  revalidatePath("/");

  return { success: true };
}
