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

    const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

    // Update internal state if prop changes
    React.useEffect(() => {
        if (src) {
            // Encode URI to handle spaces in filenames
            const cleanSrc = src.startsWith('http') || src.startsWith('data:') ? src : encodeURI(src);
            setImgSrc(cleanSrc);
            setIsLoaded(false);
            setHasError(false);
        }
    }, [src]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Skeleton / Placeholder while loading */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            )}

            <img
                src={imgSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    } ${className}`}
                onLoad={() => setIsLoaded(true)}
                onError={(e) => {
                    console.error(`Failed to load image: ${src} (encoded: ${imgSrc})`, e);
                    setHasError(true);
                    setImgSrc(fallbackSrc);
                    setIsLoaded(true);
                }}
                loading={props.loading ?? 'lazy'}
                decoding={(props as any).decoding ?? 'async'}
                {...props}
            />
        </div>
    );
};

export default OptimizedImage;
