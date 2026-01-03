import { useState } from "react";
import { useNavigate, useParams, useMatch } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Upload,
  X,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  Loader2,
  Users,
  Sparkles
} from "lucide-react";
import api from "@/lib/api";
import { useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Form validation schema
const orderFormSchema = z.object({
  title: z.string()
    .trim()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(200, { message: "Title must be less than 200 characters" }),
  description: z.string()
    .trim()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(50000, { message: "Description must be less than 50000 characters" }),
  category: z.string()
    .min(1, { message: "Please select a category" }),
  orderType: z.string()
    .min(1, { message: "Please select an order type" }),
  budget: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Budget must be a positive number"
    }),
  deadline: z.string()
    .min(1, { message: "Please select a deadline" }),
  pages: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Pages must be a positive number"
    }),
  format: z.string().optional(),
  citationStyle: z.string().optional(),
  language: z.string().optional(),
  additionalNotes: z.string()
    .trim()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface AttachedFile {
  id: string;
  file?: File;
  name: string;
  size: number;
  url?: string;
}

export default function OrderFormPage() {
  const { orderId } = useParams();
  const isEditing = Boolean(
    useMatch("/client/orders/:tab/:orderId/edit")
  );
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [preferredWriters, setPreferredWriters] = useState<Array<{ id: string; name: string }>>([]);
  const [writerInput, setWriterInput] = useState("");
  const [minimumBudget, setMinimumBudget] = useState<number | null>(null);
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);

  const [pricingValues, setPricingValues] = useState({
    category: "",
    orderType: "",
    pages: "",
    deadline: ""
  });

  // Initialize form with react-hook-form and zod validation
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      title: "",
      description: "",
      detailedRequirements: "",
      category: "",
      orderType: "",
      budget: "",
      deadline: "",
      pages: "",
      format: "",
      citationStyle: "",
      language: "en-us",
      additionalNotes: "",
    },
  });

  const [writerLookup, setWriterLookup] = useState<{
    loading: boolean;
    results: Array<{ id: string; name: string; avatar?: string }>;
    error?: string;
  }>({ loading: false, results: [] });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setPricingValues({
        category: values.category,
        orderType: values.orderType,
        pages: values.pages,
        deadline: values.deadline,
      });
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    const { category, orderType, pages, deadline } = pricingValues;

    if (!category || !orderType || !deadline) {
      setMinimumBudget(null);
      setIsBudgetLoading(false);
      return;
    }

    const delay = setTimeout(async () => {
      setIsBudgetLoading(true);
      try {
        const res = await api.post("/orders/pricing/preview", {
          category,
          orderType,
          pages: Number(pages || 1),
          deadline,
        });

        setMinimumBudget(res.data.min_budget ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsBudgetLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [pricingValues]);

  useEffect(() => {
    if (!isEditing) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/orders/${orderId}`);

        const data = res.data.data || res.data;
        console.log("Loaded order data:", data);

        // Safely normalize field names (backend → frontend)
        form.reset({
          title: data.title ?? "",
          description: data.description ?? "",
          category: data.subject || data.category || "",
          orderType: data.type || data.order_type || "",
          budget: data.budget ? String(data.budget) : "",
          deadline: data.deadline ? data.deadline.slice(0, 16) : "",
          pages: data.pages ? String(data.pages) : "",
          format: data.format || "",
          citationStyle: data.citation_style || "",
          language: data.language || "en-us",
          additionalNotes: data.additional_notes || "",
        });

        // Tags
        setTags(data.tags || []);

        // Preferred Writers
        setPreferredWriters(
          Array.isArray(data.preferred_writers)
            ? data.preferred_writers.map((w: any) => ({
                id: w.id || w.writer_id || "",
                name: w.name || w.username || "Unknown Writer",
              }))
            : []
        );

        // Existing files from backend
        const files = (data.files || []).map((f: any, index: number) => {
          const url = typeof f === "string" ? f : f.url;
          return {
            id: `existing-${index}`,
            name: url?.split("/").pop() || f.name || `attachment-${index + 1}`,
            size: f.size || 0,
            url,
          };
        });

        setAttachedFiles(files);
      
      } catch (error: any) {
        toast({
          title: "Failed to load order",
          description: error.response?.data?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [isEditing, orderId]);

  useEffect(() => {
    const fetchWriter = async () => {
    if (!writerInput.trim()) {
      setWriterLookup({ loading: false, results: [] });
      return;
    }

    setWriterLookup({ loading: true, results: [] });
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(writerInput.trim())}`);
      const results = res.data?.results || [];
      setWriterLookup({ loading: false, results });
    } catch (err: any) {
      setWriterLookup({
        loading: false,
        results: [],
        error: "No writers found",
      });
    }
  };
    // debounce (wait for user to stop typing)
    const delay = setTimeout(fetchWriter, 500);
    return () => clearTimeout(delay);
  }, [writerInput]);


  const addWriter = () => {
    if (writerInput.trim() && !preferredWriters.includes(writerInput.trim())) {
      setPreferredWriters([...preferredWriters, writerInput.trim()]);
      setWriterInput("");
    }
  };

  const removeWriter = (writer: string) => {
    setPreferredWriters(preferredWriters.filter(w => w !== writer));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const maxSize = 10 * 1024 * 1024;
      const validFiles: AttachedFile[] = [];
      
      Array.from(files).forEach(file => {
        if (file.size > maxSize) {
          toast({ title: "File Too Large", description: `${file.name} exceeds 10MB`, variant: "destructive" });
        } else {
          validFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size
          });
        }
      });

      setAttachedFiles([...attachedFiles, ...validFiles]);
    }
  };

  const removeFile = (id: string) => {
    setAttachedFiles(attachedFiles.filter(f => f.id !== id));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v) formData.append(k, v.toString());
      });

      // Tags
      tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));

      // Preferred Writers
      preferredWriters.forEach((w, i) => formData.append(`preferred_writers[${i}]`, w.id));

      // **Files**
      // --- Append existing file URLs first ---
      const existingFileUrls = attachedFiles
        .filter(f => f.url) // only existing files
        .map(f => f.url);

      existingFileUrls.forEach(url => formData.append("existingFiles", url));

      // --- Append new files ---
      attachedFiles
        .filter(f => f.file)
        .forEach(f => formData.append("attachedFiles", f.file!));


      const url = isEditing ? `/orders/${orderId}` : "/orders";
      const method = isEditing ? api.patch : api.post;

      const res = await method(url, formData, { headers: { "Content-Type": "multipart/form-data" } });

      toast({
        title: isEditing ? "Order Updated Successfully!" : "Order Created Successfully!",
        description: isEditing
          ? "Your changes have been saved."
          : "Writers will start bidding on your order soon.",
      });

      navigate("/client/orders");
    } catch (error: any) {
      console.log(error.response);
      toast({
        title: "Error",
        description: error.response.data.error.message || error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="h-full bg-background pr-2">
      <div className="shrink-0 bg-background">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading order details...</span>
          </div>
        ) : (
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Order" : "Create New Order"}
          </h1>
        </div>
        )}
      </div>
       
        <div className="flex-1 max-w-5xl mx-auto space-y-4 pb-10 mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Basic Information */}
            <Card className="border-border shadow-soft">
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-2">
                  <CardTitle>Project Details</CardTitle>
                </div>
                <CardDescription>
                  Provide a clear title and description of your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Comparative Literature Essay on Shakespeare"
                          className="bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a clear overview of what you need..."
                          className="min-h-[200px] resize-none bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {field.value?.length || 0} / 50000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="border-border shadow-soft">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle>Specifications</CardTitle>
                <CardDescription>
                  Define technical requirements and formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(val) => field.onChange(val)}
                            onBlur={() => field.onBlur?.()}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="literature">Literature</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="nursing">Nursing</SelectItem>
                              <SelectItem value="medicine">Medicine</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="psychology">Psychology</SelectItem>
                              <SelectItem value="art">Art</SelectItem>
                              <SelectItem value="philosophy">Philosophy</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="history">History</SelectItem>
                              <SelectItem value="geography">Geography</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="environmental-science">Environmental Science</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="political-science">Political Science</SelectItem>
                              <SelectItem value="economics">Economics</SelectItem>
                              <SelectItem value="biology">Biology</SelectItem>
                              <SelectItem value="physics">Physics</SelectItem>
                              <SelectItem value="mathematics">Mathematics</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="law">Law</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="orderType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Type</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || ""}
                            onValueChange={(val) => field.onChange(val)}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="essay">Essay</SelectItem>
                              <SelectItem value="research-paper">Research Paper</SelectItem>
                              <SelectItem value="discussion-post">Discussion Post</SelectItem>
                              <SelectItem value="editing">Editing</SelectItem>
                              <SelectItem value="resume">Resume</SelectItem>
                              <SelectItem value="cover-letter">Cover Letter</SelectItem>
                              <SelectItem value="rewriting">Rewriting</SelectItem>
                              <SelectItem value="admission-essay">Admission Essay</SelectItem>
                              <SelectItem value="outline">Outline</SelectItem>
                              <SelectItem value="thesis">Thesis</SelectItem>
                              <SelectItem value="dissertation">Dissertation</SelectItem>
                              <SelectItem value="case-study">Case Study</SelectItem>
                              <SelectItem value="lab-report">Lab Report</SelectItem>
                              <SelectItem value="presentation">Presentation</SelectItem>
                              <SelectItem value="coding-project">Coding Project</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pages <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 6"
                            min="1"
                            className="bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="docx">DOCX</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="pptx">PPTX</SelectItem>
                            <SelectItem value="xlsx">XLSX</SelectItem>
                            <SelectItem value="txt">TXT</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="citationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Citation Style <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mla">MLA</SelectItem>
                            <SelectItem value="apa">APA</SelectItem>
                            <SelectItem value="chicago">Chicago</SelectItem>
                            <SelectItem value="harvard">Harvard</SelectItem>
                            <SelectItem value="ieee">IEEE</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en-us">English (US)</SelectItem>
                            <SelectItem value="en-uk">English (UK)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific instructions or preferences for the writer..."
                          className="min-h-[80px] resize-none bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {field.value?.length || 0} / 1000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card className="border-border shadow-soft">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle>Budget & Timeline</CardTitle>
                <CardDescription>
                  Set your deadline and view the minimum required budget
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* DEADLINE FIELD FIRST */}
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="datetime-local"
                              className="pl-9 bg-background"
                              min={new Date().toISOString().slice(0, 16)}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* BUDGET FIELD */}
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input
                              type="number"
                              placeholder="0.00"
                              className="pl-9 bg-background"
                              min="1"
                              step="0.01"
                              disabled={isBudgetLoading}   // DISABLE WHILE LOADING
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormMessage />

                        {/* LOADING STATE */}
                        {isBudgetLoading && (
                          <p className="text-xs text-blue-600 flex items-center gap-1">
                            <span className="animate-spin w-3 h-3 border-[2px] border-blue-600 border-t-transparent rounded-full" />
                            Calculating minimum budget...
                          </p>
                        )}

                        {/* MINIMUM BUDGET */}
                        {!isBudgetLoading && minimumBudget !== null && (
                          <p className="text-xs text-yellow-600">
                            Minimum budget required: <b>${minimumBudget}</b>
                          </p>
                        )}

                        {/* TOO LOW WARNING */}
                        {!isBudgetLoading &&
                          form.watch("budget") &&
                          minimumBudget &&
                          form.watch("budget") < minimumBudget && (
                            <p className="text-xs text-red-600">
                              Your budget is too low for this project.
                            </p>
                        )}
                      </FormItem>
                    )}
                  />

                </div>
              </CardContent>
            </Card>


            {/* Tags and Writers - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tags */}
              <Card className="border-border shadow-soft">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-lg">Tags <span className="text-muted-foreground font-normal text-sm">(Optional)</span></CardTitle>
                  <CardDescription className="text-xs">
                    Add keywords to help writers find your order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Shakespeare, Drama"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="bg-background"
                    />
                    <Button 
                      type="button" 
                      onClick={addTag} 
                      variant="secondary"
                      size="icon"
                      className="shrink-0"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preferred Writers */}
              <Card className="border-border shadow-soft">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-lg">Preferred Writers <span className="text-muted-foreground font-normal text-sm">(Optional)</span></CardTitle>
                  <CardDescription className="text-xs">
                    Invite specific writers to bid on your order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Enter writer ID or name"
                        value={writerInput}
                        onChange={(e) => setWriterInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addWriter();
                          }
                        }}
                        className="bg-background"
                      />
                      <Button 
                        type="button" 
                        onClick={addWriter} 
                        variant="secondary"
                        size="icon"
                        className="shrink-0"
                        disabled={!writerLookup.found}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Writer suggestions */}
                    {writerLookup.loading && (
                      <p className="text-xs text-muted-foreground">Searching...</p>
                    )}

                    {writerLookup.results.length > 0 && (
                      <div className="space-y-1 border rounded-md p-2 bg-muted/30">
                        {writerLookup.results.map((w) => (
                          <div
                            key={w.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                            onClick={() => {
                              if (!preferredWriters.find((pw) => pw.id === w.id)) {
                                setPreferredWriters([...preferredWriters, { id: w.id, name: w.name ?? "Unknown" }]);
                              }
                              setWriterInput("");
                              setWriterLookup({ loading: false, results: [] });
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={w.avatar} alt={w.name} />
                              <AvatarFallback>{w.name?.[0] ?? "?"}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{w.name}</span>
                              <span className="text-xs text-muted-foreground">{w.id}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {writerLookup.error && (
                      <p className="text-xs text-destructive">{writerLookup.error}</p>
                    )}

                  </div>
                  {preferredWriters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {preferredWriters.map(writer => (
                      <Badge key={writer.id} variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5">
                        {writer.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() =>
                            setPreferredWriters(preferredWriters.filter(w => w.id !== writer.id))
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* File Attachments */}
            <Card className="border-border shadow-soft">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle>Attachments <span className="text-muted-foreground font-normal text-base">(Optional)</span></CardTitle>
                <CardDescription>
                  Upload reference materials, instructions, or templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1 text-foreground">
                    Drop files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PDF, DOC, DOCX, TXT, images (max 10MB per file)
                  </p>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                  <Label htmlFor="file-upload">
                    <Button type="button" variant="secondary" size="sm" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </Label>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    {attachedFiles.map(file => (
                      <div 
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            {file.url ? (
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-medium truncate text-foreground underline"
                              >
                                {file.name}
                              </a>
                            ) : (
                              <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="outline"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isEditing ? "Saving Changes..." : "Creating Order..."}
                  </>
                ) : (
                  isEditing ? "Save Changes" : "Create Order"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}