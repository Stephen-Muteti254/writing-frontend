import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, MoreVertical, Mail, Star, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";

interface Writer {
  id: string;
  full_name: string;
  email: string;
  rating: number;
  completed_orders: number;
  total_earned: number;
  status: "active" | "pending" | "suspended-temporary" | "suspended-permanent";
  joined_at: string;
}

export default function AdminWriters() {
  const { toast } = useToast();
  const [writers, setWriters] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWriter, setSelectedWriter] = useState<Writer | null>(null);
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false);
  const [activationDialogOpen, setActivationDialogOpen] = useState(false);

  // Suspension form
  const [suspensionType, setSuspensionType] = useState<"temporary" | "permanent">("temporary");
  const [suspensionReasons, setSuspensionReasons] = useState({
    blindBidding: false,
    erroneousSubmissions: false,
    lowRating: false,
    clientComplaints: false,
  });
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    const fetchWriters = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/writers");
        setWriters(res.data.writers || []);
        console.log(res.data);
      } catch (err) {
        toast({
          title: "Error Loading Writers",
          description: "Could not fetch writer data. Try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchWriters();
  }, [toast]);

  const handleSuspendWriter = async () => {
    if (!selectedWriter) return;
    const id = selectedWriter.id;

    const selectedReasons = Object.entries(suspensionReasons)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    if (selectedReasons.length === 0 && !additionalNotes.trim()) {
      toast({
        title: "Reason Required",
        description: "Please select at least one reason or write additional notes.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/admin/writers/${id}/suspend`, {
        type: suspensionType,
        reasons: selectedReasons,
        notes: additionalNotes,
      });
      setWriters((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, status: `suspended-${suspensionType}` as const } : w
        )
      );
      toast({
        title: "Writer Suspended",
        description: `The writer has been ${suspensionType}ly suspended.`,
      });
    } catch {
      toast({
        title: "Suspension Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
      setSuspensionDialogOpen(false);
    }
  };

  const handleActivateWriter = async (id: string) => {
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      await api.patch(`/admin/writers/${id}/activate`);
      setWriters((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: "active" } : w))
      );
      toast({ title: "Writer Activated", description: "Account reactivated successfully." });
    } catch {
      toast({
        title: "Activation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
      setActivationDialogOpen(false);
    }
  };

  const filteredWriters = writers.filter(
    (w) =>
      w.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadgeVariant = (status: Writer["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "suspended-temporary":
        return "outline";
      case "suspended-permanent":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <h1 className="text-2xl font-bold">Writer Management</h1>

      <Card className="border-0">
        <CardContent className="p-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search writers by name, email, or ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredWriters.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No approved writers found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredWriters.map((writer) => (
            <Card key={writer.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{writer.full_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{writer.email}</p>
                  </div>
                  <Badge variant={getBadgeVariant(writer.status)}>
                    {actionLoading[writer.id] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      writer.status.replace("-", " ")
                    )}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      {writer.status === "active" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedWriter(writer);
                            setSuspensionDialogOpen(true);
                          }}
                        >
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {writer.status.startsWith("suspended") && (
                        <DropdownMenuItem
                          onClick={() => handleActivateWriter(writer.id)}
                        >
                          Reactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span>{writer.rating.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>{writer.completed_orders} completed</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {writer.joined_at.split("T")[0]}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Suspension Dialog */}
      <Dialog open={suspensionDialogOpen} onOpenChange={setSuspensionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suspend Writer</DialogTitle>
          </DialogHeader>
          {selectedWriter && (
            <div className="space-y-4">
              <Select
                value={suspensionType}
                onValueChange={(val: "temporary" | "permanent") => setSuspensionType(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select suspension type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>

              {Object.entries(suspensionReasons).map(([key, val]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={val}
                    onCheckedChange={(checked) =>
                      setSuspensionReasons((r) => ({ ...r, [key]: checked as boolean }))
                    }
                  />
                  <label htmlFor={key} className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                </div>
              ))}

              <Textarea
                placeholder="Additional notes..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />

              <div className="flex items-center gap-2 bg-amber-50 border p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-700">
                  {suspensionType === "permanent"
                    ? "This will permanently suspend the account."
                    : "This will temporarily suspend the writer. You can reactivate later."}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setSuspensionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleSuspendWriter}>
                  Suspend
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
