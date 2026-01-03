import { useState } from "react";
import { Plus, Trash2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LanguageEntry, LANGUAGES, PROFICIENCY_LEVELS } from "@/types/profile";
import { cn } from "@/lib/utils";

interface LanguagesStepProps {
  value: LanguageEntry[];
  onChange: (value: LanguageEntry[]) => void;
}

export function LanguagesStep({ value, onChange }: LanguagesStepProps) {
  const [isAdding, setIsAdding] = useState(value.length === 0);
  const [newEntry, setNewEntry] = useState<Omit<LanguageEntry, "id">>({
    language: undefined,
    proficiency: "fluent",
  });

  const addEntry = () => {
    if (newEntry.language && !value.find((e) => e.language === newEntry.language)) {
      onChange([...value, { ...newEntry, id: crypto.randomUUID() }]);
      setNewEntry({ language: undefined, proficiency: "fluent" }); // reset to undefined
      setIsAdding(false);
    }
  };

  const removeEntry = (id: string) => {
    onChange(value.filter((e) => e.id !== id));
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case "native":
        return "bg-success/10 text-success border-success/20";
      case "fluent":
        return "bg-primary/10 text-primary border-primary/20";
      case "advanced":
        return "bg-info/10 text-info border-info/20";
      case "intermediate":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const availableLanguages = LANGUAGES.filter(
    (lang) => !value.some((e) => e.language?.trim() === lang)
  );

  // Debug logs
  console.log("value:", value);
  console.log("availableLanguages:", availableLanguages);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Languages You Speak</h2>
        <p className="text-muted-foreground">
          Let clients know which languages you can write in
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
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Languages className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{entry.language}</span>
                  <Badge
                    variant="outline"
                    className={cn(getProficiencyColor(entry.proficiency))}
                  >
                    {PROFICIENCY_LEVELS.find((p) => p.value === entry.proficiency)?.label}
                  </Badge>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={newEntry.language ?? undefined} // ensure undefined if null
                  onValueChange={(val) => setNewEntry({ ...newEntry, language: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent portalled={true}
                    side="bottom"
                    align="start"
                    className="z-[9999] max-h-60 overflow-y-auto"
                  >
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proficiency</Label>
                <Select
                  value={newEntry.proficiency}
                  onValueChange={(val) =>
                    setNewEntry({ ...newEntry, proficiency: val as LanguageEntry["proficiency"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addEntry} disabled={!newEntry.language}>
                Add Language
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
        availableLanguages.length > 0 && (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Language
          </Button>
        )
      )}
    </div>
  );
}
