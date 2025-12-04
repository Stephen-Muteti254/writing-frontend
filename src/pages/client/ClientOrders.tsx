import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye, Edit, Loader2, XCircle  } from "lucide-react";
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

interface Order {
  id: string;
  title: string;
  subject: string;
  type: string;
  pages: number;
  budget: number;
  status: string;
  deadline: string;
  created_at: string;
}

export default function ClientOrders() {
  const { tab = "in-progress" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderRef = useRef<HTMLTableRowElement | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const handleCancelOrder = async () => {
    if (!cancelId) return;

    try {
      // Call the cancel endpoint
      await api.post(`/orders/${cancelId}/cancel`, {});

      toast({
        title: "Order Cancelled",
        description: "This order has been successfully cancelled.",
      });

      // Refresh the table
      setOrders([]);
      setPage(1);
      fetchOrders(true);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to cancel order",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelId(null);
    }
  };


  // Fetch orders
  const fetchOrders = async (reset = false) => {
    try {
      if (reset) setInitialLoading(true);
      setLoading(true);

      const normalizedStatus =
        tab === "in-progress" ? "in_progress" : tab; // convert back for backend

      const res = await api.get("/orders", {
        params: { page, limit: 10, status: normalizedStatus },
      });

      console.log(res.data);

      const data = res.data || res.data;
      const newOrders = data.orders || [];

      setOrders((prev) => (reset ? newOrders : [...prev, ...newOrders]));
      setHasMore(page < data.pagination.total_pages);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to load orders",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Refetch when tab changes
  useEffect(() => {
    setPage(1);
    fetchOrders(true);
  }, [tab]);

  // Fetch next page
  useEffect(() => {
    if (page > 1) fetchOrders();
  }, [page]);

  // Infinite scroll setup
  const lastOrderElementRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
      lastOrderRef.current = node;
    },
    [loading, hasMore]
  );

  // Validation moved *after* hooks
  const validTabs = [
    { slug: "in-progress", label: "In Progress" },
    { slug: "completed", label: "Completed" },
    { slug: "cancelled", label: "Cancelled" },
  ];

  const currentTab = validTabs.find(t => t.slug === tab);
    if (!currentTab) {
      return null;
    }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <Button onClick={() => navigate("/client/create-order")}>
          + New Order
        </Button>
      </div>

      <Card className="border-0 h-[calc(100dvh-11rem)] overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Tabs */}
          <div className="flex px-3">
            {validTabs.map(({ slug, label }) => (
              <button
                key={slug}
                onClick={() => navigate(`/client/orders/${slug}`)}
                className={`pb-1 px-3 text-sm font-medium transition-colors ${
                  tab === slug
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Orders List */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {initialLoading ? (
                <div className="flex justify-center items-center py-20 text-muted-foreground">
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  Loading your orders...
                </div>
              ) : orders.length === 0 ? (
                <p className="text-center text-muted-foreground mt-8">
                  No orders found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {orders.map((order, index) => {
                      const isLast = index === orders.length - 1;
                      return (
                        <TableRow
                          key={order.id}
                          ref={isLast ? lastOrderElementRef : null}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.subject}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">${order.budget}</span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            {new Date(order.deadline).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex w-auto border divide-x">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-none border-0 shadow-none"
                                onClick={() => navigate(`/client/orders/view/${order.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {["in_progress", "draft"].includes(order.status) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-none border-0 shadow-none"
                                  onClick={() => navigate(`/client/orders/edit/${order.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {["in_progress", "draft"].includes(order.status) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-none border-0 shadow-none text-red-600"
                                  onClick={() => setCancelId(order.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {/* Loading spinner while fetching next page */}
              {loading && !initialLoading && (
                <div className="flex justify-center items-center py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading more...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      {cancelId && (
        <AlertDialog open={!!cancelId}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel This Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.

                You will <strong>NOT</strong> be able to reopen or edit this order after cancellation.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancelId(null)}>
                Keep Order
              </AlertDialogCancel>

              <AlertDialogAction
                className="text-red-600"
                onClick={handleCancelOrder}
                variant="outline"
              >
                Yes, Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
