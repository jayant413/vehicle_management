"use client";

import { redirect, useParams } from "next/navigation";
import VehicleForm from "@/components/vehicle-form";
import { useEffect, useState } from "react";
import { Vehicle } from "@/lib/types";

export default function EditVehiclePage() {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const authResponse = await fetch("/api/auth/check");
        const authData = await authResponse.json();

        if (!authData.authenticated) {
          redirect("/sign-in");
          return;
        }

        // Fetch vehicle
        const vehicleResponse = await fetch(`/api/vehicles/${vehicleId}`);
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
    };

    if (vehicleId) {
      fetchData();
    }
  }, [vehicleId]);

  if (loading) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>;
  }

  if (!vehicle) {
    redirect("/");
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Vehicle</h1>
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
