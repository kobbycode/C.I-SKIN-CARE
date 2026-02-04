import React from 'react';

export const SkeletonLine = (props: { className?: string; width?: string | number; height?: string | number }) => (
  <div
    className={`rounded bg-primary/10 dark:bg-white/10 animate-pulse ${props.className ?? ''}`}
    style={{
      width: props.width,
      height: props.height ?? '0.75rem' // Defaulting to h-3 (0.75rem)
    }}
  />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-primary/5 shadow-sm flex flex-col h-full">
    <div className="relative aspect-[4/5] overflow-hidden bg-primary/5 dark:bg-white/5 animate-pulse" />
    <div className="p-6 bg-luxury-brown text-white flex-1 flex flex-col justify-between">
      <div>
        <div className="h-3 w-24 rounded bg-white/10 animate-pulse mb-3" />
        <div className="h-5 w-3/4 rounded bg-white/10 animate-pulse" />
      </div>
      <div className="pt-4 border-t border-white/10 mt-6 flex justify-between items-end">
        <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-16 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  </div>
);

export const ShopSkeleton = (props: { count?: number }) => {
  const count = props.count ?? 6;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="group flex flex-col">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export const ProductDetailSkeleton = () => (
  <div className="pt-24 lg:pt-40 max-w-[1200px] mx-auto px-6 lg:px-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
      {/* Left: Image */}
      <div className="aspect-square bg-stone-100 dark:bg-stone-800 animate-pulse rounded-3xl border border-stone-200 dark:border-stone-700" />

      {/* Right: Info */}
      <div className="space-y-8 pt-4">
        <div className="space-y-4">
          {/* Title */}
          <div className="h-10 w-3/4 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
          {/* Stars */}
          <div className="flex gap-2">
            <div className="h-4 w-24 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
          </div>
          {/* Price */}
          <div className="h-8 w-32 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
        </div>

        {/* Variant Selectors */}
        <div className="space-y-3">
          <div className="h-3 w-20 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
          <div className="flex gap-3">
            <div className="h-10 w-16 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
            <div className="h-10 w-16 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 py-4">
          <div className="h-4 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
          <div className="h-4 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
        </div>

        {/* Buttons */}
        <div className="h-14 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
      </div>
    </div>
  </div>
);

export const JournalSkeleton = () => (
  <div className="min-h-screen bg-[#FDFCFB] dark:bg-stone-950 pt-40 pb-24">
    {/* Header */}
    <div className="max-w-4xl mx-auto text-center px-6 mb-24 flex flex-col items-center gap-6">
      <div className="h-4 w-32 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
      <div className="h-16 w-3/4 max-w-lg bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
      <div className="h-4 w-1/2 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
    </div>

    {/* Featured Post */}
    <div className="max-w-7xl mx-auto px-6 mb-32">
      <div className="rounded-[3rem] border border-stone-100 dark:border-stone-800 overflow-hidden h-[500px] bg-stone-50 dark:bg-stone-900 animate-pulse" />
    </div>

    {/* Grid */}
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col gap-4">
          <div className="aspect-[3/2] rounded-[2rem] bg-stone-100 dark:bg-stone-800 animate-pulse" />
          <div className="h-4 w-24 bg-stone-100 dark:bg-stone-800 animate-pulse rounded mt-2" />
          <div className="h-8 w-3/4 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
          <div className="h-20 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
        </div>
      ))}
    </div>
  </div>
);

export const ReviewsSkeleton = () => (
  <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16 flex flex-col items-center gap-4">
      <div className="h-14 w-64 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
      <div className="h-4 w-48 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
    </div>

    {/* Stats Box */}
    <div className="h-64 w-full bg-stone-50 dark:bg-stone-900 animate-pulse rounded-2xl mb-16 border border-stone-100 dark:border-stone-800" />

    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-64 bg-stone-50 dark:bg-stone-900 animate-pulse rounded-2xl border border-stone-100 dark:border-stone-800" />
      ))}
    </div>
  </div>
);


export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full">
    {/* Header */}
    <div className="h-12 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded-t-lg mb-1" />
    {/* Rows */}
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 w-full bg-stone-50 dark:bg-stone-900 animate-pulse rounded border border-stone-100 dark:border-stone-800" />
      ))}
    </div>
  </div>
);

export const AdminSkeleton = () => (
  <div className="p-8 space-y-8">
    <div className="flex justify-between items-center">
      <div className="h-8 w-48 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
      <div className="h-10 w-32 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-stone-50 dark:bg-stone-900 animate-pulse rounded-xl border border-stone-100 dark:border-stone-800" />
      ))}
    </div>
    <TableSkeleton rows={8} />
  </div>
);

export const OrderDetailSkeleton = () => (
  <div className="p-8 max-w-5xl mx-auto space-y-8">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
        <div className="h-4 w-32 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
      </div>
      <div className="h-10 w-32 bg-stone-100 dark:bg-stone-800 animate-pulse rounded" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <div className="h-64 bg-stone-50 dark:bg-stone-900 animate-pulse rounded-2xl" />
        <div className="h-40 bg-stone-50 dark:bg-stone-900 animate-pulse rounded-2xl" />
      </div>
      <div className="space-y-6">
        <div className="h-48 bg-stone-50 dark:bg-stone-900 animate-pulse rounded-2xl" />
        <div className="h-32 bg-stone-50 dark:bg-stone-900 animate-pulse rounded-2xl" />
      </div>
    </div>
  </div>
);

export const AppSkeleton = () => (
  <div className="min-h-screen bg-[#FDFCFB] dark:bg-stone-950 flex flex-col transition-colors duration-500">
    <div className="h-20 w-full border-b border-primary/5 bg-white/50 backdrop-blur-sm fixed top-0 z-50 animate-pulse" />
    <div className="flex-1 flex flex-col pt-20">
      {/* Hero Placeholder */}
      <div className="h-[80vh] w-full bg-stone-100 dark:bg-stone-900 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer" />
      </div>
    </div>
  </div>
);
