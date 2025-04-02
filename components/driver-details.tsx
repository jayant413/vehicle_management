"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Driver, DriverItem, Vehicle } from "@/lib/types";
import Image from "next/image";
import { Plus, Pencil, Trash2, UserX, Download } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import html2canvas from "html2canvas";

export default function DriverDetails() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const router = useRouter();
  const { toast } = useToast();
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DriverItem | null>(null);
  const [driver, setDriver] = useState<Driver | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [vehicleName, setVehicleName] = useState<string>("");
  const [vehicleNumber, setVehicleNumber] = useState<string>("");

  async function fetchVehicle() {
    try {
      if (!vehicleId) return;

      const response = await fetch(`/api/vehicles?vehicleId=${vehicleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle");
      }

      const data: Vehicle = await response.json();
      setDriver(data.driver);
      setVehicleName(data.name || "");
      setVehicleNumber(data.vehicleNumber || "");
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
  useEffect(() => {
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

  const generatePDF = async () => {
    if (!driver) return;

    setGeneratingPdf(true);
    try {
      const pdf = new jsPDF();

      // Set up PDF document properties
      pdf.setProperties({
        title: `Driver Details - ${driver.name}`,
        author: "Fleet Management System",
        subject: "Driver Details",
        keywords: "driver, fleet, details",
      });

      // Add title
      pdf.setFontSize(20);
      pdf.text("Driver Details", 105, 15, { align: "center" });

      // Add driver details
      pdf.setFontSize(12);
      pdf.text(`Name: ${driver.name}`, 20, 30);
      pdf.text(`Phone: ${driver.phoneNumber || "N/A"}`, 20, 40);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

      // Add vehicle details
      pdf.text(`Vehicle Name: ${vehicleName || "N/A"}`, 20, 60);
      pdf.text(`Vehicle Number: ${vehicleNumber || "N/A"}`, 20, 70);

      // Create table with items
      if (driver.itemsGiven && driver.itemsGiven.length > 0) {
        pdf.text("Items Given to Driver", 20, 85);

        // Prepare table data
        const tableColumn = ["Item Name", "Quantity", "Given Date"];
        const tableRows = driver.itemsGiven.map((item) => [
          item.itemName || "N/A",
          item.quantity?.toString() || "0",
          new Date(item.givenDate).toLocaleDateString() || "N/A",
        ]);

        // Add the table
        autoTable(pdf, {
          head: [tableColumn],
          body: tableRows,
          startY: 90,
          theme: "striped",
          headStyles: { fillColor: [41, 128, 185] },
        });
      } else {
        pdf.text("No items given to this driver.", 20, 85);
      }

      // Save the PDF
      pdf.save(`${driver.name}_Driver_Details.pdf`);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(false);
    }
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
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={generatePDF}
              disabled={generatingPdf}
            >
              <Download className="h-4 w-4" />
              {generatingPdf ? "Generating..." : "Download PDF"}
            </Button>

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
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
          <div className="flex flex-col items-center mb-6">
            {driver.driverImage ? (
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-primary mb-4">
                <Image
                  src={driver.driverImage}
                  alt="Driver Photo"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">No Photo</span>
              </div>
            )}
            <h2 className="text-2xl font-bold">{driver.name}</h2>
            <p className="text-lg text-gray-500">{driver.phoneNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Aadhar Card
              </h3>
              {driver.aadharImage ? (
                <div className="relative h-32 w-full border rounded-md overflow-hidden">
                  <Image
                    src={driver.aadharImage}
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
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                PAN Card
              </h3>
              {driver.panCardImage ? (
                <div className="relative h-32 w-full border rounded-md overflow-hidden">
                  <Image
                    src={driver.panCardImage}
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

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              License
            </h3>
            {driver.licenseImage ? (
              <div className="relative h-40 w-full border rounded-md overflow-hidden">
                <Image
                  src={driver.licenseImage}
                  alt="Driver License"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <p className="text-gray-400 italic">No license uploaded</p>
            )}
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
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
                  fetchVehicle();
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
                    <TableHead>Quantity</TableHead>
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
                      <TableCell>{item.quantity || 0}</TableCell>
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
