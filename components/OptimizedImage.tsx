import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    fallbackSrc = '/placeholder.jpg', // Ensure you have a placeholder or logic for it
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Skeleton / Placeholder while loading */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            )}

            <img
                src={hasError ? fallbackSrc : src}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    } ${className}`}
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setHasError(true);
                    setIsLoaded(true); // Stop skeleton
                }}
                loading={props.loading ?? 'lazy'}
                decoding={(props as any).decoding ?? 'async'}
                {...props}
            />
        </div>
    );
};

export default OptimizedImage;
