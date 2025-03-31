"use client";

import { useEffect, useState } from "react";
import { redirect, useParams } from "next/navigation";
import RepairForm from "@/components/repair-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/lib/types";

export default function AddRepairPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check auth
        const authResponse = await fetch("/api/auth/check");
        const authData = await authResponse.json();

        if (!authData.authenticated) {
          redirect("/sign-in");
          return;
        }

        if (!vehicleId) {
          redirect("/");
          return;
        }

        // Fetch vehicle
        const vehicleResponse = await fetch(
          `/api/vehicles?vehicleId=${vehicleId}`
        );
        if (!vehicleResponse.ok) {
          redirect("/");
          return;
        }

        const vehicleData = await vehicleResponse.json();
        setVehicle(vehicleData);
      } catch (err) {
        console.error("Error:", err);
        redirect("/");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [vehicleId]);

  if (loading) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>;
  }

  if (!vehicle || !vehicleId) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Vehicle Not Found</h1>
        <Link href="/">
          <Button>Back to Vehicles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Link href={`/vehicle/${vehicleId}`}>
        <Button variant="outline" className="mb-4">
          Back to Vehicle
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-8">Add Repair Details</h1>
      <RepairForm vehicleId={vehicleId} />
    </div>
  );
}
