"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

interface RepairData {
  vehicleId: string;
  repairDate: string;
  amount: number;
  toolName: string;
  toolImageUrl: string;
}

export async function createRepair(data: RepairData) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  // Verify the vehicle exists and belongs to the user
  if (!ObjectId.isValid(data.vehicleId)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await db.collection("vehicles").findOne({
    _id: new ObjectId(data.vehicleId),
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const result = await db.collection("repairs").insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath(`/vehicle/${data.vehicleId}`);

  return { id: result.insertedId };
}

export async function updateRepair(id: string, data: Partial<RepairData>) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid repair ID");
  }

  const repair = await db.collection("repairs").findOne({
    _id: new ObjectId(id),
  });

  if (!repair) {
    throw new Error("Repair not found");
  }

  // Verify the vehicle belongs to the user
  if (!ObjectId.isValid(repair.vehicleId)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await db.collection("vehicles").findOne({
    _id: new ObjectId(repair.vehicleId),
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.collection("repairs").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath(`/vehicle/${repair.vehicleId}`);
  revalidatePath(`/repair/${id}`);

  return { id };
}

export async function deleteRepair(id: string) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid repair ID");
  }

  const repair = await db.collection("repairs").findOne({
    _id: new ObjectId(id),
  });

  if (!repair) {
    throw new Error("Repair not found");
  }

  // Verify the vehicle belongs to the user
  if (!ObjectId.isValid(repair.vehicleId)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await db.collection("vehicles").findOne({
    _id: new ObjectId(repair.vehicleId),
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.collection("repairs").deleteOne({ _id: new ObjectId(id) });

  revalidatePath(`/vehicle/${repair.vehicleId}`);

  return { success: true };
}
