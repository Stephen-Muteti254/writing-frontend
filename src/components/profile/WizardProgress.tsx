import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export function WizardProgress({ steps, currentStep, completedSteps }: WizardProgressProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full" />
        <div 
          className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        
        {/* Step indicators */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isPast = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted || isPast
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-card border-primary text-primary shadow-glow"
                      : "bg-muted border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[80px] transition-colors duration-300",
                    isCurrent ? "text-primary" : isPast ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
