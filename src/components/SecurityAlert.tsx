import { AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SecurityAlertProps {
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  showIcon?: boolean;
}

const SecurityAlert = ({ type, title, message, showIcon = true }: SecurityAlertProps) => {
  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {showIcon && getIcon()}
      <AlertTitle className="flex items-center gap-2">
        {title}
        <Badge variant={getBadgeVariant()} className="text-xs">
          SECURITY
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2">
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default SecurityAlert;