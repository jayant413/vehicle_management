"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Tyre, Vehicle } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
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
} from "@/components/ui/dialog";
import TyreForm from "./tyre-form";
import { deleteTyre } from "@/lib/tyre-actions";
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
import { Button } from "./ui/button";

export default function TyreList() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const { toast } = useToast();
  const [isTyreDialogOpen, setIsTyreDialogOpen] = useState(false);
  const [selectedTyre, setSelectedTyre] = useState<Tyre | null>(null);
  const [tyres, setTyres] = useState<Tyre[]>([]);
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
        setTyres(data.tyres || []);
      } catch (error) {
        console.error("Error fetching vehicle tyres:", error);
        toast({
          title: "Error",
          description: "Failed to load tyre details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVehicle();
  }, [vehicleId, toast]);

  const handleDeleteTyre = async (tyreId: string) => {
    try {
      if (!vehicleId) return;
      await deleteTyre(vehicleId, tyreId);
      toast({
        title: "Success",
        description: "Tyre deleted successfully",
      });

      // Remove from local state
      setTyres(tyres.filter((tyre) => tyre._id !== tyreId));
    } catch (error) {
      console.error("Error deleting tyre:", error);
      toast({
        title: "Error",
        description: "Failed to delete tyre",
        variant: "destructive",
      });
    }
  };

  const handleEditTyre = (tyre: Tyre) => {
    setSelectedTyre(tyre);
    setIsTyreDialogOpen(true);
  };

  const handleTyreUpdated = async () => {
    setIsTyreDialogOpen(false);
    setSelectedTyre(null);

    // Refetch the data
    try {
      const response = await fetch(`/api/vehicles?vehicleId=${vehicleId}`);
      if (response.ok) {
        const data: Vehicle = await response.json();
        setTyres(data.tyres || []);
      }
    } catch (error) {
      console.error("Error refetching tyres:", error);
    }
  };

  if (loading) {
    return <div>Loading tyre details...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {tyres.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tyre Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Installation Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tyres.map((tyre) => (
                    <TableRow key={tyre._id}>
                      <TableCell className="font-medium">
                        {tyre.tyreNumber}
                      </TableCell>
                      <TableCell>{tyre.description}</TableCell>
                      <TableCell>
                        {new Date(tyre.installedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditTyre(tyre)}
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
                                  This will permanently delete this tyre.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTyre(tyre._id!)}
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
                No tyres added yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isTyreDialogOpen}
        onOpenChange={(open) => {
          setIsTyreDialogOpen(open);
          if (!open) setSelectedTyre(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTyre ? "Edit Tyre" : "Add Tyre"}</DialogTitle>
            <DialogDescription>
              {selectedTyre
                ? "Update the tyre details."
                : "Enter details for the new tyre."}
            </DialogDescription>
          </DialogHeader>
          <TyreForm
            vehicleId={vehicleId || ""}
            tyre={selectedTyre || undefined}
            onSuccess={handleTyreUpdated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
