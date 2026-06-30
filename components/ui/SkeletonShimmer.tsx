import { cn } from "@/lib/utils";

export default function SkeletonShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn("shimmer rounded-xl", className)}
    />
  );
}
