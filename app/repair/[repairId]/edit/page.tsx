"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { getRepairById } from "@/lib/repair-service";
import { getVehicleById } from "@/lib/vehicle-service";
import RepairForm from "@/components/repair-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RepairDetailsProps } from "@/components/repair-details";

export default function EditRepairPage() {
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
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Link href={`/repair/${params.repairId}`}>
        <Button variant="outline" className="mb-4">
          Back to Repair Details
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-8">Edit Repair Details</h1>
      <RepairForm repair={repair as unknown as RepairDetailsProps["repair"]} />
    </div>
  );
}
