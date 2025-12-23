import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { DollarSign, Eye, Loader2, Filter, Edit, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
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

interface Bid {
  id: string;
  order_id: string;
  order_title: string;
  amount: number;
  original_budget: number;
  budget: number
  status: string;
  message: string;
  submitted_at: string;
  response_deadline: string;
  is_counter_offer: boolean;
}

export default function MyBids() {
  const { tab = "open" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<{
    getElement: () => HTMLDivElement | null;
    scrollTop: () => number;
    scrollHeight: () => number;
    clientHeight: () => number;
  }>(null);

  const [bids, setBids] = useState<Bid[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const loadingRef = useRef(false);
  const nextPageRef = useRef(1);

  const LIMIT = 10;

  if (!["open", "unconfirmed", "declined", "cancelled"].includes(tab)) {
    return <Navigate to="/writer/my-bids/open" replace />;
  }

  const fetchBids = async (reset = false, pageNum = 1) => {
    try {
      if (loadingRef.current) return;
      loadingRef.current = true;
      
      if (reset) setInitialLoading(true);
      else setLoading(true);

      const res = await api.get("/bids", {
        params: { page: pageNum, limit: LIMIT, status: tab, from: dateFrom, to: dateTo },
      });

      const { data } = res;
      const list = data?.bids || [];
      const pagination = data?.pagination || {};

      setHasMore(pageNum < pagination.total_pages);
      setBids(reset ? list : (prev) => [...prev, ...list]);

      nextPageRef.current = pageNum + 1;
      loadingRef.current = false;
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to load bids",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleCancelBid = async () => {
    if (!cancelId) return;

    try {
      await api.delete(`/bids/${cancelId}`);

      toast({
        title: "Bid Cancelled",
        description: "This bid has been withdrawn and cannot be undone.",
      });

      // Refresh table
      setBids([]);
      fetchBids(true, 1);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to cancel bid",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelId(null);
    }
  };


  // Load first page when tab/filter changes
  useEffect(() => {
    setBids([]);
    setPage(1);
    fetchBids(true, 1);
  }, [tab, dateFrom, dateTo]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loadingRef.current || !hasMore) return;

    const el = scrollRef.current?.getElement();
    if (!el) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      fetchBids(false, nextPageRef.current);
    }
  }, [hasMore]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Bids</h1>
      </div>

      <Card className="p-0 border-0 relative">
        {initialLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <CardContent className="p-0 flex flex-col">
          {/* Tabs + Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-border">
            <div className="flex border-b sm:border-0 border-border">
              {["open", "unconfirmed", "declined", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => navigate(`/writer/my-bids/${status}`)}
                  className={`pb-1 px-2 text-sm font-medium transition-colors ${
                    tab === status
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Filter by Date</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date From</Label>
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                      </div>
                      <div>
                        <Label>Date To</Label>
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                      </div>
                    </div>
                    <Button onClick={() => setFilterOpen(false)} className="w-full">Apply</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Scrollable Table */}
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Bid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bid.order_title}</p>
                        <p className="text-sm text-muted-foreground">{bid.order_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1" /> {bid.amount}
                        <span className="text-muted-foreground ml-1">/ {bid.budget}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={bid.status} /></TableCell>
                    <TableCell>{new Date(bid.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="inline-flex w-auto border divide-x">
                        {/* View button — always visible */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-none border-0 shadow-none"
                          onClick={() =>
                            navigate(`/writer/my-bids/view/${bid.id}`, {
                              state: { viewOnly: true }
                            })
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Only show Edit + Cancel if NOT cancelled */}
                        {bid.status !== "cancelled" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-none border-0 shadow-none"
                              onClick={() => navigate(`/writer/my-bids/edit/${bid.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-none border-0 shadow-none text-red-600"
                              onClick={() => setCancelId(bid.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {loading && !initialLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}

            {!loading && bids.length === 0 && !initialLoading && (
              <p className="text-center text-muted-foreground mt-8">No bids found.</p>
            )}
          </div>
        </CardContent>
      </Card>
      {cancelId && (
        <AlertDialog open={!!cancelId}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel This Bid?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this bid? This action cannot be undone.

                You will <strong>NOT</strong> be able to bid on this order again.
                If you only want to change something, please use the <em>Edit</em> button instead.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancelId(null)}>
                Keep Bid
              </AlertDialogCancel>

              <AlertDialogAction
                className="text-red-600"
                onClick={handleCancelBid}
                variant="outline"
              >
                Yes, Cancel Bid
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
