import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles } from "lucide-react";

interface ComingSoonCardProps {
  title?: string;
  description?: string;
}

export function ComingSoonCard({ 
  title = "Card Payments",
  description = "Direct card payments will be available soon! Get instant withdrawals to your debit or credit card."
}: ComingSoonCardProps) {
  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-border/50 bg-muted/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
      
      <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-xl bg-muted text-muted-foreground">
            <CreditCard className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground">
                {title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="border-0 px-4 py-1.5 animate-pulse shadow-md flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          Coming Soon
        </Badge>
      </div>
    </Card>
  );
}
