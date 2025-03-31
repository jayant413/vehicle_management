"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { deleteRepair } from "@/lib/repair-actions";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">S.No</TableHead>
            <TableHead>Repair Date</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Tool Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repairs.map((repair, index) => (
            <TableRow key={repair._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {new Date(repair.repairDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{repair.amount}</TableCell>
              <TableCell>{repair.toolName}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
