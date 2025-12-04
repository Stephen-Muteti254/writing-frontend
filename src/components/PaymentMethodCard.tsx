import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Mail, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentMethodCardProps {
  method: {
    id: string;
    method: string;
    details: string;
    is_default?: boolean;
  };
  onEdit: (method: any) => void; // NEW
}

export function PaymentMethodCard({ method, onEdit }: PaymentMethodCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-gradient-card shadow-card">
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      
      <div className="relative p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
              {method.method.toLowerCase() === "payoneer" ? (
                <Mail className="h-6 w-6" />
              ) : (
                <CreditCard className="h-6 w-6" />
              )}
            </div>
            {method.is_default && (
              <div className="absolute -top-1 -right-1 p-1 rounded-full bg-success shadow-sm">
                <CheckCircle2 className="h-3 w-3 text-success-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-lg">
                {method.method}
              </h3>

              {method.is_default && (
                <Badge
                  variant="secondary"
                  className="bg-success/10 text-success border-success/20 text-xs"
                >
                  Default
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {method.details}
            </p>
          </div>
        </div>

        {/* EDIT BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(method)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
