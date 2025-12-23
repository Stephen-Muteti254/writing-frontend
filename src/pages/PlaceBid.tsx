import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import api from "@/lib/api";

interface Order {
  id: string;
  title: string;
  budget: number;
  deadline: string;
  pages: number;
}

export default function PlaceBid() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error Loading Order",
          description: error.response?.data?.message || "Failed to load order details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bidAmount || !message ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (order && parseFloat(bidAmount) < order.budget) {
      toast({
        title: "Invalid Bid Amount",
        description: "Your bid cannot be lower than the displayed budget",
        variant: "destructive",
      });
      return;
    }

    if (order) {
      const clientDate = new Date(order.deadline);
    }

    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(bidAmount),
        message,
      };

      const res = await api.post(`/orders/${orderId}/bids`, payload);
      const bidData = res.data.data || res.data;

      toast({
        title: "Bid Submitted Successfully!",
        description: "The client will review your bid shortly.",
      });

      const chatParam = bidData.chat_id ? `?chat=${bidData.chat_id}` : "";
      navigate(`/writer/bids/${bidData.id}${chatParam}`);
    } catch (error: any) {
      console.error(error);
      toast({
        title: `Failed to Submit Bid ${error.status}`,
        description: error.response?.data?.error?.message || "Please try again later.",
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

  if (!order) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Order not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const suggestedBid = Math.floor(order.budget * 0.85);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bid Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Place Your Bid</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submit your proposal for this project
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bid Amount */}
                <div className="space-y-2">
                  <Label htmlFor="bidAmount">Bid Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="Enter your bid amount"
                      className="pl-9"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={order.budget}
                      step="0.01"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Minimum payable amount: ${order.budget}
                  </p>
                </div>

                {/* Proposal Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Your Proposal *</Label>
                  <Textarea
                    id="message"
                    placeholder="Explain why you're the best fit for this project. Highlight your relevant experience, qualifications, and approach..."
                    className="min-h-[200px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {message.length} / 1000 characters
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Bidding Tips</p>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Be professional and highlight relevant experience</li>
                      <li>Offer competitive pricing while valuing your work</li>
                      <li>Set realistic deadlines you can meet</li>
                      <li>Proofread your proposal before submitting</li>
                    </ul>
                  </div>
                </div>

                {/* Submit */}
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
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Bid"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Project</p>
                <p className="font-medium">{order.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{order.id}</p>
              </div>

              <div className="space-y-3 pt-2">
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
                    <FileText className="h-4 w-4 mr-1" />
                    {order.pages} pages
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deadline</span>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                      {order.deadline 
                        ? new Date(order.deadline).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                  </div>
                </div>
              </div>

              {bidAmount && (
                <div className="border-t pt-4 mt-4">
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Your Bid</span>
                      <div className="flex items-center text-lg font-bold text-brand-primary">
                        <DollarSign className="h-5 w-5" />
                        {bidAmount}
                      </div>
                    </div>
                    {parseFloat(bidAmount) < order.budget && (
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        {Math.round((1 - parseFloat(bidAmount) / order.budget) * 100)}% below budget
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
