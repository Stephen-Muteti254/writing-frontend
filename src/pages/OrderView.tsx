import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Calendar,
  Download,
  CheckCircle2,
  Loader2
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useFileViewer } from "@/hooks/useFileViewer";
import { FileUploadSection, UploadFile } from "@/components/FileUploadSection";

interface OrderFile {
  id: string;
  url: string;
  name: string;
  uploadedAt?: string;
}

export default function OrderView() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { previewFile, openPreview, closePreview, downloadFile } = useFileViewer();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      const data = res.data;

      console.log(data);

      if (!data || !data.id) {
        throw new Error("Malformed response");
      }

      const parsedFiles: OrderFile[] = (data.files || []).map((url: string, idx: number) => ({
        id: String(idx),
        url,
        name: url.split("/").pop() || "file",
        uploadedAt: undefined
      }));

      setOrder({
        ...data,
        files: parsedFiles,
        requirements: Array.isArray(data.requirements)
          ? data.requirements
          : data.requirements
            ? [data.requirements]
            : [],
        description: data.description || "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleFileUpload = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      uploadFiles.forEach((uploadFile, index) => {
        formData.append(`files`, uploadFile.file);
        formData.append(`file_types`, uploadFile.type);
      });

      await api.post(`/orders/${orderId}/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${uploadFiles.length} file(s)`,
      });

      setUploadFiles([]);
      fetchOrder();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: err.response?.data?.error?.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  function formatDeadlineRemaining(deadlineIso: string): string {
    const deadline = new Date(deadlineIso);
    const now = new Date();

    const diffMs = deadline.getTime() - now.getTime();

    if (isNaN(deadline.getTime())) return "Invalid deadline";
    if (diffMs <= 0) return "Expired";

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} ${hours} hour${hours !== 1 ? "s" : ""} left`;
    }

    return `${hours} hour${hours !== 1 ? "s" : ""} left`;
  }


  function deadlineClass(deadlineIso: string) {
    const diffMs = new Date(deadlineIso).getTime() - Date.now();
    const hoursLeft = diffMs / (1000 * 60 * 60);

    if (hoursLeft <= 6) return "text-red-600";
    if (hoursLeft <= 24) return "text-orange-600";
    return "text-amber-600";
  }

  const getMilestoneStatus = (status: string) => {
    switch (status) {
      case "completed":
        return { color: "text-green-600", icon: <CheckCircle2 className="h-5 w-5" /> };
      case "in-progress":
        return { color: "text-yellow-500", icon: <Clock className="h-5 w-5" /> };
      default:
        return { color: "text-muted-foreground", icon: <Clock className="h-5 w-5 opacity-50" /> };
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{error || "Order not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button 
          variant="outline"
          onClick={() => navigate(`/writer/chats?order=${order.id}&client=${order.client_id}`)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message Client
        </Button>
      </div>

      {/* Order Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{order.title}</h1>
            <Badge variant={order.status === "in_progress" ? "default" : "outline"}>
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{order.id}</p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2">
          <div className="flex items-center text-3xl font-bold text-primary mb-1">
            <DollarSign className="h-6 w-6" />
            {order.budget}
          </div>
          <Badge variant="outline">{order.subject}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="overview">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="files">Files ({order.files.length})</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{order.description}</p>
                  </div>
                </TabsContent>

                {/* FILES TAB */}
                <TabsContent value="files" className="mt-6">
                  {order.files.length > 0 ? (
                    <div className="space-y-3">
                      {order.files.map((file: OrderFile) => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div
                            onClick={() => openPreview(file.url, file.name)}
                            className="cursor-pointer flex items-center space-x-3 hover:bg-accent p-2 rounded-lg transition flex-1"
                          >
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <p className="font-medium truncate max-w-[120px] sm:max-w-[180px] md:max-w-[250px]">
                              {file.name}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(file.url, file.name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No files uploaded yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* FILE UPLOAD SECTION */}
          <FileUploadSection
            files={uploadFiles}
            onFilesChange={setUploadFiles}
            onSubmit={handleFileUpload}
            isUploading={isUploading}
          />
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Type</p>
                  <p className="text-muted-foreground">
                    {order.type} • {order.pages} pages
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Deadline</p>
                  {order.deadline && (
                    <span className={`flex items-center font-medium ${deadlineClass(order.deadline)}`}>
                      {/*<Clock className="h-3 w-3 mr-1" />*/}
                      {formatDeadlineRemaining(order.deadline)}
                    </span>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Request Revision
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={closePreview}>
        <DialogContent
          forceMount
          className="z-50 m-0 p-0 gap-0 w-full h-full max-w-none bg-background border-none rounded-none overflow-hidden flex flex-col overflow-y-auto"
        >
          <DialogHeader className="flex items-center justify-between border-b bg-background/90 backdrop-blur-md px-6 py-1 shrink-0">
            <DialogTitle className="text-lg font-semibold">
              {previewFile?.name || "Preview"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex items-center justify-center bg-muted/10 relative">
            {previewFile?.type === "loading" && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading file...</p>
              </div>
            )}

            {previewFile?.type === "pdf" && previewFile.url && (
              <iframe
                src={`${previewFile.url}#toolbar=0`}
                className="w-full h-full border-0 bg-white"
                title={previewFile.name}
              />
            )}

            {previewFile?.type === "image" && previewFile.url && (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {(previewFile?.type === "document" || previewFile?.type === "other") &&
              previewFile.rawUrl && (
                <div className="text-center space-y-3">
                  <p className="text-muted-foreground">
                    Preview unavailable for this file type.
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadFile(
                        previewFile.rawUrl,
                        previewFile.rawUrl.split("/").pop() || previewFile.name
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
