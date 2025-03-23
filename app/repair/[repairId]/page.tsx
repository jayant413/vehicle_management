"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { getRepairById } from "@/lib/repair-service";
import { getVehicleById } from "@/lib/vehicle-service";
import RepairDetails, { RepairDetailsProps } from "@/components/repair-details";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RepairDetailPage() {
  const { isSignedIn, userId } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [repair, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const fetchRepair = async () => {
      try {
        const repairData = await getRepairById(params.repairId as string);
        if (!repairData) {
          router.push("/");
          return;
        }

        const vehicleData = await getVehicleById(repairData.vehicleId);
        if (!vehicleData || vehicleData.userId !== userId) {
          router.push("/");
          return;
        }

        setRepair(repairData);
      } catch (error) {
        console.error("Error fetching repair:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [isSignedIn, userId, params.repairId, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!repair) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Repair Not Found</h1>
        <Link href="/">
          <Button>Back to Vehicles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Link href={`/vehicle/${repair.vehicleId}`}>
        <Button variant="outline" className="mb-4">
          Back to Vehicle
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-8">Repair Details</h1>
      <RepairDetails
        repair={repair as unknown as RepairDetailsProps["repair"]}
      />
    </div>
  );
}
