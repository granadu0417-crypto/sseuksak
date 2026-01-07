/**
 * Unsplash API Client for sseuksak.com
 *
 * API Access Key: VyTmWNB_q0VXb6huTPvE8qBovQIYU-dVmtAjrTyxhQ0
 * Rate Limit: 50 requests/hour (Demo), 5000 requests/hour (Production)
 */

const UNSPLASH_ACCESS_KEY = 'VyTmWNB_q0VXb6huTPvE8qBovQIYU-dVmtAjrTyxhQ0';
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    profile_url: string;
  };
  links: {
    html: string;
    download_location: string;
  };
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

// Category to search keyword mapping
const categoryKeywords: Record<string, string[]> = {
  finance: ['money', 'investment', 'stock market', 'finance', 'banking'],
  insurance: ['insurance', 'protection', 'security', 'legal', 'document'],
  health: ['health', 'fitness', 'wellness', 'healthy food', 'exercise'],
  tech: ['technology', 'computer', 'ai', 'digital', 'innovation'],
  education: ['education', 'learning', 'study', 'books', 'graduation'],
  lifestyle: ['lifestyle', 'home', 'living', 'modern', 'daily life'],
};

// In-memory cache for build time
const imageCache = new Map<string, UnsplashPhoto>();

/**
 * Generate a deterministic hash from a string (for seeded randomness)
 * Uses simple hash function to convert slug to a consistent number
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 * Same seed always produces same sequence
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Search photos from Unsplash API
 */
export async function searchPhotos(
  query: string,
  options: { perPage?: number; page?: number; orientation?: 'landscape' | 'portrait' | 'squarish' } = {}
): Promise<UnsplashSearchResult | null> {
  const { perPage = 10, page = 1, orientation = 'landscape' } = options;

  try {
    const params = new URLSearchParams({
      query,
      per_page: perPage.toString(),
      page: page.toString(),
      orientation,
    });

    const response = await fetch(
      `${UNSPLASH_API_BASE}/search/photos?${params}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data as UnsplashSearchResult;
  } catch (error) {
    console.error('Failed to fetch from Unsplash:', error);
    return null;
  }
}

/**
 * Get a consistent photo for a specific category and slug
 * Uses slug-based seeding to ensure same post always gets same image
 */
export async function getPhotoForCategory(
  category: string,
  slug?: string
): Promise<UnsplashPhoto | null> {
  // Use slug for cache key if provided, otherwise use category
  const cacheKey = slug ? `slug_${slug}` : `category_${category}`;

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  const keywords = categoryKeywords[category] || categoryKeywords.lifestyle;

  // Use seeded random based on slug for consistent keyword selection
  // If no slug provided, fall back to first keyword for consistency
  let keywordIndex: number;
  if (slug) {
    const seed = hashString(slug);
    keywordIndex = Math.floor(seededRandom(seed) * keywords.length);
  } else {
    keywordIndex = 0;
  }

  const selectedKeyword = keywords[keywordIndex];

  // Also use slug to select consistent photo from results
  const perPage = slug ? 10 : 1; // Get more options when we have a slug
  const result = await searchPhotos(selectedKeyword, { perPage });

  if (result && result.results.length > 0) {
    let photo: UnsplashPhoto;

    if (slug && result.results.length > 1) {
      // Use seeded random to pick consistent photo from results
      const photoSeed = hashString(slug + '_photo');
      const photoIndex = Math.floor(seededRandom(photoSeed) * result.results.length);
      photo = result.results[photoIndex];
    } else {
      photo = result.results[0];
    }

    imageCache.set(cacheKey, photo);
    return photo;
  }

  return null;
}

/**
 * Get photo by specific query (for tags or custom search)
 */
export async function getPhotoByQuery(query: string): Promise<UnsplashPhoto | null> {
  const cacheKey = `query_${query}`;

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  const result = await searchPhotos(query, { perPage: 1 });

  if (result && result.results.length > 0) {
    const photo = result.results[0];
    imageCache.set(cacheKey, photo);
    return photo;
  }

  return null;
}

/**
 * Get optimized image URL with custom dimensions
 * Unsplash supports dynamic resizing via URL parameters
 */
export function getOptimizedImageUrl(
  photo: UnsplashPhoto,
  options: { width?: number; height?: number; quality?: number; format?: 'auto' | 'webp' | 'jpg' } = {}
): string {
  const { width = 800, quality = 80, format = 'auto' } = options;

  // Use raw URL and add parameters for optimization
  const url = new URL(photo.urls.raw);
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', quality.toString());
  url.searchParams.set('fm', format);
  url.searchParams.set('fit', 'crop');

  return url.toString();
}

/**
 * Generate attribution text (required by Unsplash API guidelines)
 */
export function getAttribution(photo: UnsplashPhoto): {
  text: string;
  photographerUrl: string;
  unsplashUrl: string;
} {
  const utmParams = 'utm_source=sseuksak&utm_medium=referral';

  return {
    text: `Photo by ${photo.user.name} on Unsplash`,
    photographerUrl: `https://unsplash.com/@${photo.user.username}?${utmParams}`,
    unsplashUrl: `https://unsplash.com?${utmParams}`,
  };
}

/**
 * Trigger download event (required by Unsplash API guidelines)
 * Should be called when a photo is "used" (displayed prominently, downloaded, etc.)
 */
export async function triggerDownload(photo: UnsplashPhoto): Promise<void> {
  try {
    await fetch(photo.links.download_location, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
  } catch (error) {
    console.error('Failed to trigger download:', error);
  }
}

/**
 * Get multiple photos for a category (useful for galleries or carousels)
 */
export async function getPhotosForCategory(
  category: string,
  count: number = 5
): Promise<UnsplashPhoto[]> {
  const keywords = categoryKeywords[category] || categoryKeywords.lifestyle;
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

  const result = await searchPhotos(randomKeyword, { perPage: count });

  return result?.results || [];
}
