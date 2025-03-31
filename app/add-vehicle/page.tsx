import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import VehicleForm from "@/components/vehicle-form";

export default async function AddVehiclePage() {
  let { userId } = await auth();

if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
  userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb"
}

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
