export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}