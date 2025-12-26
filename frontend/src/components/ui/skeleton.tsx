import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-shimmer", className)}
      {...props}
    />
  );
}

// Pre-built skeleton variants
function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-4 w-full rounded-full", className)} {...props} />;
}

function SkeletonHeading({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-8 w-3/4 rounded-full", className)} {...props} />;
}

function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-12 w-12 rounded-full", className)} {...props} />;
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4 p-6 rounded-2xl bg-sand-100", className)} {...props}>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-6 w-3/4 rounded-full" />
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-2/3 rounded-full" />
    </div>
  );
}

function SkeletonBlogCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-6 w-full rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonServiceCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 rounded-2xl bg-sand-100 space-y-4", className)} {...props}>
      <Skeleton className="h-14 w-14 rounded-xl" />
      <Skeleton className="h-6 w-2/3 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonHeading, 
  SkeletonAvatar, 
  SkeletonCard,
  SkeletonBlogCard,
  SkeletonServiceCard
};
