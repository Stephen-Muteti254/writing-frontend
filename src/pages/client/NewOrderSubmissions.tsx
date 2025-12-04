import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Download, FileText, CheckCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const LIMIT = 10;

interface Submission {
  id: string;
  order_id: string;
  writer_id: string;
  message: string;
  files: Array<{ name: string; url: string; size?: number }>;
  status: string;
  created_at: string;
  updated_at?: string;
}

export default function OrderSubmissions() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [writerAssigned, setWriterAssigned] = useState(false);

  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const loadingRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Mock data for testing
  const MOCK_SUBMISSIONS: Submission[] = [
    {
      id: "sub-1",
      order_id: orderId || "1",
      writer_id: "writer-1",
      message: "Here's the completed research paper. I've included all the required sections with proper citations and references from peer-reviewed journals. The paper covers climate change impacts on ecosystems, policy recommendations, and future projections. Please review and let me know if you need any revisions.",
      files: [
        { name: "climate_change_research_final.pdf", url: "#", size: 2456789 },
        { name: "references_bibliography.docx", url: "#", size: 145632 },
        { name: "data_analysis.xlsx", url: "#", size: 567890 },
      ],
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    },
    {
      id: "sub-2",
      order_id: orderId || "1",
      writer_id: "writer-1",
      message: "Initial draft for your review. I've covered the main topics including climate science basics, global warming trends, and environmental impact assessments. This draft includes the introduction, methodology, and results sections. I would appreciate your feedback on the structure and content direction before finalizing the conclusion.",
      files: [
        { name: "draft_v1.pdf", url: "#", size: 1987654 },
        { name: "outline.docx", url: "#", size: 45632 },
      ],
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "reviewed",
    },
    {
      id: "sub-3",
      order_id: orderId || "1",
      writer_id: "writer-1",
      message: "Research notes and preliminary sources for your reference. I've compiled a comprehensive list of academic sources and structured an outline for the paper.",
      files: [
        { name: "research_notes.pdf", url: "#", size: 876543 },
      ],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "reviewed",
    },
  ];

  // Fetch submissions (using mock data)
  const fetchSubmissions = useCallback(
    async (p = 1, reset = false) => {
      if (!reset && loadingRef.current) return;
      loadingRef.current = true;

      try {
        reset ? setInitialLoading(true) : setLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));

        setWriterAssigned(true);
        setSubmissions(MOCK_SUBMISSIONS);
        setPage(1);
        setHasMore(false);
      } catch (err: any) {
        const msg =
          err?.response?.data?.error?.message || err?.message || "Failed to load submissions";
        toast({ title: "Error", description: msg, variant: "destructive" });
      } finally {
        setLoading(false);
        if (reset) setInitialLoading(false);
        loadingRef.current = false;
      }
    },
    [orderId, toast]
  );

  useEffect(() => {
    fetchSubmissions(1, true);
  }, [fetchSubmissions]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el || loadingRef.current || !hasMore) return;

    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      fetchSubmissions(page + 1);
    }
  }, [fetchSubmissions, hasMore, page]);

  // Request revision
  const handleRequestRevision = async () => {
    if (!selectedSubmissionId || !revisionMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide details about what needs to be revised.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post(`/orders/${orderId}/submissions/${selectedSubmissionId}/revision`, {
        message: revisionMessage,
      });

      toast({
        title: "Revision Requested",
        description: "The writer has been notified of your revision request.",
      });

      setShowRevisionDialog(false);
      setRevisionMessage("");
      setSelectedSubmissionId(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to request revision",
        variant: "destructive",
      });
    }
  };

  // Mark order complete
  const handleMarkComplete = async () => {
    try {
      await api.post(`/orders/${orderId}/complete`);

      toast({
        title: "Order Completed",
        description: "This order has been marked as complete.",
      });

      navigate("/client/orders/completed");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to mark order as complete",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/*<Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>*/}
        <h1 className="text-2xl font-bold">Order Submissions</h1>
      </div>

      <Card className="border-0 h-[calc(100dvh-10rem)] overflow-hidden relative">
        {initialLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <CardContent className="p-0 h-full">
          <ScrollArea ref={viewportRef} onScroll={handleScroll} className="h-full">
            <div className="p-4 pl-2 space-y-4">
              {/* No writer assigned message */}
              {!writerAssigned && !initialLoading && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Writer Assigned Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Once you accept a bid and assign a writer, their submissions will appear here.
                    </p>
                    <Button onClick={() => navigate(`/client/orders/${orderId}/bids`)}>
                      View Bids
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* No submissions yet */}
              {writerAssigned && submissions.length === 0 && !initialLoading && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Submissions Yet</h3>
                    <p className="text-muted-foreground">
                      The assigned writer hasn't submitted any work yet. Check back later or message
                      them for an update.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Submissions List */}
              {submissions.map((submission, index) => (
                <Card key={submission.id} className="border shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Submission #{submissions.length - index}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(submission.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge>{submission.status}</Badge>
                    </div>
                  </CardHeader>

                  <Separator />

                  <CardContent className="p-4 space-y-4">
                    {/* Writer Message */}
                    {submission.message && (
                      <div>
                        <Label className="text-sm font-semibold">Writer's Message:</Label>
                        <p className="mt-1 text-muted-foreground">{submission.message}</p>
                      </div>
                    )}

                    {/* Files */}
                    {submission.files && submission.files.length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold">Submitted Files:</Label>
                        <div className="mt-2 space-y-2">
                          {submission.files.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-primary/10">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{file.name}</p>
                                  {file.size && (
                                    <p className="text-xs text-muted-foreground">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" asChild>
                                <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubmissionId(submission.id);
                          setShowRevisionDialog(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Revision
                      </Button>

                      <Button size="sm" onClick={handleMarkComplete}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {loading && !initialLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              {!hasMore && submissions.length > 0 && (
                <p className="text-center py-3 text-muted-foreground text-sm">
                  No more submissions
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Please provide details about what needs to be revised or improved in this submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="revision-message">Revision Details *</Label>
            <Textarea
              id="revision-message"
              placeholder="Explain what changes you'd like to see..."
              value={revisionMessage}
              onChange={(e) => setRevisionMessage(e.target.value)}
              rows={5}
              required
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestRevision}>Send Revision Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
