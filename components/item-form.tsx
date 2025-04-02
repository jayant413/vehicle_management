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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { DriverItem } from "@/lib/types";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { addDriverItem, updateDriverItem } from "@/lib/driver-actions";
import { handleFileChange } from "@/lib/file-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  itemName: z
    .string()
    .min(2, { message: "Item name must be at least 2 characters" }),
  givenDate: z.string().min(1, { message: "Given date is required" }),
  quantityMode: z.enum(["number", "toggle"]),
  quantity: z.string().min(0),
  toggleValue: z.boolean().optional(),
});

interface ItemFormProps {
  vehicleId: string;
  item?: DriverItem;
  onSuccess: () => void;
}

export default function ItemForm({
  vehicleId,
  item,
  onSuccess,
}: ItemFormProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.itemImage || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if the existing quantity is a toggle value
  const isToggleValue =
    item?.quantity !== undefined &&
    (item.quantity === 0 ||
      item.quantity === 1 ||
      String(item.quantity) === "OK" ||
      String(item.quantity) === "0");

  const defaultQuantityMode = isToggleValue ? "toggle" : "number";
  const defaultToggleValue =
    item?.quantity === 1 || String(item?.quantity || "") === "OK";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: item?.itemName || "",
      givenDate: item?.givenDate
        ? new Date(item.givenDate).toISOString().split("T")[0]
        : "",
      quantityMode: defaultQuantityMode,
      quantity: item?.quantity !== undefined ? String(item.quantity) : "0",
      toggleValue: defaultToggleValue,
    },
  });

  const watchQuantityMode = form.watch("quantityMode");

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
      let itemImageUrl = item?.itemImage || "";

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
        itemImageUrl = data.secure_url;
      }

      // Determine the quantity value based on the mode
      let finalQuantity: string | number = values.quantity;
      if (values.quantityMode === "toggle") {
        finalQuantity = values.toggleValue ? "OK" : "0";
      }

      const { quantityMode, toggleValue, ...rest } = values;
      const itemData = {
        ...rest,
        itemImage: itemImageUrl,
        quantity: finalQuantity,
      };

      if (item && item._id) {
        await updateDriverItem(vehicleId, item._id, itemData);
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        await addDriverItem(vehicleId, itemData);
        toast({
          title: "Success",
          description: "Item added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Error",
        description: "Failed to save item details",
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
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter item name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantityMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="number">Numeric Quantity</SelectItem>
                  <SelectItem value="toggle">Toggle (OK/Not OK)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchQuantityMode === "number" ? (
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Enter quantity"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="toggleValue"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Item Status</FormLabel>
                  <FormDescription>
                    {field.value ? "OK" : "Not OK"}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="givenDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Given Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="itemImage">Item Image</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("itemImage")?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {imagePreview ? "Change Image" : "Upload Image"}
            </Button>
            <Input
              id="itemImage"
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
            <div className="relative h-40 w-full mt-4 border rounded-md overflow-hidden">
              <Image
                src={imagePreview || "/placeholder.svg"}
                alt="Item preview"
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
            {isSubmitting ? "Saving..." : item ? "Update Item" : "Add Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
