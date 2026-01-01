import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Camera, FileText, Briefcase, GraduationCap, Languages, BookOpen } from "lucide-react";
import { WizardProgress } from "./WizardProgress";
import { ProfilePhotoStep } from "./steps/ProfilePhotoStep";
import { BioStep } from "./steps/BioStep";
import { SpecializationsStep } from "./steps/SpecializationsStep";
import { EducationStep } from "./steps/EducationStep";
import { LanguagesStep } from "./steps/LanguagesStep";
import { SubjectsStep } from "./steps/SubjectsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { WriterProfileData } from "@/types/profile";
import { toast } from "sonner";
import api from "@/lib/api";

interface PraofileCompletionWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: WriterProfileData) => void;
  initialData?: Partial<WriterProfileData>;
}

const STEPS = [
  { id: 1, title: "Photo", icon: <Camera className="h-4 w-4" /> },
  { id: 2, title: "Bio", icon: <FileText className="h-4 w-4" /> },
  { id: 3, title: "Specializations", icon: <Briefcase className="h-4 w-4" /> },
  { id: 4, title: "Education", icon: <GraduationCap className="h-4 w-4" /> },
  { id: 5, title: "Languages", icon: <Languages className="h-4 w-4" /> },
  { id: 6, title: "Subjects", icon: <BookOpen className="h-4 w-4" /> },
  { id: 7, title: "Review", icon: <Check className="h-4 w-4" /> },
];

const defaultData: WriterProfileData = {
  profileImage: null,
  bio: "",
  specializations: [],
  education: [],
  languages: [],
  subjects: [],
};


function getFirstMissingStep(
    data: Partial<WriterProfileData>
  ): number {
    if (!data.profileImage) return 1;
    if (!data.bio || data.bio.length < 100) return 2;
    if (!data.specializations || data.specializations.length === 0) return 3;
    if (!data.education || data.education.length === 0) return 4;
    if (!data.languages || data.languages.length === 0) return 5;
    if (!data.subjects || data.subjects.length === 0) return 6;
    return 7;
  }



export function ProfileCompletionWizard({
  isOpen,
  onOpenChange,
  onComplete,
  initialData,
}: ProfileCompletionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [data, setData] = useState<WriterProfileData>({
    ...defaultData,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!data.profileImage;
      case 2:
        return data.bio.length >= 100;
      case 3:
        return data.specializations.length >= 1;
      case 4:
        return data.education.length >= 1;
      case 5:
        return data.languages.length >= 1;
      case 6:
        return data.subjects.length >= 1;
      default:
        return true;
    }
  };


  function getStepPayload(step: number, data: WriterProfileData) {
    switch (step) {
      case 1:
        return { profileImage: data.profileImage };
      case 2:
        return { bio: data.bio };
      case 3:
        return { specializations: data.specializations };
      case 4:
        return { education: data.education };
      case 5:
        return { languages: data.languages };
      case 6:
        return { subjects: data.subjects };
      default:
        return {};
    }
  }


  const getValidationMessage = (step: number): string => {
    switch (step) {
      case 1:
        return "Please add a profile photo";
      case 2:
        return "Bio must be at least 100 characters";
      case 3:
        return "Select at least one specialization";
      case 4:
        return "Add at least one education entry";
      case 5:
        return "Add at least one language";
      case 6:
        return "Select at least one subject";
      default:
        return "";
    }
  };


  useEffect(() => {
    if (!initialData) return;

    const firstMissingStep = getFirstMissingStep(initialData);
    setCurrentStep(firstMissingStep);
  }, [initialData]);


  useEffect(() => {
    if (initialData?.completion_step) {
      setCurrentStep(initialData.completion_step);
    }
  }, [initialData]);


  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast.error(getValidationMessage(currentStep));
      return;
    }

    try {
      payload = {
        ...getStepPayload(currentStep, data),
        completion_step: currentStep + 1,
        completion_percent: Math.round((currentStep / (STEPS.length - 1)) * 100),
      }
      await api.put("/writer/profile", payload)

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }

      setCurrentStep((s) => s + 1);
    } catch {
      toast.error("Failed to save progress");
    }
  };


  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
      toast.success("Profile completed successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfilePhotoStep
            value={data.profileImage}
            onChange={(val) => setData({ ...data, profileImage: val })}
          />
        );
      case 2:
        return (
          <BioStep
            value={data.bio}
            onChange={(val) => setData({ ...data, bio: val })}
          />
        );
      case 3:
        return (
          <SpecializationsStep
            value={data.specializations}
            onChange={(val) => setData({ ...data, specializations: val })}
          />
        );
      case 4:
        return (
          <EducationStep
            value={data.education}
            onChange={(val) => setData({ ...data, education: val })}
          />
        );
      case 5:
        return (
          <LanguagesStep
            value={data.languages}
            onChange={(val) => setData({ ...data, languages: val })}
          />
        );
      case 6:
        return (
          <SubjectsStep
            value={data.subjects}
            onChange={(val) => setData({ ...data, subjects: val })}
          />
        );
      case 7:
        return <ReviewStep data={data} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-0">
          <DialogTitle className="sr-only">Complete Your Profile</DialogTitle>
          <WizardProgress
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 px-1">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep === STEPS.length ? (
            <Button
              variant="gradient"
              onClick={handleComplete}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? "Saving..." : "Complete Profile"}
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
