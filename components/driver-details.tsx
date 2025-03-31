"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Driver, DriverItem, Vehicle } from "@/lib/types";
import Image from "next/image";
import { Plus, Pencil, Trash2, UserX } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DriverForm from "./driver-form";
import ItemForm from "./item-form";
import { deleteDriver, deleteDriverItem } from "@/lib/driver-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DriverDetails() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const router = useRouter();
  const { toast } = useToast();
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DriverItem | null>(null);
  const [driver, setDriver] = useState<Driver | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        if (!vehicleId) return;

        const response = await fetch(`/api/vehicles?vehicleId=${vehicleId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vehicle");
        }

        const data: Vehicle = await response.json();
        setDriver(data.driver);
      } catch (error) {
        console.error("Error fetching vehicle driver:", error);
        toast({
          title: "Error",
          description: "Failed to load driver details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVehicle();
  }, [vehicleId, toast]);

  const handleDeleteDriver = async () => {
    try {
      if (!vehicleId) return;
      await deleteDriver(vehicleId);
      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });
      router.refresh();
      setDriver(undefined);
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast({
        title: "Error",
        description: "Failed to delete driver",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (!vehicleId) return;
      await deleteDriverItem(vehicleId, itemId);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      // Refresh driver data after deletion
      const response = await fetch(`/api/vehicles?vehicleId=${vehicleId}`);
      if (response.ok) {
        const data: Vehicle = await response.json();
        setDriver(data.driver);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: DriverItem) => {
    setSelectedItem(item);
    setIsItemDialogOpen(true);
  };

  if (loading) {
    return <div>Loading driver details...</div>;
  }

  if (!driver) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Driver Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <p className="mb-4">No driver assigned to this vehicle yet.</p>
            <Dialog
              open={isDriverDialogOpen}
              onOpenChange={setIsDriverDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>Add Driver</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Driver</DialogTitle>
                  <DialogDescription>
                    Enter the driver details for this vehicle.
                  </DialogDescription>
                </DialogHeader>
                <DriverForm
                  vehicleId={vehicleId || ""}
                  onSuccess={() => {
                    setIsDriverDialogOpen(false);
                    const fetchUpdatedVehicle = async () => {
                      const response = await fetch(
                        `/api/vehicles?vehicleId=${vehicleId}`
                      );
                      if (response.ok) {
                        const data: Vehicle = await response.json();
                        setDriver(data.driver);
                      }
                    };
                    fetchUpdatedVehicle();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Driver Details</CardTitle>
          <div className="flex gap-2">
            <Dialog
              open={isDriverDialogOpen}
              onOpenChange={setIsDriverDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Driver</DialogTitle>
                  <DialogDescription>
                    Update the driver details for this vehicle.
                  </DialogDescription>
                </DialogHeader>
                <DriverForm
                  vehicleId={vehicleId || ""}
                  driver={driver}
                  onSuccess={() => {
                    setIsDriverDialogOpen(false);
                    const fetchUpdatedVehicle = async () => {
                      const response = await fetch(
                        `/api/vehicles?vehicleId=${vehicleId}`
                      );
                      if (response.ok) {
                        const data: Vehicle = await response.json();
                        setDriver(data.driver);
                      }
                    };
                    fetchUpdatedVehicle();
                  }}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UserX className="h-4 w-4" />
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the driver and all assigned
                    items from this vehicle. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteDriver}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </h3>
                <p className="text-lg font-semibold">{driver.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone Number
                </h3>
                <p className="text-lg font-semibold">{driver.phoneNumber}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Aadhar Card
                </h3>
                {driver.aadharImage ? (
                  <div className="relative h-32 w-full mt-2 border rounded-md overflow-hidden">
                    <Image
                      src={driver.aadharImage || "/placeholder.svg"}
                      alt="Aadhar Card"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No image uploaded</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  PAN Card
                </h3>
                {driver.panCardImage ? (
                  <div className="relative h-32 w-full mt-2 border rounded-md overflow-hidden">
                    <Image
                      src={driver.panCardImage || "/placeholder.svg"}
                      alt="PAN Card"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No image uploaded</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items Given to Driver</CardTitle>
          <Dialog
            open={isItemDialogOpen}
            onOpenChange={(open) => {
              setIsItemDialogOpen(open);
              if (!open) setSelectedItem(null);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedItem ? "Edit Item" : "Add Item"}
                </DialogTitle>
                <DialogDescription>
                  {selectedItem
                    ? "Update the item details."
                    : "Enter details for the item given to the driver."}
                </DialogDescription>
              </DialogHeader>
              <ItemForm
                vehicleId={vehicleId || ""}
                item={selectedItem || undefined}
                onSuccess={() => {
                  setIsItemDialogOpen(false);
                  setSelectedItem(null);
                  router.refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {driver.itemsGiven && driver.itemsGiven.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Given Date</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.itemsGiven.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        {item.itemName}
                      </TableCell>
                      <TableCell>
                        {new Date(item.givenDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {item.itemImage ? (
                          <div className="relative h-12 w-12 rounded-md overflow-hidden">
                            <Image
                              src={item.itemImage || "/placeholder.svg"}
                              alt={item.itemName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No image</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditItem(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this item.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItem(item._id!)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No items given to this driver yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
