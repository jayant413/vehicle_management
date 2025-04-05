"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DriverForm from "@/components/driver-form";

export default function EditDriverPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

        // Check if driver exists
        if (!vehicleData.driver) {
          setError("No driver assigned to this vehicle");
        }
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

  if (loading) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>;
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">
          {error || "Vehicle Not Found"}
        </h1>
        <Link href={`/vehicle/${vehicleId}`}>
          <Button>Back to Vehicle Details</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-2 md:mx-[3em] py-10 px-4">
      <div className="mb-8">
        <Link href={`/vehicle/${vehicleId}`}>
          <Button variant="outline" className="mb-4">
            Back to Vehicle Details
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-8">Edit Driver</h1>
      </div>

      <div className="">
        <DriverForm
          vehicleId={vehicleId}
          driver={vehicle.driver}
          onSuccess={() => {
            // Redirect back to vehicle details page
            router.push(`/vehicle/${vehicleId}`);
          }}
        />
      </div>
    </div>
  );
}
