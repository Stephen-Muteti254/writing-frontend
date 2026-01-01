import { useState } from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { EducationEntry } from "@/types/profile";
import { cn } from "@/lib/utils";

interface EducationStepProps {
  value: EducationEntry[];
  onChange: (value: EducationEntry[]) => void;
}

export function EducationStep({ value, onChange }: EducationStepProps) {
  const [isAdding, setIsAdding] = useState(value.length === 0);
  const [newEntry, setNewEntry] = useState<Omit<EducationEntry, "id">>({
    degree: "",
    institution: "",
    year: "",
  });

  const addEntry = () => {
    if (newEntry.degree && newEntry.institution) {
      onChange([
        ...value,
        { ...newEntry, id: crypto.randomUUID() },
      ]);
      setNewEntry({ degree: "", institution: "", year: "" });
      setIsAdding(false);
    }
  };

  const removeEntry = (id: string) => {
    onChange(value.filter((e) => e.id !== id));
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Your Education</h2>
        <p className="text-muted-foreground">
          Add your academic credentials
        </p>
      </div>

      {/* Existing entries */}
      <div className="space-y-3">
        {value.map((entry, index) => (
          <Card
            key={entry.id}
            className={cn(
              "animate-scale-in border-border",
              `animation-delay-${index * 100}`
            )}
          >
            <CardContent className="p-4 flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{entry.degree}</p>
                  <p className="text-sm text-muted-foreground">{entry.institution}</p>
                  {entry.year && (
                    <p className="text-xs text-muted-foreground mt-1">{entry.year}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(entry.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new entry form */}
      {isAdding ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree / Qualification</Label>
              <Input
                id="degree"
                value={newEntry.degree}
                onChange={(e) => setNewEntry({ ...newEntry, degree: e.target.value })}
                placeholder="e.g., PhD in English Literature"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={newEntry.institution}
                onChange={(e) => setNewEntry({ ...newEntry, institution: e.target.value })}
                placeholder="e.g., Harvard University"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year (Optional)</Label>
              <Input
                id="year"
                value={newEntry.year}
                onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
                placeholder="e.g., 2020"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addEntry} disabled={!newEntry.degree || !newEntry.institution}>
                Add Education
              </Button>
              {value.length > 0 && (
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Qualification
        </Button>
      )}
    </div>
  );
}
