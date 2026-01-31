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

