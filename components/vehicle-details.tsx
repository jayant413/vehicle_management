"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Vehicle } from "@/lib/types";

export default function VehicleDetails() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const response = await fetch(`/api/vehicles?vehicleId=${vehicleId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vehicle");
        }
        const data = await response.json();
        setVehicle(data);
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      } finally {
        setLoading(false);
      }
    }

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  if (loading) {
    return <div>Loading vehicle details...</div>;
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative h-64 w-full md:w-1/3 rounded-md overflow-hidden">
            <Image
              src={vehicle.imageUrl || "/placeholder.svg?height=300&width=400"}
              alt={vehicle.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold mb-4">{vehicle.name}</h2>
              <Link href={`/vehicle/edit?vehicleId=${vehicle._id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Driver:</span>{" "}
                {vehicle.driver?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Vehicle Number:</span>{" "}
                {vehicle.vehicleNumber}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
