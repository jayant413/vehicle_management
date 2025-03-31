import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import VehicleList from "@/components/vehicle-list";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default async function Home() {
  let { userId } = await auth();

  if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
    userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg dark:bg-slate-800">
          <h1 className="text-2xl font-bold text-center mb-6">
            Vehicle Management System
          </h1>
          <p className="text-center mb-6">Please log in to continue.</p>
          <div className="flex justify-center">
            <SignedOut>
              <Button className="mr-4">
                <SignInButton>Get Started</SignInButton>
              </Button>
            </SignedOut>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Feet Executive</h1>
        <div className="flex items-center space-x-4">
          <Link href="/add-vehicle">
            <Button>Add Vehicle</Button>
          </Link>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <VehicleList />
    </div>
  );
}
