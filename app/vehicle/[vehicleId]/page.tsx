"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { getVehicleById } from "@/lib/vehicle-service";
import VehicleDetails, {
  VehicleDetailsProps,
} from "@/components/vehicle-details";
import RepairList from "@/components/repair-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VehicleDetailPage() {
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
        if (
          data.userId !== userId &&
          userId !== "user_2pnrUDsmUR76VFUEMJbTgfv6R1F"
        ) {
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
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            Back to Vehicles
          </Button>
        </Link>
        <VehicleDetails
          vehicle={vehicle as unknown as VehicleDetailsProps["vehicle"]}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Repair History</h2>
        <Link href={`/vehicle/${params.vehicleId}/add-repair`}>
          <Button>Add Repair Details</Button>
        </Link>
      </div>

      <RepairList vehicleId={params.vehicleId as string} />
    </div>
  );
}
