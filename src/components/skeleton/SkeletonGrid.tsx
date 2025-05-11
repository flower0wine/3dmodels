export default function SkeletonGrid() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800">
          <div className="h-48 w-full bg-gray-300 dark:bg-zinc-700"></div>
          <div className="p-4">
            <div className="h-5 bg-gray-300 dark:bg-zinc-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-1/2 mb-3"></div>
            <div className="flex justify-between mt-2">
              <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 