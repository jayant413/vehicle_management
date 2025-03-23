import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getVehicleById } from "@/lib/vehicle-service";
import VehicleForm from "@/components/vehicle-form";

export default async function EditVehiclePage({
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
      <h1 className="text-3xl font-bold mb-8">Edit Vehicle</h1>
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
