import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  pulse?: boolean;
  scale?: boolean;
}

export const AnimatedButton = ({ 
  className, 
  pulse = false,
  scale = true,
  ...props 
}: AnimatedButtonProps) => {
  return (
    <Button
      className={cn(
        "transition-all duration-200",
        scale && "hover:scale-105 active:scale-95",
        pulse && "animate-pulse",
        className
      )}
      {...props}
    />
  );
};
