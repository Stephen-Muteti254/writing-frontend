import { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  DollarSign,
  Eye,
  Filter,
  Loader2,
  Globe,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";

interface Order {
  id: string;
  title: string;
  subject?: string;
  type?: string;
  pages?: number;
  deadline?: string;
  budget?: number;
  status?: string;
  client?: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  created_at?: string;
}

export default function AvailableOrders() {
  const { tab = "all" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Redirect invalid tab
  if (!["all", "invited", "declined"].includes(tab)) {
    return <Navigate to="/writer/available-orders/all" replace />;
  }

  const handleDecline = async (orderId: string) => {
    try {
      await api.post(`/orders/${orderId}/decline`);
      toast({ title: "Order declined", description: "This order has been removed from your list." });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error?.message || "Failed to decline order.",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async (pageNum = 1, reset = false) => {
    try {
      const params: Record<string, any> = {
        page: pageNum,
        limit: 10,
      };

      if (tab !== "all") params.status = tab;
      if (searchQuery) params.search = searchQuery;

      // ADD FILTERS
      if (minBudget) params.min_budget = Number(minBudget);
      if (maxBudget) params.max_budget = Number(maxBudget);
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      if (reset) setInitialLoading(true);
      else setLoading(true);

      const res = await api.get("/orders", { params });

      const data = res.data?.data || res.data;
      const newOrders = data?.orders || [];
      const pagination = data?.pagination || {};

      if (reset) setOrders(newOrders);
      else setOrders(prev => [...prev, ...newOrders]);

      setHasMore(pagination.has_next || newOrders.length >= 10);
    } catch (err: any) {
      toast({
        title: "Failed to load orders",
        description: err.response?.data?.error?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setOrders([]);
    fetchOrders(1, true);
  }, [tab, searchQuery]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (bottom && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage);
    }
  };

  const applyFilters = () => {
    setFilterOpen(false);
    fetchOrders(1, true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Static Title */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl font-bold text-foreground">Available Orders</h1>
      </div>

      {/* Card Container */}
      <Card className="border-0 flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        {initialLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        
        <CardContent
          className={`flex-1 flex flex-col min-h-0 p-0 transition-opacity overflow-hidden ${
            initialLoading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {/* Static Toolbar - Tabs, Filters & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
            <div className="flex gap-4">
              {[
                { key: "all", label: "All" },
                { key: "invited", label: "Invited" },
                { key: "declined", label: "Declined" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => navigate(`/writer/available-orders/${t.key}`)}
                  className={`pb-1 px-2 text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filter Orders</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min Budget</Label>
                        <Input
                          type="number"
                          placeholder="$0"
                          value={minBudget}
                          onChange={(e) => setMinBudget(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Max Budget</Label>
                        <Input
                          type="number"
                          placeholder="$1000"
                          value={maxBudget}
                          onChange={(e) => setMaxBudget(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Date To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={applyFilters} className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
          </div>

          {/* Static Applied Filters */}
          {(minBudget || maxBudget || dateFrom || dateTo || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 flex-shrink-0">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-0 h-4 w-4 ml-1"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {minBudget && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Min: ${minBudget}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-0 h-4 w-4 ml-1"
                    onClick={() => {
                      setMinBudget("");
                      fetchOrders(1, true);
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {maxBudget && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Max: ${maxBudget}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-0 h-4 w-4 ml-1"
                    onClick={() => {
                      setMaxBudget("");
                      fetchOrders(1, true);
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
                      fetchOrders(1, true);
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
                      fetchOrders(1, true);
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              
              {/* Clear All Button */}
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  setMinBudget("");
                  setMaxBudget("");
                  setDateFrom("");
                  setDateTo("");
                  setSearchQuery("");
                  fetchOrders(1, true);
                }}
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Scrollable Orders List */}
          <ScrollArea
            className="flex-1 min-h-0 -mx-6 px-6 h-full"
            viewportClassName="h-full"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4 h-full">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/writer/order-details/${order.id}`)}
                >
                  <CardHeader className="p-2 pl-6 pb-1">
                    <CardTitle className="text-base font-semibold">
                      {order.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-sm text-muted-foreground p-2 pl-6 pt-0">
                    <div className="flex flex-wrap gap-3 justify-between items-center">
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline">{order.subject || "General"}</Badge>
                        <span>{order.type}</span>
                        <span>{order.pages} pages</span>
                        {order.deadline && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(order.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {order.client && (
                          <span className="flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            {order.client.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-base font-semibold flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {order.budget?.toFixed(2)}
                        </div>
                        <div className="inline-flex w-auto border divide-x">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-none border-0 shadow-none"
                            onClick={() => {
                              e.stopPropagation();
                              navigate(`/writer/order-details/${order.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-none border-0 shadow-none text-red-600"                          
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecline(order.id);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!initialLoading && loading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {!loading && orders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No available orders found.
                </p>
              )}

              {!hasMore && orders.length > 0 && (
                <p className="text-center text-muted-foreground py-6">
                  No more orders to load.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
