import Skeleton from "@/components/Skeleton";

export default function CoachLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-8">
      <div role="status" aria-label="Chargement" className="flex flex-col gap-5">
        <header>
          <Skeleton className="h-4 w-32" />
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-5 w-20" />
          </div>
        </header>

        {/* Form card */}
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 flex flex-col gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1.5 h-11 w-full" />
              </div>
            ))}
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        {/* Progress card */}
        <Skeleton className="h-[120px] w-full rounded-xl" />

        {/* History */}
        <div>
          <Skeleton className="mb-3 h-5 w-28" />
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-t border-border-subtle px-4 py-3 first:border-t-0"
              >
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1.5 h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
