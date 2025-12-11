import { getSupabaseClient } from './supabase';

// 버킷 이름 상수
export const BUCKETS = {
  SERVICE_IMAGES: 'service-images',
  AVATARS: 'avatars',
  REVIEW_IMAGES: 'review-images',
} as const;

// 파일 크기 제한 (bytes)
export const FILE_SIZE_LIMITS = {
  SERVICE_IMAGE: 5 * 1024 * 1024, // 5MB
  AVATAR: 2 * 1024 * 1024, // 2MB
  REVIEW_IMAGE: 5 * 1024 * 1024, // 5MB
} as const;

// 허용된 이미지 타입
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * 파일 유효성 검사
 */
export function validateImageFile(file: File, maxSize: number): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 이미지 형식입니다. (JPEG, PNG, WebP, GIF만 가능)',
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `파일 크기가 ${maxSizeMB}MB를 초과합니다.`,
    };
  }

  return { valid: true };
}

/**
 * 고유한 파일명 생성
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * 서비스 이미지 업로드
 */
export async function uploadServiceImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  const validation = validateImageFile(file, FILE_SIZE_LIMITS.SERVICE_IMAGE);
  if (!validation.valid) {
    return { url: null, error: validation.error! };
  }

  const supabase = getSupabaseClient();
  const fileName = generateUniqueFileName(file.name);
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKETS.SERVICE_IMAGES)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Service image upload error:', error);
    return { url: null, error: '이미지 업로드에 실패했습니다.' };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKETS.SERVICE_IMAGES)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, error: null };
}

/**
 * 여러 서비스 이미지 업로드
 */
export async function uploadServiceImages(
  files: File[],
  userId: string
): Promise<{ urls: string[]; errors: string[] }> {
  const results = await Promise.all(
    files.map(file => uploadServiceImage(file, userId))
  );

  const urls: string[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.url) {
      urls.push(result.url);
    }
    if (result.error) {
      errors.push(`${files[index].name}: ${result.error}`);
    }
  });

  return { urls, errors };
}

/**
 * 프로필 이미지 업로드
 */
export async function uploadAvatarImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  const validation = validateImageFile(file, FILE_SIZE_LIMITS.AVATAR);
  if (!validation.valid) {
    return { url: null, error: validation.error! };
  }

  const supabase = getSupabaseClient();
  const fileName = generateUniqueFileName(file.name);
  const filePath = `${userId}/${fileName}`;

  // 기존 아바타 삭제 (같은 폴더 내 모든 파일)
  const { data: existingFiles } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
    await supabase.storage.from(BUCKETS.AVATARS).remove(filesToDelete);
  }

  const { error } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Avatar upload error:', error);
    return { url: null, error: '프로필 이미지 업로드에 실패했습니다.' };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKETS.AVATARS)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, error: null };
}

/**
 * 리뷰 이미지 업로드
 */
export async function uploadReviewImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  const validation = validateImageFile(file, FILE_SIZE_LIMITS.REVIEW_IMAGE);
  if (!validation.valid) {
    return { url: null, error: validation.error! };
  }

  const supabase = getSupabaseClient();
  const fileName = generateUniqueFileName(file.name);
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKETS.REVIEW_IMAGES)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Review image upload error:', error);
    return { url: null, error: '리뷰 이미지 업로드에 실패했습니다.' };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKETS.REVIEW_IMAGES)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, error: null };
}

/**
 * 이미지 삭제
 */
export async function deleteImage(
  bucket: keyof typeof BUCKETS,
  filePath: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from(BUCKETS[bucket])
    .remove([filePath]);

  if (error) {
    console.error('Image delete error:', error);
    return { success: false, error: '이미지 삭제에 실패했습니다.' };
  }

  return { success: true, error: null };
}

/**
 * URL에서 파일 경로 추출
 */
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
  const pattern = new RegExp(`/storage/v1/object/public/${bucket}/(.+)`);
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * 서비스 이미지 삭제 (URL로)
 */
export async function deleteServiceImage(url: string): Promise<{ success: boolean; error: string | null }> {
  const filePath = extractFilePathFromUrl(url, BUCKETS.SERVICE_IMAGES);

  if (!filePath) {
    return { success: false, error: '잘못된 이미지 URL입니다.' };
  }

  return deleteImage('SERVICE_IMAGES', filePath);
}
