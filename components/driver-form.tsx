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
});

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: driver?.name || "",
      phoneNumber: driver?.phoneNumber || "",
    },
  });

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setAadharFile, setAadharPreview);
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setPanFile, setPanPreview);
  };

  const clearAadharImage = () => {
    setAadharFile(null);
    setAadharPreview(null);
  };

  const clearPanImage = () => {
    setPanFile(null);
    setPanPreview(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      let aadharImageUrl = driver?.aadharImage || "";
      let panCardImageUrl = driver?.panCardImage || "";

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

      const driverData = {
        ...values,
        aadharImage: aadharImageUrl,
        panCardImage: panCardImageUrl,
        itemsGiven: driver?.itemsGiven || [],
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
