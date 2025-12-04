import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const educationLevels = [
  { value: "high_school", label: "High School Diploma / Secondary Education" },
  { value: "associate", label: "Associate Degree" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "postgraduate_diploma", label: "Postgraduate Diploma" },
  { value: "master", label: "Master's Degree" },
  { value: "mphil", label: "Master of Philosophy (MPhil)" },
  { value: "doctorate", label: "Doctorate (PhD, DBA, EdD, etc.)" },
  { value: "postdoctoral", label: "Post-Doctoral Research" },
];

interface EducationLevelSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export function EducationLevelSelect({
  value,
  onChange,
  label = "Highest Education Level",
  required = false,
}: EducationLevelSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="education-level">
        {label} {required && "*"}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="education-level" className="w-full bg-background">
          <SelectValue placeholder="Select your education level" />
        </SelectTrigger>
        <SelectContent className="bg-background border-border z-50">
          {educationLevels.map((level) => (
            <SelectItem key={level.value} value={level.value}>
              {level.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
