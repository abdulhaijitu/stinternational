import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AdminTableSkeletonProps {
  columns?: number;
  rows?: number;
  showSearch?: boolean;
  showActions?: boolean;
  title?: string;
}

const AdminTableSkeleton = ({
  columns = 6,
  rows = 8,
  showSearch = true,
  showActions = true,
  title,
}: AdminTableSkeletonProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          {title ? (
            <h1 className="text-2xl font-bold">{title}</h1>
          ) : (
            <Skeleton className="h-8 w-48" />
          )}
          <Skeleton className="h-4 w-72" />
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}
      </div>

      {/* Search Skeleton */}
      {showSearch && (
        <div className="max-w-md">
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {/* Table Skeleton */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="bg-muted/50 p-4 flex gap-4 border-b border-border/50">
            {[...Array(columns)].map((_, index) => (
              <Skeleton 
                key={index} 
                className="h-4" 
                style={{ width: `${Math.random() * 60 + 60}px` }} 
              />
            ))}
          </div>
          
          {/* Table Rows */}
          {[...Array(rows)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="p-4 border-b border-border/50 last:border-b-0 flex items-center gap-4"
            >
              {[...Array(columns)].map((_, colIndex) => {
                // First column might have image
                if (colIndex === 0) {
                  return (
                    <div key={colIndex} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded shrink-0" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  );
                }
                // Status column
                if (colIndex === columns - 2) {
                  return (
                    <Skeleton key={colIndex} className="h-6 w-20 rounded-full" />
                  );
                }
                // Actions column
                if (colIndex === columns - 1) {
                  return (
                    <div key={colIndex} className="flex items-center gap-2 ml-auto">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  );
                }
                // Regular columns
                return (
                  <Skeleton 
                    key={colIndex} 
                    className="h-4" 
                    style={{ width: `${Math.random() * 40 + 40}px` }} 
                  />
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTableSkeleton;
