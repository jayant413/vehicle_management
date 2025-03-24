import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

export interface RepairDetailsProps {
  repair: {
    _id: string;
    vehicleId: string;
    repairDate: string;
    amount: number;
    toolName: string;
    toolImageUrl: string;
  };
}

export default function RepairDetails({ repair }: RepairDetailsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative h-64 w-full md:w-1/3 rounded-md overflow-hidden">
            <Image
              src={
                repair.toolImageUrl || "/placeholder.svg?height=300&width=400"
              }
              alt={repair.toolName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold mb-4">Repair Details</h2>
              <Link href={`/repair/${repair._id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Repair Date
                  </p>
                  <p className="font-medium">
                    {new Date(repair.repairDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Quantity
                  </p>
                  <p className="font-medium">{repair.amount}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tool Used
                </p>
                <p className="font-medium">{repair.toolName}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
