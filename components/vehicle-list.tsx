"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteVehicle } from "@/lib/vehicle-actions";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle } from "@/lib/types";
import { Input } from "./ui/input";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const response = await fetch("/api/vehicles");
        if (!response.ok) {
          throw new Error("Failed to fetch vehicles");
        }
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast({
          title: "Error",
          description: "Failed to load vehicles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, [toast]);

  useEffect(() => {
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.driver?.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [search, vehicles]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle(id);
        setVehicles(vehicles.filter((vehicle) => vehicle._id !== id));
        toast({
          title: "Success",
          description: "Vehicle deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        toast({
          title: "Error",
          description: "Failed to delete vehicle",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading vehicles...</div>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">No vehicles found. Add your first vehicle!</p>
        <Link href="/add-vehicle">
          <Button>Add Vehicle</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Input
        placeholder="Search By Vehicle Number or Driver Name"
        className="mb-4 w-full md:w-[30em]"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle._id} className="overflow-hidden">
            <Link href={`/vehicle/${vehicle._id}`}>
              <div className="relative h-48 w-full">
                <Image
                  src={
                    vehicle.imageUrl || "/placeholder.svg?height=200&width=400"
                  }
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-2">{vehicle.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  <span className="font-semibold">Driver Name:</span>{" "}
                  <span className="text-blue-600 font-semibold dark:text-gray-400">
                    {vehicle.driver?.name || "--"}
                  </span>
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  <span className="font-semibold">Driver Number:</span>{" "}
                  {vehicle.driver?.phoneNumber || "--"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Vehicle Number:</span>{" "}
                  {vehicle.vehicleNumber}
                </p>
              </CardContent>
            </Link>
            <CardFooter className="flex flex-wrap gap-2 p-6 pt-0">
              <Link href={`/vehicle/${vehicle._id}`}>
                <Button>View Details</Button>
              </Link>
              <Link href={`/vehicle/${vehicle._id}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {vehicle.driver ? "View Driver" : "Add Driver"}
                </Button>
              </Link>
              <div className="flex gap-2 mt-2 w-full">
                <Link href={`/vehicle/${vehicle._id}/edit`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => handleDelete(vehicle._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
