import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface OrderTrackingCardProps {
  order: {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    tracking_number?: string;
    estimated_delivery?: string;
    items: any[];
  };
}

const OrderTrackingCard = ({ order }: OrderTrackingCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStep(order.status);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
            <p className="text-sm text-muted-foreground">
              Placed on {format(new Date(order.created_at), 'MMM dd, yyyy')}
            </p>
          </div>
          <Badge variant={getStatusColor(order.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              {order.status}
            </span>
          </Badge>
        </div>

        {/* Progress Tracker */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber <= currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    {getStatusIcon(step)}
                  </div>
                  <p className="text-xs mt-2 capitalize">{step}</p>
                </div>
              );
            })}
          </div>
          
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Tracking Info */}
        {order.tracking_number && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tracking Number:</span>
              <span className="font-mono font-semibold">{order.tracking_number}</span>
            </div>
            {order.estimated_delivery && (
              <div className="flex items-center gap-2 text-sm mt-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Estimated Delivery:</span>
                <span className="font-semibold">
                  {format(new Date(order.estimated_delivery), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Items ({order.items.length})</h4>
          <div className="space-y-2">
            {order.items.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-12 h-12 bg-muted rounded" />
                <div className="flex-1">
                  <p className="font-medium">{item.name || 'Item'}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity || 1}</p>
                </div>
                <p className="font-semibold">${item.price || 0}</p>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-sm text-muted-foreground">
                +{order.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            View Details
          </Button>
          {order.status === 'delivered' && (
            <Button variant="default" className="flex-1">
              Rate Order
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OrderTrackingCard;
