"use client";

export async function getRepairsByVehicleId(vehicleId: string) {
  const response = await fetch(`/api/repairs?vehicleId=${vehicleId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch repairs");
  }
  return response.json();
}

export async function getRepairById(id: string) {
  const response = await fetch(`/api/repairs?id=${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch repair");
  }
  return response.json();
}
