import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Loader2,
  ArrowLeft,
  XCircle,
  FileText,
  Download,
  Clock,
  X,
  Edit,
  MessageSquare,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileViewer } from "@/hooks/useFileViewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription
} from "@/components/ui/alert-dialog";

interface Order {
  id: string;
  title: string;
  subject: string;
  type: string;
  pages: number;
  deadline: string | null;
  budget: number;
  status: string;
  description?: string | null;
  requirements?: string | null;
  progress?: number;
  files?: string[];
  client?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  writer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  writer_id?: string; // if backend sends it
  writer_assigned?: boolean; // ← NEW
  created_at: string;
  updated_at?: string;
}


export default function OrderDetails() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { orderId, tab, bidTab } = useParams();
  const outletCtx = useOutletContext<any>() || {};
  const openCancelDialog = outletCtx.openCancelDialog || (() => {});
  const { previewFile, openPreview, closePreview, downloadFile } = useFileViewer();
  const [declineOpen, setDeclineOpen] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  /** -------------------------------
   *  Fetch Order Details
   *  ------------------------------*/
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      console.log(res.data);
      setOrder(res.data);
    } catch (err: any) {
      console.error("[Order Fetch Error]", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Unable to load order details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!order) return;
    try {
      setIsDeclining(true);
      await api.post(`/orders/${order.id}/decline`);
      toast({
        title: "Order Declined",
        description: "You will no longer see this order.",
      });
      navigate("/writer/available-orders/declined");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error?.message || "Failed to decline order.",
        variant: "destructive",
      });
    } finally {
      setIsDeclining(false);
      setDeclineOpen(false);
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

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  /** -------------------------------
   *  Loading & Not Found States
   *  ------------------------------*/
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Order not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  /** -------------------------------
   *  UI
   *  ------------------------------*/
  return (
      <div className="space-y-4 lg:px-0 pb-10">

      {/* Header */}
      {user?.role !== "client" && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Available Orders
          </Button>        
          <Button variant="outline" onClick={() => navigate(`/writer/place-bid/${order.id}`)}>
            Place Bid
          </Button>
        </div>
        )}

      {/* Title Section */}
      <Card className="p-2 border-none">
        <CardHeader className="p-0">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{order.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
            </div>
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center text-3xl font-bold text-primary mb-1">
                <DollarSign className="h-6 w-6 mr-1" />
                {order.budget}
              </div>
              <Badge
                variant="outline"
                className="border-primary text-primary capitalize"
              >
                {order.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {order.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle>Attached Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.files && order.files.length > 0 ? (
                order.files.map((fileUrl, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {/* Left clickable preview area */}
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => openPreview(fileUrl, `File ${index + 1}`)}
                    >
                      <div className="p-2 rounded-md bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>

                      <div>
                        <p className="font-medium text-sm">File {index + 1}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate max-w-[120px] sm:max-w-[180px] md:max-w-[250px]">
                          {fileUrl.split("/").pop()}
                        </p>
                      </div>
                    </div>

                    {/* Download button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-muted rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(fileUrl);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No files attached.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Key Details */}
          <Card>
            <CardHeader>
              <CardTitle>Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start">
                <Badge variant="outline" className="mr-2">
                  {order.subject}
                </Badge>
                <span className="text-sm text-muted-foreground">{order.type}</span>
              </div>
              <Separator />
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Deadline</p>
                  {order.deadline && (
                    <p className={`flex items-center font-medium ${deadlineClass(order.deadline)}`}>                    
                      {formatDeadlineRemaining(order.deadline)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Pages</p>
                  <p className="text-muted-foreground">{order.pages} pages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info (hide for clients themselves) 
          {user?.role !== "client" && order.client && (
            <Card>
              <CardHeader>
                <CardTitle>Client Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{order.client.name}</p>
                {order.client.email && (
                  <p className="text-sm text-muted-foreground">{order.client.email}</p>
                )}
              </CardContent>
            </Card>
          )}
          */}

          {/* ROLE-SPECIFIC ACTIONS */}
          <div className="space-y-3">
            {/* Message Button - Always show when there's a writer/client */}
            {user?.role === "client" && order.writer_id ? (
              <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => navigate(`/client/chats?order=${order.id}`)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Writer
              </Button>
            ) : user?.role === "writer" && order.client ? (
              <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => navigate(`/writer/chats?order=${order.id}`)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Client
              </Button>
            ) : null}

            {/* Writer Actions */}
            {user?.role !== "client" ? (
              <div className="grid gap-3 grid-cols-2">
                <Button
                  size="lg"
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/writer/place-bid/${order.id}`)}
                >
                  Place Your Bid
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => setDeclineOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            ) : (
              /* Client Actions */
              ["in_progress", "draft"].includes(order.status) && !order.writer_assigned && (
                <div className="grid gap-3 grid-cols-2">
                  <Button
                    size="lg"
                    className="w-full"
                    variant="outline"
                    onClick={() =>
                      navigate(`/client/orders/${tab}/${order.id}/edit`)
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </Button>

                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => openCancelDialog(order.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                </div>
              )
            )}
          </div>

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

      {/* Confirm Decline Dialog */}
      <AlertDialog
        open={declineOpen}
        onOpenChange={(open) => {
          if (!isDeclining) setDeclineOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline This Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this order?
              <br /><br />
              <strong>This action cannot be undone.</strong>
              Once declined, this order will no longer appear in your available list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeclining}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeclining}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDecline}
            >
              {isDeclining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Declining…
                </>
              ) : (
                "Yes, Decline Order"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
