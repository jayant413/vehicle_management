"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Driver, DriverItem, Vehicle } from "@/lib/types";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  UserX,
  Download,
  Save,
  X,
  Eye,
  Printer,
} from "lucide-react";
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
import ItemForm from "./item-form";
import {
  deleteDriver,
  deleteDriverItem,
  updateDriverItem,
} from "@/lib/driver-actions";
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
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { ContentNode } from "react-to-print/lib/types/ContentNode";
import html2canvas from "html2canvas";
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
  const [isTableEditing, setIsTableEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<
    Record<string, { itemName: string; quantity: number; givenDate: string }>
  >({});
  const [isPending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = useReactToPrint({
    contentRef: printRef as unknown as React.MutableRefObject<ContentNode>,
    documentTitle: driver ? `${driver.name}_Driver_Details` : "Driver_Details",
  });

  const generatePDF = async () => {
    if (!driver || !printRef.current) return;

    setGeneratingPdf(true);
    try {
      // Create a clone of the printRef element to avoid modifying the original
      const element = printRef.current;

      // Use html2canvas to capture the element as an image
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
        logging: false, // Disable logging
        allowTaint: true, // Allow tainted canvas
      });

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Get the image data
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Get the PDF page dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate the aspect ratio of the canvas
      const canvasAspectRatio = canvas.width / canvas.height;

      // Calculate dimensions to fit the content on the page while maintaining aspect ratio
      let imgWidth = pdfWidth;
      let imgHeight = imgWidth / canvasAspectRatio;

      // If the height is too large, scale down based on height
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = imgHeight * canvasAspectRatio;
      }

      // Center the image on the page
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      // Add the image to the PDF
      pdf.addImage(imgData, "JPEG", xOffset, yOffset, imgWidth, imgHeight);

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

  const handleTableEdit = () => {
    if (!driver?.itemsGiven) return;

    // Initialize edited items with current values
    const initialEditedItems: Record<
      string,
      { itemName: string; quantity: number; givenDate: string }
    > = {};

    driver.itemsGiven.forEach((item) => {
      if (item._id) {
        initialEditedItems[item._id] = {
          itemName: item.itemName || "",
          quantity: Number(item.quantity) || 0,
          givenDate: new Date(item.givenDate).toISOString().split("T")[0],
        };
      }
    });

    setEditedItems(initialEditedItems);
    setIsTableEditing(true);
  };

  const handleTableSave = async () => {
    try {
      if (!vehicleId || !driver?.itemsGiven) return;

      // Process all edited items
      const updatePromises = Object.entries(editedItems).map(
        async ([itemId, editedItem]) => {
          const originalItem = driver.itemsGiven?.find(
            (item) => item._id === itemId
          );
          if (!originalItem) return;

          // Create updated item object
          const updatedItem = {
            ...originalItem,
            itemName: editedItem.itemName,
            quantity: editedItem.quantity,
            givenDate: new Date(editedItem.givenDate).toISOString(),
          };

          // Use the updateDriverItem function from driver-actions.ts
          return updateDriverItem(vehicleId, itemId, updatedItem);
        }
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Refresh driver data after all updates
      fetchVehicle();

      // Reset editing state
      setIsTableEditing(false);
      setEditedItems({});

      toast({
        title: "Success",
        description: "All items updated successfully",
      });
    } catch (error) {
      console.error("Error updating items:", error);
      toast({
        title: "Error",
        description: "Failed to update some items",
        variant: "destructive",
      });
    }
  };

  const handleTableSaveWithTransition = () => {
    startTransition(async () => {
      await handleTableSave();
    });
  };

  const handleTableCancel = () => {
    setIsTableEditing(false);
    setEditedItems({});
  };

  const handleItemFieldChange = (
    itemId: string,
    field: "itemName" | "quantity" | "givenDate",
    value: string | number
  ) => {
    setEditedItems((prev) => {
      const updatedItem = { ...prev[itemId] };

      if (field === "quantity") {
        updatedItem.quantity = Number(value);
      } else if (field === "itemName" || field === "givenDate") {
        updatedItem[field] = String(value);
      }

      return {
        ...prev,
        [itemId]: updatedItem,
      };
    });
  };

  // Custom function to format date as "2nd April 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    // Add ordinal suffix to day (1st, 2nd, 3rd, etc.)
    let dayWithSuffix: String = String(day);
    if (day >= 11 && day <= 13) {
      dayWithSuffix = day + "th";
    } else {
      switch (day % 10) {
        case 1:
          dayWithSuffix = day + "st";
          break;
        case 2:
          dayWithSuffix = day + "nd";
          break;
        case 3:
          dayWithSuffix = day + "rd";
          break;
        default:
          dayWithSuffix = day + "th";
      }
    }

    return `${day} ${month} ${year}`;
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
            <Link href={`/vehicle/${vehicleId}/add-driver`}>
              <Button>Add Driver</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex md:flex-row items-center justify-between">
          <CardTitle>Driver Details</CardTitle>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => handlePrint()}
              disabled={generatingPdf}
            >
              <Printer className="h-4 w-4" />
              {generatingPdf ? "Generating..." : "Print Details"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flexs items-center gap-2 hidden"
              onClick={generatePDF}
              disabled={generatingPdf}
            >
              <Download className="h-4 w-4" />
              {generatingPdf ? "Generating..." : "Download PDF"}
            </Button>

            <Link href={`/vehicle/${vehicleId}/edit-driver`}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className=" md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                <p>
                  <span className="font-medium">Joining Date:</span>{" "}
                  {driver.joiningDate
                    ? new Date(driver.joiningDate).toLocaleDateString()
                    : "Not provided"}
                </p>
                <p>
                  <span className="font-medium">PAN Number:</span>{" "}
                  {driver.panNumber || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Aadhar Number:</span>{" "}
                  {driver.aadharNumber || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">License Number:</span>{" "}
                  {driver.licenseNumber || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {driver.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Aadhar Card
              </h3>
              {driver.aadharImage ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setPreviewImage(driver.aadharImage);
                      setPreviewTitle("Aadhar Card");
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View Aadhar
                  </Button>
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
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setPreviewImage(driver.panCardImage);
                      setPreviewTitle("PAN Card");
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View PAN
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400 italic">No image uploaded</p>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                License
              </h3>
              {driver.licenseImage ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setPreviewImage(driver.licenseImage);
                      setPreviewTitle("Driver License");
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View License
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400 italic">No license uploaded</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Driver Signature
              </h3>
              {driver.signatureImage ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setPreviewImage(driver.signatureImage || null);
                      setPreviewTitle("Driver Signature");
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View Signature
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400 italic">No signature uploaded</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items Given to Driver</CardTitle>
          <div className="flex gap-2">
            {isTableEditing ? (
              <>
                <Button
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleTableSaveWithTransition}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save All
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleTableCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleTableEdit}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Table
                </Button>
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
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {driver.itemsGiven && driver.itemsGiven.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Given Date</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.itemsGiven.map((item, index) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {isTableEditing ? (
                          <input
                            type="text"
                            value={editedItems[item._id!]?.itemName || ""}
                            onChange={(e) =>
                              handleItemFieldChange(
                                item._id!,
                                "itemName",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          item.itemName
                        )}
                      </TableCell>
                      <TableCell>
                        {isTableEditing ? (
                          <input
                            type="number"
                            value={editedItems[item._id!]?.quantity || 0}
                            onChange={(e) =>
                              handleItemFieldChange(
                                item._id!,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                            className="w-16 px-2 py-1 border rounded"
                            min="0"
                          />
                        ) : (
                          item.quantity || 0
                        )}
                      </TableCell>
                      <TableCell>
                        {isTableEditing ? (
                          <input
                            type="date"
                            value={editedItems[item._id!]?.givenDate || ""}
                            onChange={(e) =>
                              handleItemFieldChange(
                                item._id!,
                                "givenDate",
                                e.target.value
                              )
                            }
                            className="px-2 py-1 border rounded"
                          />
                        ) : (
                          formatDate(item.givenDate)
                        )}
                      </TableCell>
                      <TableCell>
                        {item.itemImage ? (
                          <div
                            className="relative h-12 w-12 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewImage(item.itemImage)}
                          >
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
                          {!isTableEditing && (
                            <>
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
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteItem(item._id!)
                                      }
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
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

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewTitle || "Item Image"}</DialogTitle>
          </DialogHeader>
          <div className="relative h-[500px] w-full rounded-md overflow-hidden">
            {previewImage && (
              <Image
                src={previewImage}
                alt={previewTitle || "Preview"}
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Printable Component - Hidden from normal view */}
      <div className="hidden">
        <div ref={printRef} className="p-8">
          <h1 className="text-4xl font-bold mb-4">Driver Details</h1>
          <div className="grid grid-cols-2 gap-4">
            {/* Left side - Driver details */}
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    <p>
                      <span className="font-medium">Name:</span> {driver.name}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {driver.phoneNumber || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Joining Date:</span>{" "}
                      {driver.joiningDate
                        ? new Date(driver.joiningDate).toLocaleDateString()
                        : "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">PAN Number:</span>{" "}
                      {driver.panNumber || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Aadhar Number:</span>{" "}
                      {driver.aadharNumber || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">License Number:</span>{" "}
                      {driver.licenseNumber || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {driver.address || "Not provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Vehicle Information
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    <p>
                      <span className="font-medium">Vehicle Name:</span>{" "}
                      {vehicleName || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Vehicle Number:</span>{" "}
                      {vehicleNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Driver image and signature */}
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Driver Photo</h2>
                {driver.driverImage ? (
                  <div className="relative h-48 w-48 border rounded-md overflow-hidden">
                    <img
                      src={driver.driverImage}
                      alt="Driver Photo"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-48 border rounded-md bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Photo</span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Driver Signature</h2>
                {driver.signatureImage ? (
                  <div className="relative h-32 w-64 border rounded-md overflow-hidden">
                    <img
                      src={driver.signatureImage}
                      alt="Driver Signature"
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-64 border rounded-md bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Signature</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Items Given to Driver
            </h2>
            {driver.itemsGiven && driver.itemsGiven.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">
                      S.No
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Item Name
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Quantity
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Given Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {driver.itemsGiven.map((item, index) => (
                    <tr key={item._id}>
                      <td className="border border-gray-300 p-2">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.itemName}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.quantity || 0}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {formatDate(item.givenDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 italic">
                No items given to this driver yet.
              </p>
            )}
          </div>

          <div className="mt-8 text-right text-sm text-gray-500">
            <p>Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
