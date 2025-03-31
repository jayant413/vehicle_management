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
import { createRepair, updateRepair } from "@/lib/repair-actions";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { handleFileChange } from "@/lib/file-utils";

const formSchema = z.object({
  repairDate: z.string().min(1, { message: "Repair date is required" }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be a positive number" }),
  toolName: z
    .string()
    .min(2, { message: "Tool name must be at least 2 characters" }),
});

interface RepairFormProps {
  vehicleId?: string;
  repair?: {
    _id: string;
    vehicleId: string;
    repairDate: string;
    amount: number;
    toolName: string;
    toolImageUrl: string;
  };
}

export default function RepairForm({ vehicleId, repair }: RepairFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    repair?.toolImageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repairDate: repair?.repairDate
        ? new Date(repair.repairDate).toISOString().split("T")[0]
        : "",
      amount: repair?.amount || 0,
      toolName: repair?.toolName || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setImageFile, setImagePreview);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      let toolImageUrl = repair?.toolImageUrl || "";

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

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        toolImageUrl = data.secure_url;
      }

      if (repair) {
        // Update existing repair
        await updateRepair(repair._id, {
          ...values,
          toolImageUrl: toolImageUrl || repair.toolImageUrl,
        });
        toast({
          title: "Success",
          description: "Repair details updated successfully",
        });
        router.push(`/repair/${repair._id}`);
      } else if (vehicleId) {
        // Create new repair
        await createRepair({
          ...values,
          vehicleId,
          toolImageUrl,
        });
        toast({
          title: "Success",
          description: "Repair details added successfully",
        });
        router.push(`/vehicle/${vehicleId}`);
      }

      router.refresh();
    } catch (error) {
      console.error("Error saving repair details:", error);
      toast({
        title: "Error",
        description: "Failed to save repair details",
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
              name="repairDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repair Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter quantity"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tool name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="image">Tool Image</Label>
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
                    alt="Tool preview"
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
                  : repair
                  ? "Update Repair"
                  : "Add Repair"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
