"use client";

import type React from "react";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Driver } from "@/lib/types";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { addDriver, updateDriver } from "@/lib/driver-actions";
import { handleFileChange } from "@/lib/file-utils";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Please enter a valid phone number" }),
  joiningDate: z.string().optional(),
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  address: z.string().optional(),
});

// Default inventory items from the logistics form
const defaultInventoryItems = [
  { itemName: "TRIPAL BIG", quantity: 0 },
  { itemName: "TRIPAL SMALL", quantity: 0 },
  { itemName: "SCRAP TRIPAL", quantity: 0 },
  { itemName: "CHAIN", quantity: 0 },
  { itemName: "BATLA", quantity: 0 },
  { itemName: "D", quantity: 0 },
  { itemName: "BELT", quantity: 0 },
  { itemName: "FASTAG", quantity: 0 },
  { itemName: "DIESEL CARD", quantity: 0 },
  { itemName: "GPS", quantity: 0 },
  { itemName: "JACK", quantity: 0 },
  { itemName: "BIG TOMMY", quantity: 0 },
  { itemName: "WHEEL SPANNER", quantity: 0 },
  { itemName: "ROPE", quantity: 0 },
  { itemName: "RADIUM", quantity: 0 },
  { itemName: "NUMBER PLATE", quantity: 0 },
  { itemName: "JACKET", quantity: 0 },
  { itemName: "SHOES", quantity: 0 },
  { itemName: "HELMET", quantity: 0 },
  { itemName: "BATTERY BOX", quantity: 0 },
  { itemName: "BUMPER STAND", quantity: 0 },
  { itemName: "WOODEN BIG RAFTER", quantity: 0 },
  { itemName: "WOODEN SMALL RAFTER", quantity: 0 },
  { itemName: "WOODEN COIL RAFTER", quantity: 0 },
  { itemName: "RIB RUBBER", quantity: 0 },
  { itemName: "SADDLE", quantity: 0 },
  { itemName: "SCOTCH BLOCK", quantity: 0 },
];

interface DriverFormProps {
  vehicleId: string;
  driver?: Driver;
  onSuccess: () => void;
}

export default function DriverForm({
  vehicleId,
  driver,
  onSuccess,
}: DriverFormProps) {
  const { toast } = useToast();
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string | null>(
    driver?.aadharImage || null
  );
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(
    driver?.panCardImage || null
  );
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(
    driver?.licenseImage || null
  );
  const [driverPhotoFile, setDriverPhotoFile] = useState<File | null>(null);
  const [driverPhotoPreview, setDriverPhotoPreview] = useState<string | null>(
    driver?.driverImage || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: driver?.name || "",
      phoneNumber: driver?.phoneNumber || "",
      joiningDate: driver?.joiningDate || "",
      panNumber: driver?.panNumber || "",
      aadharNumber: driver?.aadharNumber || "",
      licenseNumber: driver?.licenseNumber || "",
      address: driver?.address || "",
    },
  });

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setAadharFile, setAadharPreview);
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setPanFile, setPanPreview);
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setLicenseFile, setLicensePreview);
  };

  const handleDriverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setDriverPhotoFile, setDriverPhotoPreview);
  };

  const clearAadharImage = () => {
    setAadharFile(null);
    setAadharPreview(null);
  };

  const clearPanImage = () => {
    setPanFile(null);
    setPanPreview(null);
  };

  const clearLicenseImage = () => {
    setLicenseFile(null);
    setLicensePreview(null);
  };

  const clearDriverPhotoImage = () => {
    setDriverPhotoFile(null);
    setDriverPhotoPreview(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      let aadharImageUrl = driver?.aadharImage || "";
      let panCardImageUrl = driver?.panCardImage || "";
      let licenseImageUrl = driver?.licenseImage || "";
      let driverImageUrl = driver?.driverImage || "";

      if (aadharFile) {
        const formData = new FormData();
        formData.append("file", aadharFile);
        formData.append("upload_preset", "feetTrack");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dsmcoe91p/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload Aadhar image");
        }

        const data = await response.json();
        aadharImageUrl = data.secure_url;
      }

      if (panFile) {
        const formData = new FormData();
        formData.append("file", panFile);
        formData.append("upload_preset", "feetTrack");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dsmcoe91p/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload PAN image");
        }

        const data = await response.json();
        panCardImageUrl = data.secure_url;
      }

      if (licenseFile) {
        const formData = new FormData();
        formData.append("file", licenseFile);
        formData.append("upload_preset", "feetTrack");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dsmcoe91p/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload License image");
        }

        const data = await response.json();
        licenseImageUrl = data.secure_url;
      }

      if (driverPhotoFile) {
        const formData = new FormData();
        formData.append("file", driverPhotoFile);
        formData.append("upload_preset", "feetTrack");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dsmcoe91p/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload Driver photo");
        }

        const data = await response.json();
        driverImageUrl = data.secure_url;
      }

      const driverData = {
        ...values,
        aadharImage: aadharImageUrl,
        panCardImage: panCardImageUrl,
        licenseImage: licenseImageUrl,
        driverImage: driverImageUrl,
        // Use existing items or initialize with default items with 0 quantity
        itemsGiven:
          driver?.itemsGiven ||
          defaultInventoryItems.map((item) => ({
            _id: new Date().getTime() + Math.random().toString(36).substr(2, 9),
            itemName: item.itemName,
            quantity: item.quantity,
            itemImage: "", // Empty string for image initially
            givenDate: new Date().toISOString(),
          })),
      };

      if (driver) {
        await updateDriver(vehicleId, driverData);
        toast({
          title: "Success",
          description: "Driver updated successfully",
        });
      } else {
        await addDriver(vehicleId, driverData);
        toast({
          title: "Success",
          description: "Driver added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving driver:", error);
      toast({
        title: "Error",
        description: "Failed to save driver details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3 w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter driver name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="joiningDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Joining Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="panNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PAN number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aadharNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhar Card Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Aadhar card number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driving License Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter driving license number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="driverImage">Driver Photo</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("driverImage")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {driverPhotoPreview ? "Change Image" : "Upload Image"}
              </Button>
              <Input
                id="driverImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleDriverPhotoChange}
              />
              {driverPhotoPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={clearDriverPhotoImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {driverPhotoPreview && (
              <div className="relative h-40 w-full mt-4 border rounded-md overflow-hidden">
                <Image
                  src={driverPhotoPreview || "/placeholder.svg"}
                  alt="Driver photo preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadharImage">Aadhar Card Image</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("aadharImage")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {aadharPreview ? "Change Image" : "Upload Image"}
              </Button>
              <Input
                id="aadharImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAadharChange}
              />
              {aadharPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={clearAadharImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {aadharPreview && (
              <div className="relative h-40 w-full mt-4 border rounded-md overflow-hidden">
                <Image
                  src={aadharPreview || "/placeholder.svg"}
                  alt="Aadhar preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="panImage">PAN Card Image</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("panImage")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {panPreview ? "Change Image" : "Upload Image"}
              </Button>
              <Input
                id="panImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePanChange}
              />
              {panPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={clearPanImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {panPreview && (
              <div className="relative h-40 w-full mt-4 border rounded-md overflow-hidden">
                <Image
                  src={panPreview || "/placeholder.svg"}
                  alt="PAN preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseImage">Driver License Image</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("licenseImage")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {licensePreview ? "Change Image" : "Upload Image"}
              </Button>
              <Input
                id="licenseImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLicenseChange}
              />
              {licensePreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={clearLicenseImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {licensePreview && (
              <div className="relative h-40 w-full mt-4 border rounded-md overflow-hidden">
                <Image
                  src={licensePreview || "/placeholder.svg"}
                  alt="License preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : driver
              ? "Update Driver"
              : "Add Driver"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
