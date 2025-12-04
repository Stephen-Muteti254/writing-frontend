import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Loader2 } from "lucide-react";
import { OrdersTable } from "@/components/OrdersTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function MyOrders() {
  const { parentTab, "*": subTabWildcard } = useParams();
  const subTab = subTabWildcard || "all";
  const navigate = useNavigate();

  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollRef = useRef<{
    getElement: () => HTMLDivElement | null;
    scrollTop: () => number;
    scrollHeight: () => number;
    clientHeight: () => number;
  }>(null);

  const loadingRef = useRef(false);

  if (!parentTab || !["in-progress", "completed", "cancelled"].includes(parentTab)) {
    return <Navigate to="/writer/orders/in-progress/all" replace />;
  }

  /** Backend status mapper */
  const backendStatus = useMemo(() => {
    if (parentTab === "in-progress") {
      switch (subTab) {
        case "all":
          return "in-progress"; // ALL active (in_progress, review, revision)
        case "in-progress":
          return "in-progress-only"; // ONLY in_progress
        case "in-review":
          return "in-review";
        case "in-revision":
          return "in-revision";
        default:
          return "in-progress";
      }
    }

    // Finalized parent tabs: completed, cancelled
    return parentTab;
  }, [parentTab, subTab]);

  /** Fetch orders (useCallback to reference in scroll) */
  const loadOrders = useCallback(
    async (p = 1, reset = false) => {
      if (!reset && loadingRef.current) return;

      loadingRef.current = true;
      reset ? setLoadingInitial(true) : setLoadingMore(true);

      try {
        const res = await api.get("/orders", {
          params: {
            assigned_to: "me",
            status: backendStatus,
            search: searchOrderId || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            limit: 20,
            page: p,
          },
        });

        const newOrders = res.data?.orders || [];
        setOrders(prev => (reset ? newOrders : [...prev, ...newOrders]));
        setHasMore(newOrders.length > 0);
        setPage(p);
      } catch (err) {
        console.error(err);
      } finally {
        loadingRef.current = false;
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [backendStatus, searchOrderId, dateFrom, dateTo]
  );

  /** Reset orders on filter/tab change */
  useEffect(() => {
    loadOrders(1, true);
  }, [backendStatus, searchOrderId, dateFrom, dateTo, loadOrders]);

  /** Infinite scroll */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingRef.current) return;

    const atBottom =
      el.scrollHeight() - el.scrollTop() - el.clientHeight() < 120;

    if (!atBottom || !hasMore) return;

    loadOrders(page + 1);
  }, [hasMore, page, loadOrders]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
      </div>

      <Card className="border-0 h-[calc(100dvh-11rem)] overflow-hidden relative">
        {loadingInitial && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <CardContent className="p-0 h-full flex flex-col">
          {/* Parent Tabs + Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-3 py-0">
            <div className="flex">
              {["in-progress", "completed", "cancelled"].map(tab => (
                <button
                  key={tab}
                  onClick={() => navigate(`/writer/orders/${tab}/all`)}
                  className={`pb-1 px-2 text-sm font-medium transition-colors ${
                    parentTab === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
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
                  <DialogHeader>
                    <DialogTitle>Filter Orders</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={e => setDateFrom(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Date To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={e => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={() => setFilterOpen(false)} className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Input
                placeholder="Search by ID..."
                value={searchOrderId}
                onChange={e => setSearchOrderId(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
          </div>

          {/* Sub-level tabs */}
          {parentTab === "in-progress" && (
            <Tabs
              value={subTab}
              onValueChange={value => navigate(`/writer/orders/in-progress/${value}`)}
              className="px-3 py-2"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="in-review">In Review</TabsTrigger>
                <TabsTrigger value="in-revision">In Revision</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Applied Filters */}
          {(searchOrderId || dateFrom || dateTo) && (
            <div className="flex flex-wrap items-center gap-2 px-3">
              
              {searchOrderId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchOrderId}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-0 h-4 w-4 ml-1"
                    onClick={() => {
                      setSearchOrderId("");
                      loadOrders(1, true);
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  From: {new Date(dateFrom).toLocaleDateString()}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-0 h-4 w-4 ml-1"
                    onClick={() => {
                      setDateFrom("");
                      loadOrders(1, true);
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  To: {new Date(dateTo).toLocaleDateString()}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-0 h-4 w-4 ml-1"
                    onClick={() => {
                      setDateTo("");
                      loadOrders(1, true);
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {/* Clear All */}
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  setSearchOrderId("");
                  setDateFrom("");
                  setDateTo("");
                  loadOrders(1, true);
                }}
              >
                Clear All
              </Button>
            </div>
          )}


          {/* Scrollable Table */}
          <ScrollArea className="flex-1" ref={scrollRef} onScroll={handleScroll}>
            <div className="px-3 py-2">
              <OrdersTable orders={orders} />

              {loadingMore && !loadingInitial && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
