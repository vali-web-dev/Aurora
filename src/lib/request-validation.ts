import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

/**
 * Parse and validate JSON body with Zod schema
 * Returns parsed data or NextResponse with validation errors
 */
export async function validateRequestBody(
  request: NextRequest,
  schema: ZodSchema
): Promise<{ success: true; data: any } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map(issue => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      }));

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Validation failed', issues: errors },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Invalid JSON' },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Parse and validate query parameters
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema
): { success: true; data: T } | { success: false; error: string } {
  const queryData = Object.fromEntries(searchParams.entries());
  const validation = schema.safeParse(queryData);

  if (!validation.success) {
    const issues = validation.error.issues.map(i => i.message).join(', ');
    return {
      success: false,
      error: `Query validation failed: ${issues}`,
    };
  }

  return { success: true, data: validation.data as T };
}

/**
 * Standard error response
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}
