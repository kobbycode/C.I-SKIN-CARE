import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    fallbackSrc = '', // No default local file to avoid secondary 404s
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [imgSrc, setImgSrc] = useState<string>('');

    // Update internal state if prop changes
    useEffect(() => {
        if (src) {
            // Encode URI to handle spaces in filenames, but only for relative paths
            const cleanSrc = (src.startsWith('http') || src.startsWith('data:')) ? src : encodeURI(src);
            setImgSrc(cleanSrc);
            setIsLoaded(false);
            setHasError(false);
        } else {
            setImgSrc('');
            setHasError(true);
        }
    }, [src]);

    const handleError = () => {
        if (!hasError) {
            console.warn(`OptimizedImage: Failed to load ${imgSrc}. Switching to fallback.`);
            setHasError(true);
            if (fallbackSrc && fallbackSrc !== imgSrc) {
                setImgSrc(fallbackSrc);
            } else {
                setImgSrc(''); // Clear src to stop retry loop
            }
            setIsLoaded(true);
        }
    };

    return (
        <div className={`relative overflow-hidden bg-stone-100 dark:bg-stone-900 ${className}`}>
            {/* Skeleton / Placeholder while loading */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-primary/10 animate-pulse z-10" />
            )}

            {/* Error State: Icon/Placeholder */}
            {hasError && !imgSrc && (
                <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                    <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                </div>
            )}

            {imgSrc && (
                <img
                    src={imgSrc}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={handleError}
                    loading={props.loading ?? 'lazy'}
                    decoding={(props as any).decoding ?? 'async'}
                    {...props}
                />
            )}
        </div>
    );
};

export default OptimizedImage;
