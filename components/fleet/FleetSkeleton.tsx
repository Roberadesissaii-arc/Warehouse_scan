import { FloorEmptyPageSkeleton } from "@/components/shared/FloorEmptyPageSkeleton";

export function FleetSkeleton({ showIntro = true }: { showIntro?: boolean }) {
  return <FloorEmptyPageSkeleton showIntro={showIntro} />;
}
