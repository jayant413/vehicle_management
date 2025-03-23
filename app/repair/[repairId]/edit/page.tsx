import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRepairById } from "@/lib/repair-service";
import { getVehicleById } from "@/lib/vehicle-service";
import RepairForm from "@/components/repair-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RepairDetailsProps } from "@/components/repair-details";
export default async function EditRepairPage({
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
    redirect("/");
  }

  const vehicle = await getVehicleById(repair.vehicleId);

  if (!vehicle || vehicle.userId !== userId) {
    redirect("/");
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
