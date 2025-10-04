import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  variant?: 'default' | 'wardrobe' | 'outfit' | 'market';
}

export const SkeletonCard = ({ variant = 'default' }: SkeletonCardProps) => {
  if (variant === 'wardrobe') {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="w-full aspect-square" />
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'outfit') {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="w-full aspect-[3/4]" />
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'market') {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="w-full aspect-square" />
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </CardContent>
    </Card>
  );
};

export const SkeletonGrid = ({ count = 6, variant = 'default' }: { count?: number; variant?: SkeletonCardProps['variant'] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
};
