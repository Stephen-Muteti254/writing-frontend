import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, FileText, Edit, Users, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  title: string;
  subject: string;
  type: string;
  pages: number;
  budget: number;
  status: string;
  deadline: string;
  created_at: string;
  writer_assigned?: boolean;
}

interface FileExplorerItemProps {
  order: Order;
  onCancel: (orderId: string) => void;
  isExpanded?: boolean;
  onToggle?: (orderId: string) => void;
  currentTab?: string;
}

const SUBDIRECTORIES = [
  { slug: "view", label: "View Details", icon: FileText },
  { slug: "edit", label: "Edit Order", icon: Edit },
  { slug: "bids", label: "Bids", icon: Users },
  { slug: "submissions", label: "Submissions", icon: Upload },
];

export function FileExplorerItem({ 
  order, 
  onCancel, 
  isExpanded = false,
  onToggle,
  currentTab = "in-progress"
}: FileExplorerItemProps) {
  const navigate = useNavigate();
  const { orderId: currentOrderId } = useParams();
  const [isHovered, setIsHovered] = useState(false);

  const canCancel = order.status !== "completed" && order.status !== "cancelled";

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.(order.id);
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle expansion
    onToggle?.(order.id);

    // Navigate to view immediately
    navigate(`/client/orders/${currentTab}/${order.id}`);
  };

  const handleSubdirectoryClick = (slug: string) => {
    if (slug === "view") {
      navigate(`/client/orders/${currentTab}/${order.id}`);
    } else if (slug === "bids") {
      navigate(`/client/orders/${currentTab}/${order.id}/bids/all`);
    } else if (slug === "edit") {
      navigate(`/client/orders/${currentTab}/${order.id}/edit`);
    } else {
      navigate(`/client/orders/${currentTab}/${order.id}/${slug}`);
    }
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel(order.id);
  };

  return (
    <div className="select-none">
      {/* Main Order Item */}
      <div
        className={cn(
          "group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
          "hover:bg-accent/50",
          isExpanded && "bg-accent/30"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOrderClick}
      >
        {/* Expand Icon */}
        <button 
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleExpandClick}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">
            {order.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {order.subject} • {order.pages} pages
          </p>
        </div>

        {/* Cancel Button (on hover) */}
        {canCancel && isHovered && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleCancelClick}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Subdirectories Panel */}
      {isExpanded && (
        <div className="ml-2 mt-1 mb-2 rounded-sm border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          {SUBDIRECTORIES
            .filter(subdir => {
              // Do not show "Edit Order" for cancelled or completed orders
              if (subdir.slug === "edit" && order.writer_assigned) {
                return false;
              }

              if (subdir.slug === "edit" && (order.status === "cancelled" || order.status === "completed")) {
                return false;
              }

              return true;
            })
            .map((subdir) => {
              const Icon = subdir.icon;
              const pathname = window.location.pathname;

              const isActive =
                pathname.includes(`/client/orders/${currentTab}/${order.id}`) &&
                (
                  subdir.slug === "view"
                    ? pathname === `/client/orders/${currentTab}/${order.id}`
                    : pathname.includes(`/${subdir.slug}`)
                );

              return (
                <button
                  key={subdir.slug}
                  onClick={() => handleSubdirectoryClick(subdir.slug)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    "hover:bg-accent/50 border-b border-border/30 last:border-b-0",
                    isActive && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{subdir.label}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}