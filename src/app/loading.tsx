import Skeleton from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
      <div role="status" aria-label="Chargement" className="flex flex-col">
        <header className="mb-8 flex flex-col items-center">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-40" />
        </header>

        <Skeleton className="mb-6 h-[88px] w-full rounded-xl" />

        <div className="flex flex-col gap-3">
          <Skeleton className="h-[74px] w-full rounded-xl" />
          <Skeleton className="h-[74px] w-full rounded-xl" />
          <Skeleton className="h-[74px] w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
