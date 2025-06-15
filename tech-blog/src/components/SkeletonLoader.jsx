// Skeleton loader components for better perceived performance
export function PostCardSkeleton() {
  return (
    <div className="blog-card animate-pulse">
      <div className="category-tag-skeleton">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </div>
      <div className="card-content">
        <div className="card-header">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="card-footer mt-4">
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedPostSkeleton() {
  return (
    <div className="blog-card large featured md:col-span-2 animate-pulse">
      <div className="category-tag-skeleton">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
      <div className="card-content">
        <div className="card-header">
          <div className="h-8 bg-gray-300 rounded w-4/5 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
        <div className="card-footer mt-6">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

export function PostContentSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="article-header p-8 md:p-12 bg-gradient-to-r from-purple-50 to-blue-50 border-b-3 border-[#2c2c2c]">
        <div className="mb-6">
          <div className="h-6 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-5/6 mb-6"></div>
        <div className="flex gap-6 mb-6">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-[#2c2c2c]">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="article-content p-8 md:p-12">
        <div className="space-y-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded w-4/5"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          
          <div className="h-32 bg-gray-300 rounded w-full my-6"></div>
          
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-4/5"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <header className="blog-header p-5 md:px-10 md:py-5 flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
        <nav className="flex items-center gap-5 md:gap-10">
          <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
          <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
        </nav>
      </header>

      {/* Hero skeleton */}
      <section className="hero-section p-10 md:p-15">
        <div className="hero-content max-w-4xl mx-auto text-center animate-pulse">
          <div className="h-12 bg-gray-300 rounded w-4/5 mx-auto mb-5"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-4/5 mx-auto"></div>
        </div>
      </section>

      {/* Blog section skeleton */}
      <section className="blog-section p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeaturedPostSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </section>
    </div>
  );
} 