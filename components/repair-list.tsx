"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, Save, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { deleteRepair, updateRepair } from "@/lib/repair-actions";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface Repair {
  _id: string;
  vehicleId: string;
  repairDate: string;
  amount: number;
  toolName: string;
  toolImageUrl: string;
}

export default function RepairList() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [isTableEditing, setIsTableEditing] = useState(false);
  const [editedRepairs, setEditedRepairs] = useState<
    Record<string, { repairDate: string; amount: number; toolName: string }>
  >({});
  const [isPending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  useEffect(() => {
    async function fetchRepairs() {
      if (!vehicleId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/repairs?vehicleId=${vehicleId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch repairs");
        }
        const data = await response.json();
        setRepairs(data);
      } catch (error) {
        console.error("Error fetching repairs:", error);
        toast({
          title: "Error",
          description: "Failed to load repair history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRepairs();
  }, [vehicleId, toast]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this repair record?")) {
      try {
        await deleteRepair(id);
        setRepairs(repairs.filter((repair) => repair._id !== id));
        toast({
          title: "Success",
          description: "Repair record deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting repair:", error);
        toast({
          title: "Error",
          description: "Failed to delete repair record",
          variant: "destructive",
        });
      }
    }
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

  const handleTableEdit = () => {
    if (!repairs || repairs.length === 0) return;

    // Initialize edited repairs with current values
    const initialEditedRepairs: Record<
      string,
      { repairDate: string; amount: number; toolName: string }
    > = {};

    repairs.forEach((repair) => {
      initialEditedRepairs[repair._id] = {
        repairDate: new Date(repair.repairDate).toISOString().split("T")[0],
        amount: repair.amount,
        toolName: repair.toolName,
      };
    });

    setEditedRepairs(initialEditedRepairs);
    setIsTableEditing(true);
  };

  const handleTableSave = async () => {
    try {
      if (!vehicleId || !repairs || repairs.length === 0) return;

      // Process all edited repairs
      const updatePromises = Object.entries(editedRepairs).map(
        async ([repairId, editedRepair]) => {
          const originalRepair = repairs.find(
            (repair) => repair._id === repairId
          );
          if (!originalRepair) return;

          // Create updated repair object
          const updatedRepair = {
            ...originalRepair,
            repairDate: new Date(editedRepair.repairDate).toISOString(),
            amount: editedRepair.amount,
            toolName: editedRepair.toolName,
          };

          // Use the updateRepair function from repair-actions.ts
          return updateRepair(repairId, updatedRepair);
        }
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Refresh repairs data after all updates
      const response = await fetch(`/api/repairs?vehicleId=${vehicleId}`);
      if (response.ok) {
        const data = await response.json();
        setRepairs(data);
      }

      // Reset editing state
      setIsTableEditing(false);
      setEditedRepairs({});

      toast({
        title: "Success",
        description: "All repairs updated successfully",
      });
    } catch (error) {
      console.error("Error updating repairs:", error);
      toast({
        title: "Error",
        description: "Failed to update some repairs",
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
    setEditedRepairs({});
  };

  const handleRepairFieldChange = (
    repairId: string,
    field: "repairDate" | "amount" | "toolName",
    value: string | number
  ) => {
    setEditedRepairs((prev) => {
      const updatedRepair = { ...prev[repairId] };

      if (field === "amount") {
        updatedRepair.amount = Number(value);
      } else if (field === "repairDate" || field === "toolName") {
        updatedRepair[field] = String(value);
      }

      return {
        ...prev,
        [repairId]: updatedRepair,
      };
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading repair history...</div>;
  }

  if (!vehicleId) {
    return <div className="text-center py-10">No vehicle selected</div>;
  }

  if (repairs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">
          No repair records found. Add your first repair record!
        </p>
        <Link href={`/vehicle/${vehicleId}/add-repair`}>
          <Button>Add Repair Details</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Repair History</h2>
        <div className="flex gap-2">
          {isTableEditing ? (
            <>
              <Button
                variant="outline"
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
              <Link href={`/vehicle/${vehicleId}/add-repair`}>
                <Button size="sm" className="flex items-center gap-2">
                  Add Repair
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">S.No</TableHead>
              <TableHead>Repair Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tool Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repairs.map((repair, index) => (
              <TableRow key={repair._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {isTableEditing ? (
                    <input
                      type="date"
                      value={editedRepairs[repair._id]?.repairDate || ""}
                      onChange={(e) =>
                        handleRepairFieldChange(
                          repair._id,
                          "repairDate",
                          e.target.value
                        )
                      }
                      className="px-2 py-1 border rounded"
                    />
                  ) : (
                    formatDate(repair.repairDate)
                  )}
                </TableCell>
                <TableCell>
                  {isTableEditing ? (
                    <input
                      type="number"
                      value={editedRepairs[repair._id]?.amount || 0}
                      onChange={(e) =>
                        handleRepairFieldChange(
                          repair._id,
                          "amount",
                          Number(e.target.value)
                        )
                      }
                      className="w-20 px-2 py-1 border rounded"
                      min="0"
                    />
                  ) : (
                    repair.amount
                  )}
                </TableCell>
                <TableCell>
                  {isTableEditing ? (
                    <input
                      type="text"
                      value={editedRepairs[repair._id]?.toolName || ""}
                      onChange={(e) =>
                        handleRepairFieldChange(
                          repair._id,
                          "toolName",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    repair.toolName
                  )}
                </TableCell>
                <TableCell>
                  {repair.toolImageUrl ? (
                    <div className="space-y-2">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={repair.toolImageUrl}
                          alt={repair.toolName}
                          fill
                          className="object-cover cursor-pointer"
                          onClick={() => {
                            setPreviewImage(repair.toolImageUrl);
                            setPreviewTitle(`Tool: ${repair.toolName}`);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!isTableEditing && (
                      <>
                        <Link href={`/repair/${repair._id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/repair/${repair._id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(repair._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewTitle || "Tool Image"}</DialogTitle>
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
    </div>
  );
}
