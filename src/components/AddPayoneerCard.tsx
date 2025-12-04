import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, Sparkles, Loader2 } from "lucide-react";

interface AddPayoneerCardProps {
  onAdd: (email: string) => Promise<void>;
  disabled?: boolean;
  initialEmail?: string;
  isEditMode?: boolean;
}

export function AddPayoneerCard({
  onAdd,
  disabled,
  initialEmail = "",
  isEditMode = false,
}: AddPayoneerCardProps) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setEmail(initialEmail), [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setLoading(true);

    try {
      await onAdd(email.trim());
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <Card className="relative overflow-hidden border bg-gradient-card shadow-card">
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />

      <div className="relative p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {isEditMode ? "Edit Payoneer Email" : "Add Payoneer Account"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Payoneer Email Address</Label>

            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled || loading}
              required
            />

            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!email.trim() || disabled || loading}
            className="w-full flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Add Payment Method"
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
