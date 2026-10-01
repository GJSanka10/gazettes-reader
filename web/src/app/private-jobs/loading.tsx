import { JobListSkeleton } from "@/components/Chrome";

export default function Loading() {
  return (
    <div role="status">
      <div className="border-b border-rule bg-surface">
        <div className="mx-auto max-w-[1240px] space-y-4 px-4 pb-8 pt-10 md:px-8 md:pt-14">
          <div className="skeleton h-12 w-2/3 max-w-[560px] rounded" />
          <div className="skeleton h-4 w-full max-w-[620px] rounded" />
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-[1240px] px-4 md:px-8">
        <JobListSkeleton />
      </div>
    </div>
  );
}
