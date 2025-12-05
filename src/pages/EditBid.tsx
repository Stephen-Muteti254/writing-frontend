import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  Save,
  Edit,
  MessageCircle,
  FileText,
  Calendar,
  User,
  ChevronRight,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { ChatPanel } from "@/components/ChatPanel";

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
  chat_id?: string;
}

interface Order {
  id: string;
  title: string;
  budget: number;
  deadline: string;
  pages: number;
  description?: string;
  client?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function EditBid() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const viewOnly = location.state?.viewOnly || false;

  const [bid, setBid] = useState<Bid | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const [chatOpen, setChatOpen] = useState(true);
  
  // Get chat_id from URL params if available (passed from PlaceBid)
  const chatIdFromUrl = searchParams.get("chat");
  
  // Current user ID from localStorage
  const currentUserId = localStorage.getItem("user_id") || "current-user";

  useEffect(() => {
    if (bidId) {
      fetchBidDetails();
    }
  }, [bidId]);

  const fetchBidDetails = async () => {
    try {
      setLoading(true);
      const bidRes = await api.get(`/bids/${bidId}`);
      const bidData = bidRes.data.data || bidRes.data;
      setBid(bidData);

      // Fetch order details
      const orderRes = await api.get(`/orders/${bidData.order_id}`);
    const orderData = orderRes.data;
    setOrder(orderData);

      // Pre-fill form
      setBidAmount(bidData.bid_amount?.toString() || bidData.amount?.toString() || "");
      setMessage(bidData.message || "");
      setDeadline(bidData.response_deadline ? new Date(bidData.response_deadline).toISOString().slice(0, 16) : "");

      if (bidData && orderRes.data) {
        try {
          const chatRes = await api.post("/chats", {
            order_id: bidData.order_id,
            writer_id: currentUserId,
            client_id: orderData.client?.id
          });

          const chat = chatRes.data.data.chat;
          setChatId(chat.id);
        } catch (error) {
          console.error("Failed to fetch or create chat:", error);
        }
      }
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return { 
          label: "Accepted", 
          className: "bg-green-500/10 text-green-600 border-green-500/20",
          icon: CheckCircle
        };
      case "rejected":
        return { 
          label: "Rejected", 
          className: "bg-destructive/10 text-destructive border-destructive/20",
          icon: XCircle
        };
      case "withdrawn":
      case "cancelled":
        return { 
          label: status === "withdrawn" ? "Withdrawn" : "Cancelled", 
          className: "bg-muted text-muted-foreground",
          icon: AlertCircle
        };
      case "unconfirmed":
        return { 
          label: "Unconfirmed", 
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
          icon: AlertCircle
        };
      default:
        return { 
          label: "Pending", 
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
          icon: Clock
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const originalAmount = bid.bid_amount || 0;
  const amountChanged = parseFloat(bidAmount) !== originalAmount;
  const statusConfig = getStatusConfig(bid.status);
  const StatusIcon = statusConfig.icon;

  // VIEW ONLY MODE - Clean display similar to BidView
  if (viewOnly) {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Bar with Order Info */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-semibold text-foreground line-clamp-1">
                  {order.title || "Order Details"}
                </h1>
                <p className="text-xs text-muted-foreground">{order.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("border", statusConfig.className)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {chatId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setChatOpen(!chatOpen)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              )}
              {bid.status === "unconfirmed" ? (
                <Button
                  className="hidden sm:flex"
                  onClick={() =>
                    navigate(`/writer/my-bids/edit/${bidId}`, {
                      state: { viewOnly: false }
                    })
                  }
                  disabled={isConfirming}
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
              ) : bid.status !== "cancelled" && bid.status !== "withdrawn" ? (
                <Button
                  variant="outline"
                  className="hidden sm:flex"
                  onClick={() =>
                    navigate(`/writer/my-bids/edit/${bidId}`, {
                      state: { viewOnly: false }
                    })
                  }
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Bid
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className={cn(
            "flex-1 p-4 lg:p-6 space-y-6 transition-all duration-300",
            chatOpen && chatId ? "lg:pr-0" : ""
          )}>
            {/* Alert Banner for Unconfirmed */}
            {bid.status === "unconfirmed" && (
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
            )}

            {/* Order Summary Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Budget
                    </p>
                    <p className="font-semibold text-foreground">${order.budget}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Pages
                    </p>
                    <p className="font-semibold text-foreground">{order.pages} pages</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Deadline
                    </p>
                    <p className="font-semibold text-foreground text-sm">
                      {formatDate(order.deadline)}
                    </p>
                  </div>
                  {order.client && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Client
                      </p>
                      <p className="font-semibold text-foreground">{order.client.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bid Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  Your Bid Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bid Amount & Deadline Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                    <p className="text-sm text-muted-foreground">Bid Amount</p>
                    <p className="text-3xl font-bold text-primary">${originalAmount}</p>
                    {originalAmount < order.budget && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                        {Math.round((1 - originalAmount / order.budget) * 100)}% below budget
                      </Badge>
                    )}
                  </div>
                  {deadline && (
                    <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                      <p className="text-sm text-muted-foreground">Proposed Deadline</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatDate(deadline)}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Proposal */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Your Proposal
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {message || "No proposal message provided."}
                  </div>
                </div>

                <Separator />

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Submitted: {bid.submitted_at ? formatDate(bid.submitted_at) : "—"}
                  </div>
                  <span className="font-mono text-xs">{bid.id}</span>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Actions */}
            <div className="sm:hidden">
              {bid.status === "unconfirmed" ? (
                <Button
                  className="w-full"
                  onClick={() =>
                    navigate(`/writer/my-bids/edit/${bidId}`, {
                      state: { viewOnly: false }
                    })
                  }
                  disabled={isConfirming}
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
              ) : bid.status !== "cancelled" && bid.status !== "withdrawn" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigate(`/writer/my-bids/edit/${bidId}`, {
                      state: { viewOnly: false }
                    })
                  }
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Bid
                </Button>
              ) : null}
            </div>
          </div>

          {/* Chat Panel - Desktop Sidebar */}
          {chatId && (
            <div className={cn(
              "hidden lg:block w-96 border-l border-border bg-card flex-shrink-0 sticky top-[73px] h-[calc(100vh-73px)]",
              !chatOpen && "lg:hidden"
            )}>
              <ChatPanel
                chatId={chatId}
                currentUserId={currentUserId}
                isOpen={true}
                embedded={true}
                className="h-full border-l-0"
              />
            </div>
          )}

          {/* Chat Panel - Mobile Overlay */}
          {chatId && chatOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <ChatPanel
                chatId={chatId}
                currentUserId={currentUserId}
                embedded
                isOpen={true}
                onClose={() => setChatOpen(false)}
                className="absolute right-0 top-0 h-full w-full sm:w-96 shadow-xl"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Alert Banner */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Your Bid</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your proposal for this project
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current vs New Amount */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium">Current Bid Amount</p>
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

                {/* Proposal Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Updated Proposal *</Label>
                  <Textarea
                    id="message"
                    placeholder="Update your proposal message..."
                    className="min-h-[200px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {message.length} / 1000 characters
                  </p>
                </div>

                {/* Submit Buttons */}
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
                <p className="text-sm font-medium">Original Bid</p>
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

      {/* Chat Panel - Desktop Sidebar (Edit Mode) */}
      {chatId && (
        <div className={cn(
          "hidden lg:block w-96 border-l border-border bg-card flex-shrink-0 sticky top-[73px] h-[calc(100vh-73px)]",
          !chatOpen && "lg:hidden"
        )}>
          <ChatPanel
            chatId={chatId}
            currentUserId={currentUserId}
            isOpen={true}
            embedded={true}
            className="h-full border-l-0"
          />
        </div>
      )}

      {/* Chat Panel - Mobile Overlay (Edit Mode) */}
      {chatId && chatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <ChatPanel
            chatId={chatId}
            currentUserId={currentUserId}
            isOpen={true}
            onClose={() => setChatOpen(false)}
            className="absolute right-0 top-0 h-full w-full sm:w-96 shadow-xl"
          />
        </div>
      )}
    </div>
  );
}
