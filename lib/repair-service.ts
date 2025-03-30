import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export async function getRepairsByVehicleId(vehicleId: string) {
  const { db } = await connectToDatabase()

  if (!ObjectId.isValid(vehicleId)) {
    return []
  }

  return db.collection("repairs").find({ vehicleId }).sort({ repairDate: -1 }).toArray()
}

export async function getRepairById(id: string) {
  const { db } = await connectToDatabase()

  if (!ObjectId.isValid(id)) {
    return null
  }

  return db.collection("repairs").findOne({ _id: new ObjectId(id) })
}

