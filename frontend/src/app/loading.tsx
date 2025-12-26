import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-sand-100">
      <div className="container-fluid py-12">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-10">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>

        {/* Header skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Skeleton className="h-12 w-2/3 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-5 w-full max-w-xl mx-auto rounded-full" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
