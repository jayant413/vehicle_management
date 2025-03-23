import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import VehicleForm from "@/components/vehicle-form";

export default async function AddVehiclePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Add New Vehicle</h1>
      <VehicleForm />
    </div>
  );
}
