import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Skeleton - Using admin-page-header pattern */}
      <div className="admin-page-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {title ? (
            <h1 className="admin-page-title">{title}</h1>
          ) : (
            <Skeleton className="h-8 w-48" />
          )}
          <Skeleton className="h-4 w-72" />
        </div>
        {showActions && (
          <div className="admin-action-bar">
            <Skeleton className="h-10 w-28" style={{ borderRadius: 'var(--radius-md)' }} />
            <Skeleton className="h-10 w-32" style={{ borderRadius: 'var(--radius-md)' }} />
          </div>
        )}
      </div>

      {/* Search Skeleton */}
      {showSearch && (
        <div className="max-w-md">
          <Skeleton className="h-10 w-full" style={{ borderRadius: 'var(--radius-sm)' }} />
        </div>
      )}

      {/* Table Skeleton - Using admin-table-wrapper */}
      <Card className="admin-table-wrapper">
        <CardContent className="p-0">
          {/* Table Header - Fixed height 48px */}
          <div className="bg-muted/50 flex border-b border-border" style={{ padding: 'var(--space-3) var(--space-4)', gap: 'var(--space-4)', height: '48px', alignItems: 'center' }}>
            {[...Array(columns)].map((_, index) => (
              <Skeleton 
                key={index} 
                className="h-4" 
                style={{ width: `${Math.random() * 60 + 60}px` }} 
              />
            ))}
          </div>
          
          {/* Table Rows - Fixed height 56px for consistency */}
          {[...Array(rows)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="border-b border-border last:border-b-0 flex items-center"
              style={{ padding: 'var(--space-3) var(--space-4)', gap: 'var(--space-4)', height: '56px' }}
            >
              {[...Array(columns)].map((_, colIndex) => {
                // First column might have image
                if (colIndex === 0) {
                  return (
                    <div key={colIndex} className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                      <Skeleton className="h-10 w-10 shrink-0" style={{ borderRadius: 'var(--radius-sm)' }} />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  );
                }
                // Status column
                if (colIndex === columns - 2) {
                  return (
                    <Skeleton key={colIndex} className="h-6 w-20" style={{ borderRadius: 'var(--radius-full)' }} />
                  );
                }
                // Actions column
                if (colIndex === columns - 1) {
                  return (
                    <div key={colIndex} className="flex items-center ml-auto" style={{ gap: 'var(--space-2)' }}>
                      <Skeleton className="h-8 w-8" style={{ borderRadius: 'var(--radius-md)' }} />
                      <Skeleton className="h-8 w-8" style={{ borderRadius: 'var(--radius-md)' }} />
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
