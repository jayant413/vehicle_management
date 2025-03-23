import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getVehicleById } from "@/lib/vehicle-service";
import RepairForm from "@/components/repair-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AddRepairPage({
  params,
}: {
  params: { vehicleId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const vehicle = await getVehicleById(params.vehicleId);

  if (!vehicle) {
    redirect("/");
  }

  // Check if the vehicle belongs to the current user
  if (vehicle.userId !== userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Link href={`/vehicle/${params.vehicleId}`}>
        <Button variant="outline" className="mb-4">
          Back to Vehicle
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-8">Add Repair Details</h1>
      <RepairForm vehicleId={params.vehicleId} />
    </div>
  );
}
