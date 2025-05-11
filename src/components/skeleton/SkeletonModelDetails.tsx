export default function SkeletonModelDetails() {
  return (
    <div className="animate-pulse">
      <div className="h-96 w-full bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
      
      <div className="mt-6 space-y-4">
        <div>
          <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 