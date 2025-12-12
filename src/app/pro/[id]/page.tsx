'use client';

import { Suspense } from 'react';
import ProProfileContent from './ProProfileContent';

export const runtime = 'edge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProProfilePage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    }>
      <ProProfileContent params={params} />
    </Suspense>
  );
}
