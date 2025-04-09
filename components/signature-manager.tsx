"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSignature,
  getSignature,
  updateSignature,
  deleteSignature,
  uploadToCloudinary,
} from "@/lib/signature-actions";
import Image from "next/image";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { toast } from "@/components/ui/use-toast";

export default function SignatureManager() {
  const [signature, setSignature] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadSignature() {
      try {
        const data = await getSignature();
        setSignature(data);
        if (data) {
          setName(data.name);
        }
      } catch (error) {
        console.error("Error loading signature:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSignature();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile && !signature?.signatureUrl) {
      toast({
        title: "Error",
        description: "Please upload a signature image",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      let signatureUrl = signature?.signatureUrl;

      if (selectedFile) {
        // Use the server-side function to upload to Cloudinary
        signatureUrl = await uploadToCloudinary(selectedFile);
      }

      const data = {
        name,
        signatureUrl,
      };

      if (isEditing && signature?._id) {
        await updateSignature(signature._id, data);
        toast({
          title: "Success",
          description: "Signature updated successfully",
        });
      } else {
        await createSignature(data);
        toast({
          title: "Success",
          description: "Signature uploaded successfully",
        });
      }

      const updatedSignature = await getSignature();
      setSignature(updatedSignature);
      setModalOpen(false);
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error saving signature:", error);
      toast({
        title: "Error",
        description: "Failed to save signature",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!signature?._id) return;

    try {
      await deleteSignature(signature._id);
      setSignature(null);
      toast({
        title: "Success",
        description: "Signature deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting signature:", error);
      toast({
        title: "Error",
        description: "Failed to delete signature",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          {signature ? (
            <div className="flex items-center">
              <Button
                variant="outline"
                className="mr-4 flex items-center"
                onClick={() => {
                  setIsEditing(false);
                  setModalOpen(true);
                }}
              >
                View Signature
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <DotsVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleDelete}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              variant="outline"
              className="mr-4"
              onClick={() => setModalOpen(true)}
            >
              Upload Signature
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? "Edit Signature"
                : signature
                ? "View Signature"
                : "Upload Signature"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={!isEditing && signature}
              />
            </div>

            {(isEditing || !signature) && (
              <div className="space-y-2">
                <Label htmlFor="signature">Signature Image</Label>
                <Input
                  id="signature"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {previewUrl ? (
              <div className="border rounded p-2">
                <Image
                  src={previewUrl}
                  alt="Signature Preview"
                  width={300}
                  height={100}
                  className="object-contain"
                />
              </div>
            ) : signature?.signatureUrl ? (
              <div className="border rounded p-2">
                <Image
                  src={signature.signatureUrl}
                  alt="Signature"
                  width={300}
                  height={100}
                  className="object-contain"
                />
              </div>
            ) : null}

            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              {(isEditing || !signature) && (
                <Button type="submit" disabled={isUploading}>
                  {isUploading
                    ? "Uploading..."
                    : isEditing
                    ? "Update"
                    : "Upload"}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
