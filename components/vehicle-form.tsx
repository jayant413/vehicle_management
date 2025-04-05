"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createVehicle, updateVehicle } from "@/lib/vehicle-actions";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { handleFileChange } from "@/lib/file-utils";
import { Vehicle } from "@/lib/types";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Vehicle name must be at least 2 characters" }),
  ownerName: z.string().optional(),
  vehicleNumber: z.string().min(2, { message: "Vehicle number is required" }),
});

export default function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    vehicle?.imageUrl || null
  );
  const [pucFile, setPucFile] = useState<File | null>(null);
  const [pucPreview, setPucPreview] = useState<string | null>(
    vehicle?.pucImage || null
  );
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [rcPreview, setRcPreview] = useState<string | null>(
    vehicle?.rcImage || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vehicle?.name || "",
      ownerName: vehicle?.ownerName || "",
      vehicleNumber: vehicle?.vehicleNumber || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setImageFile, setImagePreview);
  };

  const handlePucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setPucFile, setPucPreview);
  };

  const handleRcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setRcFile, setRcPreview);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const clearPucImage = () => {
    setPucFile(null);
    setPucPreview(null);
  };

  const clearRcImage = () => {
    setRcFile(null);
    setRcPreview(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      let imageUrl = vehicle?.imageUrl || "";
      let pucImageUrl = vehicle?.pucImage || "";
      let rcImageUrl = vehicle?.rcImage || "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "feetTrack");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dsmcoe91p/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        console.log(response);

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        imageUrl = data.secure_url;
      }

      if (pucFile) {
        const formData = new FormData();
        formData.append("file", pucFile);
        formData.append("upload_preset", "feetTrack");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dsmcoe91p/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload PUC image");
        }

        const data = await response.json();
        pucImageUrl = data.secure_url;
      }

      if (rcFile) {
        const formData = new FormData();
        formData.append("file", rcFile);
        formData.append("upload_preset", "feetTrack");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dsmcoe91p/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload RC image");
        }

        const data = await response.json();
        rcImageUrl = data.secure_url;
      }

      if (vehicle) {
        // Update existing vehicle
        await updateVehicle(vehicle._id, {
          ...values,
          imageUrl: imageUrl || vehicle.imageUrl,
          pucImage: pucImageUrl || vehicle.pucImage,
          rcImage: rcImageUrl || vehicle.rcImage,
        });
        toast({
          title: "Success",
          description: "Vehicle updated successfully",
        });
      } else {
        // Create new vehicle
        await createVehicle({
          ...values,
          imageUrl,
          pucImage: pucImageUrl,
          rcImage: rcImageUrl,
        });
        toast({
          title: "Success",
          description: "Vehicle added successfully",
        });
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast({
        title: "Error",
        description: "Failed to save vehicle",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vehicle name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="hidden">
              <FormField
                control={form.control}
                name="ownerName"
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
            </div>
            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vehicle number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="image">Vehicle Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {imagePreview && (
                <div className="relative h-48 w-full mt-4 border rounded-md overflow-hidden">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Vehicle preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pucImage">PUC Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("pucImage")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {pucPreview ? "Change Image" : "Upload Image"}
                </Button>
                <Input
                  id="pucImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePucChange}
                />
                {pucPreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={clearPucImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {pucPreview && (
                <div className="relative h-48 w-full mt-4 border rounded-md overflow-hidden">
                  <Image
                    src={pucPreview || "/placeholder.svg"}
                    alt="PUC preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rcImage">RC Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("rcImage")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {rcPreview ? "Change Image" : "Upload Image"}
                </Button>
                <Input
                  id="rcImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleRcChange}
                />
                {rcPreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={clearRcImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {rcPreview && (
                <div className="relative h-48 w-full mt-4 border rounded-md overflow-hidden">
                  <Image
                    src={rcPreview || "/placeholder.svg"}
                    alt="RC preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : vehicle
                  ? "Update Vehicle"
                  : "Add Vehicle"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
