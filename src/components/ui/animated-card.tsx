import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverScale?: boolean;
  fadeIn?: boolean;
  delay?: number;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hoverScale = true, fadeIn = true, delay = 0, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          hoverScale && "hover-scale transition-all duration-300",
          fadeIn && "animate-fade-in",
          className
        )}
        style={fadeIn ? { animationDelay: `${delay}ms` } : undefined}
        {...props}
      />
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
