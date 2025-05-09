"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Vehicle } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VehicleDetails() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [pucDialogOpen, setPucDialogOpen] = useState(false);
  const [rcDialogOpen, setRcDialogOpen] = useState(false);

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
              <div className="flex gap-2">
                <Link href={`/vehicle/${vehicle._id}/edit`}>
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
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Driver:</span>{" "}
                {vehicle.driver?.name || "No driver assigned"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Driver Number:</span>{" "}
                {vehicle.driver?.phoneNumber || "No driver assigned"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Vehicle Number:</span>{" "}
                {vehicle.vehicleNumber}
              </p>
            </div>
          </div>
        </div>

        {/* PUC and RC Image Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicle.pucImage && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">PUC Document</h3>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setPucDialogOpen(true)}
              >
                <Eye className="h-4 w-4" />
                View PUC
              </Button>
            </div>
          )}

          {vehicle.rcImage && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">RC Document</h3>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setRcDialogOpen(true)}
              >
                <Eye className="h-4 w-4" />
                View RC
              </Button>
            </div>
          )}
        </div>

        {/* PUC Dialog */}
        <Dialog open={pucDialogOpen} onOpenChange={setPucDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>PUC Document</DialogTitle>
            </DialogHeader>
            <div className="relative h-[500px] w-full rounded-md overflow-hidden">
              <Image
                src={vehicle.pucImage || ""}
                alt="PUC Document"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* RC Dialog */}
        <Dialog open={rcDialogOpen} onOpenChange={setRcDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>RC Document</DialogTitle>
            </DialogHeader>
            <div className="relative h-[500px] w-full rounded-md overflow-hidden">
              <Image
                src={vehicle.rcImage || ""}
                alt="RC Document"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
