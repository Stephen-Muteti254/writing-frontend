import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface SubmissionFile {
  id: string;
  file: File;
  name: string;
  type: string;
}

// Mock order data
const mockOrders = {
  "AO-001": {
    id: "AO-001",
    title: "Business Plan for Tech Startup",
    client: "Enterprise Client",
    deadline: "2024-01-18",
    pages: 15
  },
  "AO-002": {
    id: "AO-002",
    title: "Comparative Literature Essay",
    client: "University Client",
    deadline: "2024-01-14",
    pages: 6
  }
};

const FILE_TYPES = [
  { value: "ai-report", label: "AI Report" },
  { value: "plagiarism-report", label: "Plagiarism Report" },
  { value: "draft", label: "Draft" },
  { value: "final", label: "Final" },
  { value: "additional", label: "Additional" },
  { value: "revision", label: "Revision" }
];

export default function SubmitWork() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState<SubmissionFile[]>([]);
  
  const order = mockOrders[orderId as keyof typeof mockOrders];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: SubmissionFile[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: "" // Will be selected by user
      }));
      setSubmissionFiles([...submissionFiles, ...newFiles]);
    }
  };

  const updateFileType = (id: string, type: string) => {
    setSubmissionFiles(submissionFiles.map(f => 
      f.id === id ? { ...f, type } : f
    ));
  };

  const removeFile = (id: string) => {
    setSubmissionFiles(submissionFiles.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submissionFiles.length === 0) {
      toast({
        title: "No Files Attached",
        description: "Please upload at least one file before submitting",
        variant: "destructive"
      });
      return;
    }

    // Check if all files have types selected
    const filesWithoutType = submissionFiles.filter(f => !f.type);
    if (filesWithoutType.length > 0) {
      toast({
        title: "Missing File Types",
        description: "Please select a type for all uploaded files",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Work Submitted Successfully!",
        description: "The client has been notified and will review your submission."
      });
      setIsSubmitting(false);
      navigate("/orders/in-progress/all");
    }, 1500);
  };

  if (!order) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Order not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Submit Work</h1>
            <p className="text-sm text-muted-foreground">Upload your completed work for review</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Submission Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload all required files for this submission
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.zip"
                  />
                  <Label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: PDF, DOC, DOCX, TXT, ZIP (Max 50MB per file)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {submissionFiles.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <Label>Uploaded Files</Label>
                    {submissionFiles.map((file) => (
                      <Card key={file.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                            
                            <div className="flex-1 space-y-3">
                              <div>
                                <p className="font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`type-${file.id}`} className="text-xs">
                                  File Type *
                                </Label>
                                <Select 
                                  value={file.type} 
                                  onValueChange={(value) => updateFileType(file.id, value)}
                                  required
                                >
                                  <SelectTrigger id={`type-${file.id}`} className="h-9">
                                    <SelectValue placeholder="Select file type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FILE_TYPES.map(type => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Type Guidelines */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">File Type Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Final:</span> The completed work ready for client review
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Draft:</span> Preliminary version for review
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">AI Report:</span> AI detection scan results
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Plagiarism Report:</span> Plagiarism check results
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Revision:</span> Updated version based on feedback
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Additional:</span> Supplementary materials
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex gap-3">
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
                disabled={isSubmitting || submissionFiles.length === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Work"}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Title</p>
                <p className="font-medium">{order.title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="font-mono text-sm">#{order.id}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Client</p>
                <p className="font-medium">{order.client}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                <p className="font-medium">{order.deadline}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Pages Required</p>
                <p className="font-medium">{order.pages} pages</p>
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-amber-900 dark:text-amber-100">Important</p>
                  <p className="text-amber-800 dark:text-amber-200">
                    Once submitted, the client will be notified immediately. Ensure all files are correct before submitting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files Summary */}
          {submissionFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Submission Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Files</span>
                    <span className="font-medium">{submissionFiles.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Files Typed</span>
                    <span className="font-medium">
                      {submissionFiles.filter(f => f.type).length} / {submissionFiles.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Size</span>
                    <span className="font-medium">
                      {(submissionFiles.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
