"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";
import type { Driver, DriverItem } from "./types";

export async function addDriver(vehicleId: string, driverData: Driver) {
  const { userId } = await auth();

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
      $set: {
        driver: {
          ...driverData,
          itemsGiven: [],
        },
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { success: true };
}

export async function updateDriver(vehicleId: string, driverData: Driver) {
  const { userId } = await auth();

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

  // Preserve existing items
  const existingItems = vehicle.driver?.itemsGiven || [];

  await db.collection("vehicles").updateOne(
    { _id: new ObjectId(vehicleId) },
    {
      $set: {
        driver: {
          ...driverData,
          itemsGiven: existingItems,
        },
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { success: true };
}

export async function deleteDriver(vehicleId: string) {
  const { userId } = await auth();

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
      $unset: { driver: "" },
      $set: { updatedAt: new Date() },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { success: true };
}

export async function addDriverItem(
  vehicleId: string,
  itemData: Partial<DriverItem>
) {
  const { userId } = await auth();

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

  if (!vehicle.driver) {
    throw new Error("No driver assigned to this vehicle");
  }

  const itemId = new ObjectId().toString();

  await db.collection("vehicles").updateOne(
    { _id: new ObjectId(vehicleId) },
    {
      $push: {
        "driver.itemsGiven": {
          _id: itemId,
          ...itemData,
        },
      },
      $set: { updatedAt: new Date() },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { id: itemId };
}

export async function updateDriverItem(
  vehicleId: string,
  itemId: string,
  itemData: Partial<DriverItem>
) {
  const { userId } = await auth();

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

  if (!vehicle.driver) {
    throw new Error("No driver assigned to this vehicle");
  }

  await db.collection("vehicles").updateOne(
    {
      _id: new ObjectId(vehicleId),
      "driver.itemsGiven._id": itemId,
    },
    {
      $set: {
        "driver.itemsGiven.$": {
          _id: itemId,
          ...itemData,
        },
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { success: true };
}

export async function deleteDriverItem(vehicleId: string, itemId: string) {
  const { userId } = await auth();

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

  if (!vehicle.driver) {
    throw new Error("No driver assigned to this vehicle");
  }

  await db.collection("vehicles").updateOne(
    { _id: new ObjectId(vehicleId) },
    {
      $pull: {
        "driver.itemsGiven": { _id: itemId },
      },
      $set: { updatedAt: new Date() },
    }
  );

  revalidatePath(`/vehicle/${vehicleId}`);

  return { success: true };
}
