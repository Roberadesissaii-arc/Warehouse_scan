import { FloorEmptyPageSkeleton } from "@/components/shared/FloorEmptyPageSkeleton";

export function TasksSkeleton({ showIntro = true }: { showIntro?: boolean }) {
  return <FloorEmptyPageSkeleton showIntro={showIntro} />;
}
