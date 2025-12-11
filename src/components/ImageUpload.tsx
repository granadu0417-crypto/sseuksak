'use client';

import { useState, useRef, useCallback } from 'react';
import { validateImageFile, ALLOWED_IMAGE_TYPES, FILE_SIZE_LIMITS } from '@/lib/storage';

interface ImagePreview {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageUploadProps {
  maxImages?: number;
  maxFileSize?: number;
  onImagesChange: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
}

export default function ImageUpload({
  maxImages = 5,
  maxFileSize = FILE_SIZE_LIMITS.SERVICE_IMAGE,
  onImagesChange,
  existingImages = [],
  onRemoveExisting,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImages.length + previews.length;
  const canAddMore = totalImages < maxImages;

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - totalImages;

    if (fileArray.length > remainingSlots) {
      setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    const newPreviews: ImagePreview[] = [];
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const validation = validateImageFile(file, maxFileSize);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);

      newPreviews.push({ id, file, previewUrl });
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (newPreviews.length > 0) {
      setPreviews(prev => [...prev, ...newPreviews]);
      // 부모 컴포넌트에 파일 목록 전달 (렌더링 후 호출)
      const allFiles = [...previews, ...newPreviews].map(p => p.file);
      setTimeout(() => onImagesChange(allFiles), 0);
    }
  }, [maxImages, totalImages, maxFileSize, onImagesChange, previews]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!canAddMore) {
      setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [canAddMore, maxImages, handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // 같은 파일 다시 선택 가능하도록 초기화
    e.target.value = '';
  }, [handleFiles]);

  const removePreview = useCallback((id: string) => {
    const toRemove = previews.find(p => p.id === id);
    if (toRemove) {
      URL.revokeObjectURL(toRemove.previewUrl);
    }
    const updated = previews.filter(p => p.id !== id);
    setPreviews(updated);
    // 부모 컴포넌트에 업데이트된 파일 목록 전달 (렌더링 후 호출)
    const allFiles = updated.map(p => p.file);
    setTimeout(() => onImagesChange(allFiles), 0);
    setError(null);
  }, [onImagesChange, previews]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const maxSizeMB = maxFileSize / (1024 * 1024);

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      {canAddMore && (
        <div
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'border-[#FF6B35] bg-orange-50'
              : 'border-gray-300 hover:border-[#FF6B35] hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-2">
            <div className="flex justify-center">
              <svg
                className={`w-12 h-12 ${isDragging ? 'text-[#FF6B35]' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div>
              <p className="text-gray-600 font-medium">
                {isDragging ? '여기에 놓으세요!' : '클릭 또는 드래그하여 이미지 업로드'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                JPEG, PNG, WebP, GIF / 최대 {maxSizeMB}MB / {maxImages}개까지
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* 이미지 개수 표시 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>이미지 {totalImages}/{maxImages}</span>
        {totalImages > 0 && (
          <span className="text-xs">첫 번째 이미지가 대표 이미지로 사용됩니다</span>
        )}
      </div>

      {/* 이미지 프리뷰 그리드 */}
      {(existingImages.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {/* 기존 이미지 */}
          {existingImages.map((url, index) => (
            <div
              key={`existing-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <img
                src={url}
                alt={`이미지 ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* 대표 이미지 뱃지 */}
              {index === 0 && previews.length === 0 && (
                <div className="absolute top-1 left-1 bg-[#FF6B35] text-white text-xs px-2 py-0.5 rounded">
                  대표
                </div>
              )}

              {/* 삭제 버튼 */}
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1
                           opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* 새로 추가된 이미지 프리뷰 */}
          {previews.map((preview, index) => (
            <div
              key={preview.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <img
                src={preview.previewUrl}
                alt={`미리보기 ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* 대표 이미지 뱃지 (기존 이미지가 없을 때만) */}
              {index === 0 && existingImages.length === 0 && (
                <div className="absolute top-1 left-1 bg-[#FF6B35] text-white text-xs px-2 py-0.5 rounded">
                  대표
                </div>
              )}

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => removePreview(preview.id)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1
                         opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 새 이미지 표시 */}
              <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                새 이미지
              </div>
            </div>
          ))}

          {/* 추가 버튼 */}
          {canAddMore && (
            <button
              type="button"
              onClick={openFilePicker}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300
                       flex items-center justify-center hover:border-[#FF6B35]
                       hover:bg-gray-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
