'use client';

import { Suspense } from 'react';
import OpenRequestDetailContent from './OpenRequestDetailContent';

export const runtime = 'edge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OpenRequestDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    }>
      <OpenRequestDetailContent params={params} />
    </Suspense>
  );
}
