import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  children: ReactNode;
  className?: string;
  onScroll?: () => void;
}

export function FileExplorer({ children, className, onScroll }: FileExplorerProps) {
  return (
    <ScrollArea className={cn("h-full w-full", className)} onScroll={onScroll}>
      <div className="space-y-1 p-2">
        {children}
      </div>
    </ScrollArea>
  );
}
