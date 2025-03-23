"use client";

export async function getVehicles() {
  const response = await fetch("/api/vehicles");
  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }
  return response.json();
}

export async function getVehicleById(id: string) {
  const response = await fetch(`/api/vehicles?id=${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch vehicle");
  }
  return response.json();
}
