import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPECIALIZATIONS } from "@/types/profile";

interface SpecializationsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function SpecializationsStep({ value, onChange }: SpecializationsStepProps) {
  const toggleSpecialization = (spec: string) => {
    if (value.includes(spec)) {
      onChange(value.filter((s) => s !== spec));
    } else if (value.length < 5) {
      onChange([...value, spec]);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Your Specializations</h2>
        <p className="text-muted-foreground">
          Select up to 5 areas where you excel
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SPECIALIZATIONS.map((spec) => {
          const isSelected = value.includes(spec);
          const isDisabled = !isSelected && value.length >= 5;

          return (
            <button
              key={spec}
              onClick={() => toggleSpecialization(spec)}
              disabled={isDisabled}
              className={cn(
                "relative p-4 rounded-lg border-2 text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : isDisabled
                  ? "border-muted bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
                  : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50 text-foreground"
              )}
            >
              <span className="text-sm font-medium">{spec}</span>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {value.length}/5 specializations selected
      </p>
    </div>
  );
}
