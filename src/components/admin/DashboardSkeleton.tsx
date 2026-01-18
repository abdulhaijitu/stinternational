import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const DashboardSkeleton = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats Cards Skeleton - Using token spacing */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="admin-stats-card">
            <CardContent style={{ padding: 'var(--space-4)' }}>
              <div className="flex items-center justify-between">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12" style={{ borderRadius: 'var(--radius-lg)' }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* B2B vs B2C Summary Skeleton */}
      <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
        {[...Array(2)].map((_, index) => (
          <Card key={index} className="admin-stats-card">
            <CardContent style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                <Skeleton className="h-10 w-10" style={{ borderRadius: 'var(--radius-lg)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                <div className="bg-muted/50 text-center" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Skeleton className="h-8 w-12 mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
                <div className="bg-muted/50 text-center" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Skeleton className="h-8 w-12 mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Tables Skeleton */}
      <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
        {[...Array(2)].map((_, index) => (
          <Card key={index} className="admin-table-wrapper">
            <CardHeader className="border-b border-border" style={{ padding: 'var(--space-4)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                  <Skeleton className="h-5 w-5" style={{ borderRadius: 'var(--radius-sm)' }} />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="bg-muted/50 flex" style={{ padding: 'var(--space-4)', gap: 'var(--space-4)' }}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              {/* Table Rows - Fixed height for consistency */}
              {[...Array(5)].map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="border-t border-border flex items-center"
                  style={{ padding: 'var(--space-4)', gap: 'var(--space-4)', height: '56px' }}
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" style={{ borderRadius: 'var(--radius-full)' }} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Widget Skeleton */}
      <Card className="admin-table-wrapper">
        <CardHeader style={{ padding: 'var(--space-4)' }}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-32" style={{ borderRadius: 'var(--radius-md)' }} />
          </div>
        </CardHeader>
        <CardContent style={{ padding: 'var(--space-4)' }}>
          <Skeleton className="h-64 w-full" style={{ borderRadius: 'var(--radius-lg)' }} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSkeleton;
