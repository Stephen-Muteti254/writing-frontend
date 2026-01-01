import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";

interface BioStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function BioStep({ value, onChange }: BioStepProps) {
  const charCount = value.length;
  const minChars = 100;
  const maxChars = 500;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Tell Us About Yourself</h2>
        <p className="text-muted-foreground">
          Write a compelling bio that showcases your expertise
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-base font-medium">
            Professional Bio
          </Label>
          <Textarea
            id="bio"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Share your experience, expertise, and what makes you a great writer..."
            className="min-h-[180px] resize-none text-base leading-relaxed"
            maxLength={maxChars}
          />
          <div className="flex justify-between text-sm">
            <span className={charCount < minChars ? "text-warning" : "text-muted-foreground"}>
              {charCount < minChars
                ? `${minChars - charCount} more characters needed`
                : "Looking good!"}
            </span>
            <span className="text-muted-foreground">
              {charCount}/{maxChars}
            </span>
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Tips for a great bio:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Highlight your years of experience and key achievements</li>
                <li>• Mention your areas of expertise and academic background</li>
                <li>• Keep it professional but personable</li>
                <li>• Use keywords that clients might search for</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
