import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRepairById } from "@/lib/repair-service";
import { getVehicleById } from "@/lib/vehicle-service";
import RepairDetails, { RepairDetailsProps } from "@/components/repair-details";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RepairDetailPage({
  params,
}: {
  params: { repairId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const repair = await getRepairById(params.repairId);

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

  const vehicle = await getVehicleById(repair.vehicleId);

  if (!vehicle || vehicle.userId !== userId) {
    redirect("/");
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
