import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/posts';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const results = searchPosts(query);

  return NextResponse.json({ results });
}
