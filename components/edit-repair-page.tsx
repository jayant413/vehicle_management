"use client";

import { useEffect, useState } from "react";
import { redirect, useParams } from "next/navigation";
import RepairForm from "@/components/repair-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Repair } from "@/lib/types";

export default function EditRepairPage() {
  const params = useParams();
  const repairId = params.repairId as string;
  const [repair, setRepair] = useState<Repair | null>(null);
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

        if (!repairId) {
          redirect("/");
          return;
        }

        // Fetch repair
        const repairResponse = await fetch(`/api/repairs?repairId=${repairId}`);
        if (!repairResponse.ok) {
          redirect("/");
          return;
        }

        const repairData = await repairResponse.json();
        setRepair(repairData);
      } catch (err) {
        console.error("Error:", err);
        redirect("/");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [repairId]);

  if (loading) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>;
  }

  if (!repair || !repairId) {
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
      <Link href={`/repair/${repairId}`}>
        <Button variant="outline" className="mb-4">
          Back to Repair Details
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-8">Edit Repair Details</h1>
      <RepairForm repair={repair} />
    </div>
  );
}
