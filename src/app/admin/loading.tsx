import Skeleton from "@/components/Skeleton";

export default function AdminLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div role="status" aria-label="Chargement" className="flex flex-col gap-6">
        <header className="flex items-baseline justify-between gap-2">
          <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-7 w-48" />
          </div>
          <Skeleton className="h-4 w-24" />
        </header>

        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border-subtle bg-surface p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="mt-2 h-2 w-full" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} className="h-16 w-full bg-chip" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add-coach card */}
        <Skeleton className="h-[120px] w-full rounded-xl" />
      </div>
    </main>
  );
}
