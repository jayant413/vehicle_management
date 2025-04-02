"use client";

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
import type { Tyre } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { addTyre, updateTyre } from "@/lib/tyre-actions";

const formSchema = z.object({
  tyreNumber: z
    .string()
    .min(2, { message: "Tyre number must be at least 2 characters" }),
  description: z.string().min(1, { message: "Description is required" }),
  installedDate: z
    .string()
    .min(1, { message: "Installation date is required" }),
});

interface TyreFormProps {
  vehicleId: string;
  tyre?: Tyre;
  onSuccess: () => void;
}

export default function TyreForm({
  vehicleId,
  tyre,
  onSuccess,
}: TyreFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tyreNumber: tyre?.tyreNumber || "",
      description: tyre?.description || "",
      installedDate: tyre?.installedDate
        ? new Date(tyre.installedDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const tyreData = {
        ...values,
      };

      if (tyre && tyre._id) {
        await updateTyre(vehicleId, tyre._id, tyreData);
        toast({
          title: "Success",
          description: "Tyre updated successfully",
        });
      } else {
        await addTyre(vehicleId, tyreData);
        toast({
          title: "Success",
          description: "Tyre added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving tyre:", error);
      toast({
        title: "Error",
        description: "Failed to save tyre details",
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
          name="tyreNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tyre Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter tyre number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter tyre description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="installedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Installation Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : tyre ? "Update Tyre" : "Add Tyre"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
