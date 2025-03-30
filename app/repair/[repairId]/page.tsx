"use client";

import { redirect, useParams } from "next/navigation";
import RepairDetails from "@/components/repair-details";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { Repair } from "@/lib/types";

export default function RepairDetailPage() {
  const { repairId } = useParams();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch repair
        const repairResponse = await fetch(`/api/repairs/${repairId}`);
        if (!repairResponse.ok) {
          if (repairResponse.status === 404) {
            setError("Repair Not Found");
            return;
          } else if (repairResponse.status === 403) {
            redirect("/");
            return;
          }
          throw new Error("Failed to fetch repair");
        }

        const repairData = await repairResponse.json();
        setRepair(repairData);
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (repairId) {
      fetchData();
    }
  }, [repairId]);

  if (loading) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>;
  }

  if (error || !repair) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">
          {error || "Repair Not Found"}
        </h1>
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
      <RepairDetails repair={repair} />
    </div>
  );
}
