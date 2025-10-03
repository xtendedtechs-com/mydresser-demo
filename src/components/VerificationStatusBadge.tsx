import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationStatusBadgeProps {
  status: "verified" | "pending" | "rejected" | "none";
  type?: "merchant" | "professional";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const VerificationStatusBadge = ({
  status,
  type = "merchant",
  size = "md",
  showIcon = true
}: VerificationStatusBadgeProps) => {
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      label: type === "merchant" ? "Verified Merchant" : "Verified Professional",
      variant: "default" as const,
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    pending: {
      icon: Clock,
      label: "Pending Verification",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    rejected: {
      icon: XCircle,
      label: "Verification Rejected",
      variant: "destructive" as const,
      className: "",
    },
    none: {
      icon: Shield,
      label: "Not Verified",
      variant: "outline" as const,
      className: "text-muted-foreground",
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "text-xs h-5",
    md: "text-sm h-6",
    lg: "text-base h-7",
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "flex items-center gap-1.5",
        sizeClasses[size],
        config.className
      )}
    >
      {showIcon && <IconComponent className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
      {config.label}
    </Badge>
  );
};
