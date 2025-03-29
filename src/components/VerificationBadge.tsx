
import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  size?: "sm" | "md" | "lg";
  tooltipText?: string;
  badgeType?: "admin" | "verified" | "subscriber";
}

export const VerificationBadge = ({ 
  size = "md", 
  tooltipText = "Verified Account",
  badgeType = "verified"
}: VerificationBadgeProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  // Different colors based on badge type
  const badgeColors = {
    admin: "bg-purple-100 dark:bg-purple-900 text-purple-500",
    verified: "bg-blue-100 dark:bg-blue-900 text-blue-500",
    subscriber: "bg-green-100 dark:bg-green-900 text-green-500"
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`ml-1 p-0.5 border-none ${badgeColors[badgeType]}`}>
            <BadgeCheck className={`${sizeClasses[size]}`} />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
