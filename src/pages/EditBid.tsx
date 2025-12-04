import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  Save,
  Edit
} from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface Bid {
  id: string;
  order_id: string;
  order_title?: string;
  bid_amount: number;
  original_budget?: number;
  status: string;
  message?: string;
  submitted_at?: string;
  response_deadline?: string;
}

interface Order {
  id: string;
  title: string;
  budget: number;
  deadline: string;
  pages: number;
}

export default function EditBid() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const location = useLocation();
  const viewOnly = location.state?.viewOnly || false;

  const [bid, setBid] = useState<Bid | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (bidId) {
      fetchBidDetails();
    }
  }, [bidId]);

  const fetchBidDetails = async () => {
    try {
      setLoading(true);
      const bidRes = await api.get(`/bids/${bidId}`);
      const bidData = bidRes.data;
      setBid(bidData);

      // Fetch order details
      const orderRes = await api.get(`/orders/${bidData.order_id}`);
      setOrder(orderRes.data);

      // Pre-fill form
      setBidAmount(bidData.bid_amount.toString());
      setMessage(bidData.message || "");
      setDeadline(bidData.response_deadline ? new Date(bidData.response_deadline).toISOString().slice(0, 16) : "");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error Loading Bid",
        description: error.response?.data?.message || "Failed to load bid details.",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (viewOnly) return null;
    e.preventDefault();

    if (!bidAmount || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (order && parseFloat(bidAmount) > order.budget) {
      toast({
        title: "Invalid Bid Amount",
        description: "Your bid cannot exceed the client's budget",
        variant: "destructive",
      });
      return;
    }

    if (order && deadline) {
      const writerDate = new Date(deadline);
      const clientDate = new Date(order.deadline);

      if (writerDate > clientDate) {
        toast({
          title: "Invalid Deadline",
          description: "Your proposed deadline cannot exceed the client's deadline.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(bidAmount),
        message,
        ...(deadline && { deadline }),
      };

      await api.put(`/bids/${bidId}`, payload);

      toast({
        title: "Bid Updated Successfully!",
        description: "Your changes have been saved.",
      });

      navigate("/writer/my-bids");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Failed to Update Bid",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bid || !order) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {bid?.status !== "open" 
              ? "This bid cannot be edited (not in 'open' status)" 
              : "Bid not found"}
          </CardContent>
        </Card>
      </div>
    );
  }

  const originalAmount = bid.bid_amount;
  const amountChanged = parseFloat(bidAmount) !== originalAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {viewOnly && (
          <>
            {bid.status === "unconfirmed" ? (
              <Button
                className="rounded-none border shadow-none"
                onClick={() =>
                  navigate(`/writer/my-bids/edit/${bidId}`, {
                    state: { viewOnly: false }
                  })
                }
                disabled={isConfirming}
                variant="outline"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Bid / Edit"
                )}
              </Button>
            ) : bid.status === "cancelled" ? (
              <StatusBadge status={bid.status} />
            ) : (
              <Button
                variant="outline"
                className="rounded-none border shadow-none"
                onClick={() =>
                  navigate(`/writer/my-bids/edit/${bidId}`, {
                    state: { viewOnly: false }
                  })
                }
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Bid
              </Button>
            )}
          </>
        )}

      </div>

      {/* Alert Banner */}
      {viewOnly && bid.status === "unconfirmed" ? (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-500/10">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-yellow-700">Order Updated</p>
              <p className="text-sm text-muted-foreground">
                The client made changes to the order after you submitted your bid.  
                Please review and confirm to proceed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !viewOnly ? (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Editing Your Bid</p>
              <p className="text-sm text-muted-foreground">
                You can update your bid amount and proposal. The client will be notified of any changes.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{viewOnly ? "Your Bid" : "Edit Your Bid"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {viewOnly ? "Your proposal" : "Update your proposal for this project"}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current vs New Amount */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium">{viewOnly ? "Your Bid Amount" : "Current Bid Amount"}</p>
                  <div className="flex items-center text-2xl font-bold text-muted-foreground">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {originalAmount.toFixed(2)}
                  </div>
                  {amountChanged && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">New Bid Amount</p>
                        <div className="flex items-center text-2xl font-bold text-primary">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {parseFloat(bidAmount).toFixed(2)}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={parseFloat(bidAmount) < originalAmount ? "bg-green-500/10 text-green-600 mt-2" : "bg-red-500/10 text-red-600 mt-2"}
                        >
                          {parseFloat(bidAmount) < originalAmount ? "Lower" : "Higher"} by $
                          {Math.abs(parseFloat(bidAmount) - originalAmount).toFixed(2)}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {/* Bid Amount Input */}
                {!viewOnly && (
                  <>
                  <div className="space-y-2">
                  <Label htmlFor="bidAmount">New Bid Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="Enter your new bid amount"
                      className="pl-9"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min="1"
                      max={order.budget}
                      step="0.01"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Client's budget: ${order.budget}
                  </p>
                </div>

                {/* Deadline */}
                {deadline && (
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Proposed Deadline</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="deadline"
                        type="datetime-local"
                        className="pl-9"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        max={new Date(order.deadline).toISOString().slice(0, 16)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Must be on or before:{" "}
                      {new Date(order.deadline).toLocaleString()}
                    </p>
                  </div>
                )}
                </>
                )}

                {/* Proposal Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">{viewOnly ? "Your Proposal" : "Updated Proposal *"}</Label>
                  <Textarea
                    id="message"
                    placeholder="Update your proposal message..."
                    className="min-h-[200px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={viewOnly}
                  />
                  <p className="text-sm text-muted-foreground">
                    {message.length} / 1000 characters
                  </p>
                </div>

                {/* Submit Buttons */}
                {!viewOnly && (
                  <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Project</p>
                <p className="font-medium">{order.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{order.id}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Client Budget</span>
                  <div className="flex items-center font-medium">
                    <DollarSign className="h-4 w-4" />
                    {order.budget}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Length</span>
                  <div className="flex items-center text-sm">
                    {/*<FileText className="h-4 w-4 mr-1" />*/}
                    {order.pages} pages
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deadline</span>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(order.deadline).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">{viewOnly ? "Your" : "Original"} Bid</p>
                <div className="flex items-center text-xl font-bold">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {originalAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted {bid.submitted_at ? new Date(bid.submitted_at).toLocaleDateString() : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
