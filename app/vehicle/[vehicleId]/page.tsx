"use client";

import { redirect, useParams } from "next/navigation";
import VehicleDetails from "@/components/vehicle-details";
import RepairList from "@/components/repair-list";
import TyreList from "@/components/tyre-list";
import DriverDetails from "@/components/driver-details";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Vehicle } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TyreForm from "@/components/tyre-form";

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyreDialogOpen, setIsTyreDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const response = await fetch("/api/auth/check");
        const authData = await response.json();

        if (!authData.authenticated) {
          redirect("/sign-in");
          return;
        }

        // Fetch vehicle
        const vehicleResponse = await fetch(
          `/api/vehicles?vehicleId=${vehicleId}`
        );
        if (!vehicleResponse.ok) {
          if (vehicleResponse.status === 404) {
            setError("Vehicle Not Found");
          } else if (vehicleResponse.status === 403) {
            redirect("/");
          } else {
            throw new Error("Failed to fetch vehicle");
          }
          return;
        }

        const vehicleData = await vehicleResponse.json();
        setVehicle(vehicleData);
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchData();
    }
  }, [vehicleId]);

  const handleTyreAdded = async () => {
    setIsTyreDialogOpen(false);
    // Refresh page
    const vehicleResponse = await fetch(`/api/vehicles?vehicleId=${vehicleId}`);
    if (vehicleResponse.ok) {
      const vehicleData = await vehicleResponse.json();
      setVehicle(vehicleData);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>;
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">
          {error || "Vehicle Not Found"}
        </h1>
        <Link href="/">
          <Button>Back to Vehicles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            Back to Vehicles
          </Button>
        </Link>
        <VehicleDetails />
      </div>

      <Tabs defaultValue="driver" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="driver">Driver</TabsTrigger>
          <TabsTrigger value="repairs">Repair</TabsTrigger>
          <TabsTrigger value="tyres">Tyres</TabsTrigger>
        </TabsList>

        <TabsContent value="driver" className="mt-6">
          <DriverDetails />
        </TabsContent>

        <TabsContent value="repairs" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Repair History</h2>
            <Link href={`/vehicle/${vehicleId}/add-repair`}>
              <Button>Add Repair Details</Button>
            </Link>
          </div>
          <RepairList />
        </TabsContent>

        <TabsContent value="tyres" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tyre Details</h2>
            <Dialog open={isTyreDialogOpen} onOpenChange={setIsTyreDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Tyre</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Tyre</DialogTitle>
                  <DialogDescription>
                    Enter details for the new tyre.
                  </DialogDescription>
                </DialogHeader>
                <TyreForm vehicleId={vehicleId} onSuccess={handleTyreAdded} />
              </DialogContent>
            </Dialog>
          </div>
          <TyreList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
