"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { getVehicleById } from "@/lib/vehicle-service";
import VehicleForm from "@/components/vehicle-form";

export default function EditVehiclePage() {
  const { isSignedIn, userId } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const fetchVehicle = async () => {
      try {
        const data = await getVehicleById(params.vehicleId as string);
        if (!data) {
          router.push("/");
          return;
        }
        if (data.userId !== userId) {
          router.push("/");
          return;
        }
        setVehicle(data);
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [isSignedIn, userId, params.vehicleId, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Vehicle</h1>
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
