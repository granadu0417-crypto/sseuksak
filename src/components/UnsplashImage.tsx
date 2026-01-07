'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { UnsplashPhoto } from '@/lib/unsplash';
import { getOptimizedImageUrl, getAttribution, triggerDownload } from '@/lib/unsplash';

interface UnsplashImageProps {
  photo: UnsplashPhoto;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  className?: string;
  showAttribution?: boolean;
}

export default function UnsplashImage({
  photo,
  alt,
  width = 800,
  height,
  priority = false,
  fill = false,
  sizes,
  className = '',
  showAttribution = true,
}: UnsplashImageProps) {
  const hasTriggeredDownload = useRef(false);
  const imageUrl = getOptimizedImageUrl(photo, { width, quality: 80 });
  const attribution = getAttribution(photo);
  const altText = alt || photo.alt_description || photo.description || 'Image';

  // Trigger download event when image is displayed (required by Unsplash API guidelines)
  useEffect(() => {
    if (!hasTriggeredDownload.current && photo.links?.download_location) {
      hasTriggeredDownload.current = true;
      triggerDownload(photo);
    }
  }, [photo]);

  return (
    <div className="relative">
      {fill ? (
        <Image
          src={imageUrl}
          alt={altText}
          fill
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          className={className}
          priority={priority}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={altText}
          width={width}
          height={height || Math.round(width * (photo.height / photo.width))}
          className={className}
          priority={priority}
        />
      )}
      {showAttribution && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-xs text-white/80">
          <Link
            href={attribution.photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            {photo.user.name}
          </Link>
          {' / '}
          <Link
            href={attribution.unsplashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            Unsplash
          </Link>
        </div>
      )}
    </div>
  );
}
