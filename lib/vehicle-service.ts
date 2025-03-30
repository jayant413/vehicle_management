import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export async function getVehicles(userId: string) {
  const { db } = await connectToDatabase()

  return db.collection("vehicles").find({ userId }).sort({ createdAt: -1 }).toArray()
}

export async function getVehicleById(id: string) {
  const { db } = await connectToDatabase()

  if (!ObjectId.isValid(id)) {
    return null
  }

  return db.collection("vehicles").findOne({ _id: new ObjectId(id) })
}

