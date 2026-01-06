import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import { PaymentMethodCard } from "@/components/PaymentMethodCard";
import { AddPayoneerCard } from "@/components/AddPayoneerCard";
import { ComingSoonCard } from "@/components/ComingSoonCard";

import useBalance from "@/hooks/useBalance";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const TABS = ["transactions", "withdrawals", "methods"];
const LIMIT = 10;

export default function Balance() {
  const { tab = "transactions" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!TABS.includes(tab)) {
    return <Navigate to="/writer/balance/transactions" replace />;
  }

  // -----------------------------
  // State
  // -----------------------------
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [txPage, setTxPage] = useState(1);
  const [wdPage, setWdPage] = useState(1);

  const [hasMoreTx, setHasMoreTx] = useState(true);
  const [hasMoreWd, setHasMoreWd] = useState(true);

  const [filters, setFilters] = useState<any>({});
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [pmLoading, setPmLoading] = useState(false);

  const { balance, loading: balLoading, reload: reloadBalance } = useBalance();

  const [methodsLoading, setMethodsLoading] = useState(true);

  // -----------------------------
  // Refs
  // -----------------------------
  const loadingRef = useRef(false);
  const searchTimeout = useRef<number | null>(null);

  const loadPaymentMethods = async () => {
    setMethodsLoading(true);
    try {
      const res = await api.get("/payment-methods");
      const data = res.data?.data || res.data;

      const list =
        Array.isArray(data?.methods) ? data.methods :
        Array.isArray(data) ? data :
        [];

      setMethods(list);
    } catch (err) {
      console.error(err);
      setMethods([]);
    }
    setMethodsLoading(false);
  };


  function parseISOToDate(iso: string) {
    if (!iso) return new Date(NaN);
    // Split at '.' to separate seconds from fractional part
    const [datePart, fracAndZone] = iso.split(".");
    if (!fracAndZone) return new Date(iso); // no fractional seconds

    // Take only first 3 digits of fractional seconds
    const millis = fracAndZone.slice(0, 3);
    return new Date(`${datePart}.${millis}Z`);
  }


  // fetch payment methods on initial mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // -----------------------------
  // Helpers
  // -----------------------------
  const getStatusIcon = (s: string) => {
    switch (s) {
      case "paid": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const extractList = (res: any, key: string) => {
    const data = res?.data ?? {};
    const list = Array.isArray(data[key]) ? data[key] : [];

    const page = data.pagination?.page ?? 1;
    const totalPages = data.pagination?.total_pages ?? 1;

    return {
      list,
      hasMore: page < totalPages,
      page,
    };
  };

  // -----------------------------
  // API Loaders
  // -----------------------------
  const loadTransactions = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      reset ? setLoadingInitial(true) : setLoadingMore(true);

      try {
        const res = await api.get("/transactions", {
          params: {
            page: pageNum,
            limit: LIMIT,
            order_id: filters.orderId,
            date_from: filters.dateFrom,
            date_to: filters.dateTo,
          },
        });

        console.log(res);

        const { list, hasMore } = extractList(res, "transactions");

        setTransactions(prev => (reset ? list : [...prev, ...list]));
        setHasMoreTx(Boolean((LIMIT * res.data.pagination.page) <= (res.data.pagination.total)));
        setTxPage(pageNum);
      } finally {
        loadingRef.current = false;
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );


  const loadWithdrawals = async (pageNum = 1, reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    reset ? setLoadingInitial(true) : setLoadingMore(true);

    try {
      const res = await api.get("/withdrawals", {
        params: { page: pageNum, limit: LIMIT },
      });

      const { list, hasMore } = extractList(res, "withdrawals");

      setWithdrawals(prev => reset ? list : [...prev, ...list]);
      setHasMoreWd(hasMore);
      setWdPage(pageNum);
    } finally {
      loadingRef.current = false;
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  };




  // -----------------------------
  // Reset + Load on tab change
  // -----------------------------
  useEffect(() => {
    if (tab === "transactions") {
      setTransactions([]);
      setTxPage(1);
      setHasMoreTx(true);
      loadTransactions(1, true);
    }

    if (tab === "withdrawals") {
      setWithdrawals([]);
      setWdPage(1);
      setHasMoreWd(true);
      loadWithdrawals(1, true);
    }

    if (tab === "methods") {
      (async () => {
        setLoadingInitial(true);
        await loadPaymentMethods();
        setLoadingInitial(false);
      })();
    }
  }, [tab]);

  // -----------------------------
  // Search debounce for Transactions
  // -----------------------------
  const handleSearchChange = (e: any) => {
    const value = e.target.value;

    setFilters(f => ({ ...f, orderId: value }));

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = window.setTimeout(() => {
      setTxPage(1);
      loadTransactions(1, true);
    }, 400);
  };

  // -----------------------------
  // ON SCROLL (same as AdminPayments)
  // -----------------------------
  const handleWindowScroll = useCallback(() => {
    if (loadingMore) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight < documentHeight - 200) return;

    if (tab === "transactions" && hasMoreTx) {
      loadTransactions(txPage + 1);
    }

    if (tab === "withdrawals" && hasMoreWd) {
      loadWithdrawals(wdPage + 1);
    }
  }, [
    tab,
    txPage,
    wdPage,
    hasMoreTx,
    hasMoreWd,
    loadingMore,
    loadTransactions,
  ]);


  useEffect(() => {
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [handleWindowScroll]);




  // -----------------------------
  // Withdrawal Action
  // -----------------------------
  const handleWithdrawal = async () => {
    setWithdrawError("");

    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      return setWithdrawError("Enter a valid amount.");
    }

    const method = methods.find(m => m.id === selectedMethodId);
    if (!method) {
      return setWithdrawError("Select a payment method.");
    }

    setWithdrawLoading(true);
    try {
      await api.post("/withdrawals", {
        amount,
        payment_method: method.method,
        payment_details: method.details,
      });

      toast({ title: "Success", description: "Withdrawal request submitted." });

      reloadBalance();
      loadWithdrawals(1, true);

      setWithdrawAmount("");
      setSelectedMethodId("");
    } catch (err: any) {
      const msg = err.response?.data?.error?.message ?? "Failed to submit request.";
      setWithdrawError(msg);
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setWithdrawLoading(false);
    }
  };


    // --------------------------
  // ADD PAYONEER METHOD
  // --------------------------
  const handleAddPayoneer = async (email: string) => {
    try {
      const res = await api.post("/payment-methods", {
        method: "Payoneer",
        details: email,
        is_default: true,
      });

      toast({
        title: "Success",
        description: "Payoneer method added successfully.",
      });

      await loadPaymentMethods();
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message || "Failed to add payment method";

      toast({
        variant: "destructive",
        title: "Error adding method",
        description: msg,
      });

      // propagate error to child
      throw new Error(msg);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="relative">
      {/* INITIAL LOADING OVERLAY */}
      {(loadingInitial || balLoading) && (
        <div className="absolute inset-0 bg-background/60 z-20 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-2xl font-bold text-muted-foreground">My Balance:</span>
          <span className="text-2xl font-bold">${balance?.balance ?? "0.00"}</span>
        </div>

        {/* Edit Payoneer */}
        <Dialog open={!!editingMethod} onOpenChange={() => setEditingMethod(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payoneer</DialogTitle>
            </DialogHeader>
            <AddPayoneerCard
              disabled={pmLoading}
              initialEmail={editingMethod?.details}
              isEditMode
              onAdd={async (email) => {
                try {
                  await api.patch(`/payment-methods/${editingMethod.id}`, { details: email });
                  toast({ title: "Updated!", description: "Payoneer details updated." });
                  setEditingMethod(null);
                  loadPaymentMethods();
                } catch (err: any) {
                  const msg = err.response?.data?.error?.message ?? "Failed.";
                  toast({ variant: "destructive", title: "Error", description: msg });
                }
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Withdraw */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Request Withdrawal
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div>
                <Label>Payment Method</Label>
                <select
                  className="border rounded-md w-full p-2"
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                >
                  <option value="">Select Method</option>
                  {methods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.method} — {m.details}
                    </option>
                  ))}
                </select>
              </div>

              {withdrawError && (
                <p className="text-sm text-red-500">{withdrawError}</p>
              )}

              <Button disabled={withdrawLoading} onClick={handleWithdrawal} className="w-full">
                {withdrawLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Submit Withdrawal"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* MAIN */}
      <Card className="p-0 border-0 mt-3">
        <CardContent className="p-0 flex flex-col">
          {/* TABS */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-3">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => navigate(`/writer/balance/${t}`)}
                  className={`pb-1 px-2 text-sm font-medium transition-colors ${
                    tab === t
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Search (only for transactions) */}
            <Input
              placeholder="Search Order ID..."
              value={filters.orderId ?? ""}
              onChange={handleSearchChange}
              className={`w-48 transition-opacity ${
                tab === "transactions" ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />
          </div>

          {/* CONTENT */}
            <div className="space-y-2">

              {/* Transactions */}
              {tab === "transactions" &&
                (transactions.length > 0 ? (
                  transactions.map((t) => (
                    <div key={t.id} className="flex items-start gap-4 p-3 rounded-md bg-muted">
                      <div className="p-2 rounded-full bg-accent">
                        {t.type === "earning" ? <ArrowDownLeft /> : <ArrowUpRight />}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium capitalize">{t.type}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {/*{new Date(t.created_at).toLocaleString()}*/}
                              {parseISOToDate(t.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className={`text-lg font-bold ${t.amount > 0 ? "text-green-500" : ""}`}>
                              ${Math.abs(t.amount)}
                            </p>
                            <div className="flex justify-end items-center gap-1 mt-1">
                              {getStatusIcon(t.status || 'completed')}
                              <span className="capitalize text-xs">{t.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  !loadingInitial && (
                    <p className="text-center text-muted-foreground">No transactions found.</p>
                  )
                ))}

              {/* Withdrawals */}
              {tab === "withdrawals" &&
                (withdrawals.length > 0 ? (
                  withdrawals.map((w) => (
                    <div key={w.id} className="rounded-md bg-accent/40 flex justify-between p-3">
                      <div>
                        <p className="font-medium">Withdrawal</p>
                        <p className="text-sm text-muted-foreground">
                          {parseISOToDate(w.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${w.amount}</p>
                        <div className="flex justify-end items-center gap-1">
                          {getStatusIcon(w.status)}
                          <span className="text-xs">{w.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  !loadingInitial && (
                    <p className="text-center text-muted-foreground">No withdrawals yet.</p>
                  )
                ))}

              {/* Methods */}
              {tab === "methods" && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {methodsLoading && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}

                  {!methodsLoading && methods.length === 0 && (
                    <>
                      <AddPayoneerCard onAdd={handleAddPayoneer} disabled={pmLoading} />
                      <ComingSoonCard />
                    </>
                  )}

                  {!methodsLoading && methods.length > 0 && (
                    <>
                      <div className="space-y-3">
                        {methods.map((m) => (
                          <PaymentMethodCard key={m.id} method={m} onEdit={setEditingMethod} />
                        ))}
                      </div>
                      <ComingSoonCard />
                    </>
                  )}
                </div>
              )}

              {/* Infinite scroll loader */}
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              {/* No more transactions */}
              {tab === "transactions" && !loadingMore && !hasMoreTx && transactions.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-3">
                  No more transactions
                </p>
              )}

              {/* No more withdrawals */}
              {tab === "withdrawals" && !loadingMore && !hasMoreWd && withdrawals.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-3">
                  No more withdrawal requests
                </p>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
