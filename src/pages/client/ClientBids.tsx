import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const TABS = ["all", "pending", "accepted", "rejected"];
const LIMIT = 10;

export default function ClientBids() {
  const { tab = "pending" } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!TABS.includes(tab)) {
    return <Navigate to="/client/bids/pending" replace />;
  }

  // State
  const [bids, setBids] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Refs
  const loadingRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------
  // Fetch bids
  // -----------------------------
  const fetchBids = useCallback(
    async (p = 1, reset = false) => {
      if (!reset && loadingRef.current) return;
      loadingRef.current = true;

      try {
        reset ? setInitialLoading(true) : setLoading(true);

        const params: Record<string, any> = { page: p, limit: LIMIT };
        if (tab !== "all") params.status = tab;

        const res = await api.get("/client/bids", { params });
        const list = res.data?.bids || [];
        const pagination = res.data?.pagination || {};

        setBids(prev => (reset ? list : [...prev, ...list]));
        setPage(pagination.page || p);
        setHasMore((pagination.page || p) < (pagination.total_pages || 1));
      } catch (err: any) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.message ||
          "Failed to load bids";
        toast({ title: "Error", description: msg, variant: "destructive" });
      } finally {
        setLoading(false);
        if (reset) setInitialLoading(false);
        loadingRef.current = false;
      }
    },
    [tab, toast]
  );

  // -----------------------------
  // Reset on tab change
  // -----------------------------
  useEffect(() => {
    setBids([]);
    setPage(1);
    setHasMore(true);
    fetchBids(1, true);
  }, [tab, fetchBids]);

  // -----------------------------
  // Infinite scroll
  // -----------------------------
  const handleScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el || loadingRef.current || !hasMore) return;

    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      fetchBids(page + 1);
    }
  }, [fetchBids, hasMore, page]);

  // -----------------------------
  // Bid Actions
  // -----------------------------
  const handleAcceptBid = async (bidId: string) => {
    try {
      await api.put(`/client/bids/${bidId}/status`, { action: "accept" });
      setBids(prev => prev.map(b => (b.id === bidId ? { ...b, status: "accepted" } : b)));
      toast({ title: "Bid Accepted", description: "Writer assigned to order" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to accept bid",
        variant: "destructive",
      });
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      await api.put(`/client/bids/${bidId}/status`, { action: "reject" });
      setBids(prev => prev.map(b => (b.id === bidId ? { ...b, status: "rejected" } : b)));
      toast({ title: "Bid Rejected" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to reject bid",
        variant: "destructive",
      });
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-bold">Your Bids</h1>

      <Card className="border-0 h-[calc(100dvh-7rem)] overflow-hidden relative">
        {initialLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Tabs */}
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3">
          <div className="flex border-b sm:border-0 border-border">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => navigate(`/client/bids/${t}`)}
                className={`pb-1 px-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>

        {/* Bid List */}
        <CardContent className="p-0 h-[calc(100dvh-7rem)]">
          <ScrollArea
            ref={viewportRef}
            onScroll={handleScroll}
            className="h-full"
            viewportClassName="h-full"
          >
            <div className="space-y-4 p-3">

              {bids.length === 0 && !initialLoading && (
                <div className="text-center py-10 text-muted-foreground">
                  No bids found.
                </div>
              )}

              {bids.map(bid => (
                <Card
                  key={bid.id}
                  className="border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">

                      {/* LEFT – Order Info */}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">
                          {bid.order_title || bid.job?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {bid.order_description || bid.job?.description || "No description"}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                          <span>
                            <strong className="text-foreground">Delivery:</strong>{" "}
                            {bid.delivery_time || bid.response_deadline
                              ? new Date(bid.response_deadline).toLocaleDateString()
                              : "Not specified"}
                          </span>
                          <span>
                            <strong className="text-foreground">Posted:</strong>{" "}
                            {new Date(bid.created_at).toLocaleDateString()}
                          </span>
                          {bid.order_id && (
                            <span className="text-xs opacity-75">Order ID: {bid.order_id}</span>
                          )}
                        </div>
                      </div>

                      {/* RIGHT – Bid Info */}
                      <div className="flex flex-col items-end justify-between sm:w-48">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            ${Number(bid.bid_amount).toFixed(2)}
                          </p>
                          <Badge
                            variant={
                              bid.status === "pending"
                                ? "default"
                                : bid.status === "accepted"
                                ? "success"
                                : "destructive"
                            }
                            className="mt-1"
                          >
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                        </div>

                        {(bid.status === "pending" || bid.status === "open") && (
                          <div className="flex flex-col gap-2 mt-4 w-full">
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              className="text-sm text-primary hover:underline text-right"
                            >
                              Accept Bid
                            </button>
                            <button
                              onClick={() => handleRejectBid(bid.id)}
                              className="text-sm text-destructive hover:underline text-right"
                            >
                              Reject Bid
                            </button>
                            <button
                              onClick={() => navigate(`/client/chats?writer=${bid.writer_id}`)}
                              className="text-sm hover:underline text-right"
                            >
                              Message Writer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MESSAGE */}
                    {bid.message && (
                      <div className="mt-4 border-t pt-3 text-sm text-muted-foreground">
                        <strong className="text-foreground">Writer message:</strong>
                        <p className="mt-1">{bid.message}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {loading && !initialLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              {!hasMore && bids.length > 0 && (
                <p className="text-center py-3 text-muted-foreground text-sm">
                  No more bids
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
