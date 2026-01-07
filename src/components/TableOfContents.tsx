'use client';

import { useState, useMemo } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const items = useMemo(() => {
    if (typeof window === 'undefined') {
      // Server-side: use regex to parse headings
      const headingRegex = /<h([2-3])\s+id="([^"]+)"[^>]*>([^<]+)<\/h\1>/gi;
      const tocItems: TocItem[] = [];
      let match;
      while ((match = headingRegex.exec(content)) !== null) {
        tocItems.push({
          level: parseInt(match[1]),
          id: match[2],
          text: match[3],
        });
      }
      return tocItems;
    }

    // Client-side: use DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    const tocItems: TocItem[] = [];
    headings.forEach((heading) => {
      const id = heading.id;
      if (id) {
        tocItems.push({
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName[1]),
        });
      }
    });

    return tocItems;
  }, [content]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-900"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          목차
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="mt-3 space-y-2 border-t border-gray-200 pt-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={item.level === 3 ? 'ml-4' : ''}
            >
              <a
                href={`#${item.id}`}
                className="text-gray-600 hover:text-blue-600 text-sm leading-relaxed block py-0.5"
              >
                {item.level === 2 ? '• ' : '◦ '}
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
