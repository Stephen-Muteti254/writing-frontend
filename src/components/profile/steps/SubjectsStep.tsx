import { Check, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/types/profile";

interface SubjectsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function SubjectsStep({ value, onChange }: SubjectsStepProps) {
  const [search, setSearch] = useState("");

  const filteredSubjects = SUBJECTS.filter((subject) =>
    subject.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSubject = (subject: string) => {
    if (value.includes(subject)) {
      onChange(value.filter((s) => s !== subject));
    } else if (value.length < 10) {
      onChange([...value, subject]);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Subject Expertise</h2>
        <p className="text-muted-foreground">
          Select up to 10 subjects you specialize in
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects..."
          className="pl-10"
        />
      </div>

      {/* Subject grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2">
        {filteredSubjects.map((subject) => {
          const isSelected = value.includes(subject);
          const isDisabled = !isSelected && value.length >= 10;

          return (
            <button
              key={subject}
              onClick={() => toggleSubject(subject)}
              disabled={isDisabled}
              className={cn(
                "relative px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : isDisabled
                  ? "border-muted bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
                  : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50 text-foreground"
              )}
            >
              <span className="pr-5">{subject}</span>
              {isSelected && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground">
          {value.length}/10 subjects selected
        </span>
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map((subject) => (
              <span
                key={subject}
                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
              >
                {subject}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
