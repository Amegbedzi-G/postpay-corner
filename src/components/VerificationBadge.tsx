
import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  size?: "sm" | "md" | "lg";
  tooltipText?: string;
}

export const VerificationBadge = ({ 
  size = "md", 
  tooltipText = "Verified Account" 
}: VerificationBadgeProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="ml-1 p-0.5 bg-blue-100 dark:bg-blue-900 border-none">
            <BadgeCheck className={`${sizeClasses[size]} text-blue-500`} />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
