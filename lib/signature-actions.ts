"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

interface SignatureData {
  name: string;
  signatureUrl: string;
}

// Function to upload image to Cloudinary
export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "feetTrack");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dsmcoe91p/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

// Function to delete image from Cloudinary
export async function deleteFromCloudinary(imageUrl: string) {
  try {
    // Extract the public_id from the Cloudinary URL
    const urlParts = imageUrl.split("/");
    const filename = urlParts[urlParts.length - 1].split(".")[0];
    const publicId = `feetTrack/${filename}`;

    // Make a DELETE request to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dsmcoe91p/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: publicId,
        }),
      }
    );

    const data = await response.json();
    return data.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Don't throw the error, just log it and continue
    return false;
  }
}

export async function createSignature(data: SignatureData) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  // Check if user already has a signature
  const existingSignature = await db
    .collection("signatures")
    .findOne({ userId });

  if (existingSignature) {
    // If exists, update it
    await db.collection("signatures").updateOne(
      { userId },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/");
    return { id: existingSignature._id };
  }

  // If not, create a new one
  const result = await db.collection("signatures").insertOne({
    ...data,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/");

  return { id: result.insertedId };
}

export async function getSignature() {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  const signature = await db.collection("signatures").findOne({ userId });

  return signature;
}

export async function updateSignature(id: string, data: SignatureData) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid signature ID");
  }

  const signature = await db.collection("signatures").findOne({
    _id: new ObjectId(id),
  });

  if (!signature) {
    throw new Error("Signature not found");
  }

  if (signature.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await db.collection("signatures").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/");

  return { id };
}

export async function deleteSignature(id: string) {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { db } = await connectToDatabase();

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid signature ID");
  }

  const signature = await db.collection("signatures").findOne({
    _id: new ObjectId(id),
  });

  if (!signature) {
    throw new Error("Signature not found");
  }

  if (signature.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Delete the image from Cloudinary if it exists
  if (signature.signatureUrl) {
    await deleteFromCloudinary(signature.signatureUrl);
  }

  // Delete the signature from the database
  await db.collection("signatures").deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/");

  return { success: true };
}
