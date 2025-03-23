import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getVehicleById } from "@/lib/vehicle-service";
import VehicleDetails, {
  VehicleDetailsProps,
} from "@/components/vehicle-details";
import RepairList from "@/components/repair-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VehicleDetailPage({
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
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Vehicle Not Found</h1>
        <Link href="/">
          <Button>Back to Vehicles</Button>
        </Link>
      </div>
    );
  }

  // Check if the vehicle belongs to the current user
  if (vehicle.userId !== userId) {
    redirect("/");
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

      <RepairList vehicleId={params.vehicleId} />
    </div>
  );
}
