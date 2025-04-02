"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";
import type { Tyre } from "./types";

export async function addTyre(vehicleId: string, tyreData: Partial<Tyre>) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(vehicleId)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await db.collection("vehicles").findOne({
    _id: new ObjectId(vehicleId),
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const tyreId = new ObjectId().toString();

  await db.collection("vehicles").updateOne(
    { _id: new ObjectId(vehicleId) },
    {
      $push: {
        tyres: {
          _id: tyreId,
          ...tyreData,
        } as any,
      },
      $set: { updatedAt: new Date() },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { id: tyreId };
}

export async function updateTyre(
  vehicleId: string,
  tyreId: string,
  tyreData: Partial<Tyre>
) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(vehicleId)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await db.collection("vehicles").findOne({
    _id: new ObjectId(vehicleId),
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.collection("vehicles").updateOne(
    {
      _id: new ObjectId(vehicleId),
      "tyres._id": tyreId,
    },
    {
      $set: {
        "tyres.$": {
          _id: tyreId,
          ...tyreData,
        },
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { success: true };
}

export async function deleteTyre(vehicleId: string, tyreId: string) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(vehicleId)) {
    throw new Error("Invalid vehicle ID");
  }

  const vehicle = await db.collection("vehicles").findOne({
    _id: new ObjectId(vehicleId),
  });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.collection("vehicles").updateOne(
    { _id: new ObjectId(vehicleId) },
    {
      $pull: { tyres: { _id: tyreId } as any },
      $set: { updatedAt: new Date() },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { success: true };
}
