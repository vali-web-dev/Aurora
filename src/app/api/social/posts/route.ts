import { NextRequest, NextResponse } from 'next/server';
import { getPosts, getPost, getPostsByUser } from '@/lib/api-data';

/**
 * GET /api/social/posts
 * Get all posts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let posts;
    if (userId) {
      posts = await getPostsByUser(parseInt(userId));
    } else {
      posts = await getPosts();
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // TODO: Implement create logic with auth check
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
