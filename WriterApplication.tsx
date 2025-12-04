import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText, ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CountrySelect } from "@/components/CountrySelect";
import { PhoneInput } from "@/components/PhoneInput";
import { EducationLevelSelect } from "@/components/EducationLevelSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
}

const WriterApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    countryCode: "US",
    phoneNumber: "",
    country: "",
    city: "",
    education: "",
    specialization: "",
    yearsExperience: "",
    proficiencyAnswers: {} as Record<number, string>,
    selectedPrompt: "",
    promptResponse: "",
    selectedEssayTopic: "",
    essayFile: null as UploadedFile | null,
    workSamples: [] as UploadedFile[],
    cvFile: null as UploadedFile | null,
    degreeCertificates: [] as UploadedFile[],
  });

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const proficiencyQuestions = [
    { q: "Neither the teacher nor the students ___ willing to postpone the exam.", options: ["is", "are", "were", "have"] },
    { q: "If I ___ earlier, I wouldn't have missed the train.", options: ["leave", "had left", "left", "have left"] },
    { q: "Each of the reports ___ to be submitted before Friday.", options: ["need", "are needing", "needs", "have needed"] },
    { q: "Hardly ___ the announcement when the crowd started cheering.", options: ["had we heard", "we had heard", "did we hear", "have we heard"] },
    { q: "She acted as if she ___ everything about the project.", options: ["know", "knows", "had known", "will know"] },
    { q: "I wish I ___ to the meeting yesterday.", options: ["go", "went", "had gone", "have gone"] },
    { q: "The manager insisted that the report ___ completed immediately.", options: ["was", "be", "is", "being"] },
    { q: "Not only ___ late, but he also forgot his notes.", options: ["he arrived", "did he arrive", "he did arrive", "had he arrived"] },
    { q: "If she ___ harder, she would have passed the test.", options: ["studied", "had studied", "studies", "has studied"] },
    { q: "I'm looking forward to ___ you next week.", options: ["see", "seeing", "have seen", "saw"] },
    { q: "By the time we arrived, the movie ___.", options: ["had started", "started", "was starting", "starts"] },
    { q: "The committee has reached ___ decision after several meetings.", options: ["its", "it's", "their", "there"] },
    { q: "The book, together with the notes, ___ on the table.", options: ["are", "were", "is", "have been"] },
    { q: "The fewer mistakes you make, the ___ your grade will be.", options: ["better", "best", "good", "more better"] },
    { q: "Scarcely had I entered the room ___ the lights went out.", options: ["when", "than", "that", "and"] },
    { q: "I prefer tea ___ coffee.", options: ["to", "than", "from", "over"] },
    { q: "The doctor suggested that he ___ more rest.", options: ["takes", "take", "took", "had taken"] },
    { q: "Neither of them ___ attending the conference this year.", options: ["are", "were", "is", "have been"] },
    { q: "The report must be finished ___ Friday.", options: ["at", "until", "by", "in"] },
    { q: "If only he ___ the truth earlier!", options: ["knew", "has known", "had known", "know"] },
    { q: "You'd better ___ your assignment before midnight.", options: ["submit", "submitted", "to submit", "submits"] },
    { q: "She has been working here ___ 2018.", options: ["for", "since", "from", "at"] },
    { q: "The film was so boring that we wished we ___ stayed home.", options: ["have", "had", "have had", "had had"] },
    { q: "The more you practice, ___ you will perform.", options: ["best", "better", "good", "more better"] },
    { q: "He arrived late, ___ surprised everyone.", options: ["that", "which", "who", "what"] },
    { q: "We would rather you ___ the truth now.", options: ["tell", "told", "have told", "had told"] },
    { q: "Not until last year ___ how important time management is.", options: ["I realized", "I had realized", "did I realize", "have I realized"] },
    { q: "No sooner had they finished dinner ___ the phone rang.", options: ["when", "than", "that", "and"] },
    { q: "The house whose windows ___ broken needs urgent repair.", options: ["is", "are", "was", "has"] },
    { q: "She is one of those people who ___ always on time.", options: ["is", "was", "are", "has been"] },
  ];

  useEffect(() => {
    if (timerActive && timeLeft && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      toast({
        title: "Time's up!",
        description: "Please submit your response or move to the next step.",
        variant: "destructive",
      });
    }
  }, [timerActive, timeLeft, toast]);

  const startTimer = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileUpload = (field: string, files: FileList | null, multiple = false) => {
    if (!files || files.length === 0) return;

    if (multiple) {
      const uploadedFiles: UploadedFile[] = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      }));

      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as UploadedFile[]), ...uploadedFiles],
      }));

      toast({
        title: "Files uploaded",
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });
    } else {
      const file = files[0];
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      };

      setFormData((prev) => ({ ...prev, [field]: uploadedFile }));

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    }
  };

  const removeFile = (field: string, fileId?: string) => {
    if (fileId) {
      setFormData((prev) => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as UploadedFile[]).filter((f) => f.id !== fileId),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: null }));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.phoneNumber || !formData.country || !formData.city || !formData.education || !formData.specialization || !formData.yearsExperience) {
        toast({ title: "Incomplete information", description: "Please fill in all required fields.", variant: "destructive" });
        return;
      }
    } else if (currentStep === 2) {
      if (Object.keys(formData.proficiencyAnswers).length !== 30) {
        toast({ title: "Incomplete test", description: "Please answer all 30 questions.", variant: "destructive" });
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.selectedPrompt || !formData.promptResponse) {
        toast({ title: "Incomplete response", description: "Please select a prompt and provide your response.", variant: "destructive" });
        return;
      }
      const wordCount = formData.promptResponse.trim().split(/\s+/).length;
      if (wordCount < 100 || wordCount > 150) {
        toast({ title: "Word count requirement", description: "Your response must be between 100–150 words.", variant: "destructive" });
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.selectedEssayTopic || !formData.essayFile) {
        toast({ title: "Essay required", description: "Please select a topic and upload your essay.", variant: "destructive" });
        return;
      }
    } else if (currentStep === 6 && !formData.cvFile) {
      toast({ title: "CV required", description: "Please upload your CV.", variant: "destructive" });
      return;
    } else if (currentStep === 7 && formData.degreeCertificates.length === 0) {
      toast({ title: "Degree certificate required", description: "Please upload your degree certificate.", variant: "destructive" });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setTimerActive(false);
      setTimeLeft(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (currentStep + 1 === 3) startTimer(15);
      else if (currentStep + 1 === 4) startTimer(30);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = new FormData();

      payload.append("country", formData.country);
      payload.append("city", formData.city);
      payload.append("education", formData.education);
      payload.append("specialization", formData.specialization);
      payload.append("yearsExperience", formData.yearsExperience);
      payload.append("proficiencyAnswers", JSON.stringify(formData.proficiencyAnswers));
      payload.append("selectedPrompt", formData.selectedPrompt);
      payload.append("promptResponse", formData.promptResponse);
      payload.append("selectedEssayTopic", formData.selectedEssayTopic);

      if (formData.essayFile?.file) payload.append("essayFile", formData.essayFile.file);
      if (formData.cvFile?.file) payload.append("cvFile", formData.cvFile.file);
      formData.workSamples.forEach(f => f.file && payload.append("workSamples", f.file));
      formData.degreeCertificates.forEach(f => f.file && payload.append("degreeCertificates", f.file));

      const res = await api.post("/api/v1/applications/apply-writer", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Application submitted successfully",
        description: "Your application has been received and is under review.",
      });

      navigate("/application-pending");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProficiencyAnswer = (questionIndex: number, answer: string) => {
    setFormData((prev) => ({
      ...prev,
      proficiencyAnswers: { ...prev.proficiencyAnswers, [questionIndex]: answer },
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <PhoneInput
                countryCode={formData.countryCode}
                phoneNumber={formData.phoneNumber}
                onCountryChange={(code) => setFormData({ ...formData, countryCode: code })}
                onPhoneChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
              />
            </div>

            <div className="space-y-2">
              <Label>Country *</Label>
              <CountrySelect
                value={formData.country}
                onChange={(country) => setFormData({ ...formData, country })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                placeholder="New York"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <EducationLevelSelect
              value={formData.education}
              onChange={(education) => setFormData({ ...formData, education })}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="specialization">Area of Specialization *</Label>
              <Input
                id="specialization"
                type="text"
                placeholder="e.g., Data Science, Psychology, Business"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Writing Experience *</Label>
              <Input
                id="yearsExperience"
                type="number"
                placeholder="5"
                min="0"
                value={formData.yearsExperience}
                onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete all 30 questions to test your English proficiency. Select the correct answer for each question.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {proficiencyQuestions.map((question, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      {index + 1}. {question.q}
                    </Label>
                    <RadioGroup
                      value={formData.proficiencyAnswers[index] || ""}
                      onValueChange={(value) => handleProficiencyAnswer(index, value)}
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={String.fromCharCode(65 + optIndex)}
                            id={`q${index}-opt${optIndex}`}
                          />
                          <Label
                            htmlFor={`q${index}-opt${optIndex}`}
                            className="font-normal cursor-pointer"
                          >
                            {String.fromCharCode(65 + optIndex)}) {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              Completed: {Object.keys(formData.proficiencyAnswers).length} / 30 questions
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {timerActive && timeLeft !== null && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Time remaining</span>
                  <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Choose one prompt and respond in 100-150 words. You have 15 minutes. No AI-generated or plagiarized content allowed.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label>Select a prompt *</Label>
              <RadioGroup value={formData.selectedPrompt} onValueChange={(value) => setFormData({ ...formData, selectedPrompt: value })}>
                <div className="flex items-start space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="prompt1" id="prompt1" />
                  <Label htmlFor="prompt1" className="cursor-pointer flex-1 font-normal">
                    Do you believe technology has improved the quality of education, or has it created more distractions for students? Discuss your opinion with clear reasoning and examples.
                  </Label>
                </div>
                <div className="flex items-start space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="prompt2" id="prompt2" />
                  <Label htmlFor="prompt2" className="cursor-pointer flex-1 font-normal">
                    Some people think success is determined by hard work, while others believe luck plays a bigger role. Which do you agree with, and why?
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promptResponse">Your Response (100-150 words) *</Label>
              <Textarea
                id="promptResponse"
                placeholder="Type your response here..."
                value={formData.promptResponse}
                onChange={(e) => setFormData({ ...formData, promptResponse: e.target.value })}
                rows={8}
                className="resize-none"
                required
              />
              <p className="text-sm text-muted-foreground">
                Word count: {formData.promptResponse.trim().split(/\s+/).filter(w => w).length} / 100-150
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {timerActive && timeLeft !== null && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Time remaining</span>
                  <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Write a 275-350 word essay on one of the topics below. Upload as DOC/DOCX. You have 30 minutes. No plagiarism or AI-generated content.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label>Select essay topic *</Label>
              <RadioGroup value={formData.selectedEssayTopic} onValueChange={(value) => setFormData({ ...formData, selectedEssayTopic: value })}>
                <div className="flex items-start space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="topic1" id="topic1" />
                  <Label htmlFor="topic1" className="cursor-pointer flex-1 font-normal">
                    The Impact of Social Media on Human Communication: Has It Brought People Closer or Driven Them Apart?
                  </Label>
                </div>
                <div className="flex items-start space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="topic2" id="topic2" />
                  <Label htmlFor="topic2" className="cursor-pointer flex-1 font-normal">
                    Should College Education Be Free for All Students? Discuss the Benefits and Potential Drawbacks.
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Upload Essay (DOC/DOCX format) *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  id="essayFile"
                  className="hidden"
                  accept=".doc,.docx"
                  onChange={(e) => handleFileUpload("essayFile", e.target.files)}
                />
                <label htmlFor="essayFile" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload your essay
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    DOC or DOCX (275-350 words)
                  </p>
                </label>
              </div>
              {formData.essayFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{formData.essayFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(formData.essayFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("essayFile")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This step is optional. Upload samples of your previous work to showcase your writing skills and knowledge (max 3 files, 50 MB total).
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Work Samples (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  id="workSamples"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={(e) => handleFileUpload("workSamples", e.target.files, true)}
                />
                <label htmlFor="workSamples" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload work samples
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX (Max 3 files, 50 MB total)
                  </p>
                </label>
              </div>
              {formData.workSamples.length > 0 && (
                <div className="space-y-2">
                  {formData.workSamples.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile("workSamples", file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload your CV/Resume in English. Include educational background, professional experience, and recommendations if available.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>CV/Resume *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  id="cvFile"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload("cvFile", e.target.files)}
                />
                <label htmlFor="cvFile" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload your CV
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX (Max 50 MB)
                  </p>
                </label>
              </div>
              {formData.cvFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{formData.cvFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(formData.cvFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("cvFile")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload photos of your education certificate and/or academic transcripts. For non-English certificates, include English translations (JPG/JPEG format, max 3 files, 50 MB).
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Degree Certificate/Transcripts *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  id="degreeCertificates"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => handleFileUpload("degreeCertificates", e.target.files, true)}
                />
                <label htmlFor="degreeCertificates" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload certificates
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, JPEG, PNG, PDF (Max 3 files, 50 MB)
                  </p>
                </label>
              </div>
              {formData.degreeCertificates.length > 0 && (
                <div className="space-y-2">
                  {formData.degreeCertificates.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile("degreeCertificates", file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Writer Application</CardTitle>
            <CardDescription>
              Step {currentStep} of {totalSteps} - 
              {currentStep === 1 && " Professional Information"}
              {currentStep === 2 && " English Proficiency Test"}
              {currentStep === 3 && " Writing Prompt (15 minutes)"}
              {currentStep === 4 && " Essay Writing (30 minutes)"}
              {currentStep === 5 && " Work Samples (Optional)"}
              {currentStep === 6 && " CV/Resume Upload"}
              {currentStep === 7 && " Education Verification"}
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent>
            <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
              {renderStepContent()}

              <div className="flex justify-between pt-4 border-t">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < totalSteps ? (
                  <Button type="submit">
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WriterApplication;
