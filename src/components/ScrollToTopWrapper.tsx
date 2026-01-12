'use client';

import dynamic from 'next/dynamic';

// ScrollToTop은 스크롤 후에만 필요하므로 lazy loading
const ScrollToTop = dynamic(() => import('./ScrollToTop'), {
  ssr: false,
});

export default function ScrollToTopWrapper() {
  return <ScrollToTop />;
}
