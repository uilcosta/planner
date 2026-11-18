import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesFlat } from '@/app/actions/categories/getAll';

/**
 * GET /api/categories/flat
 * Returns flat list of categories for selectors
 * Query params: type (optional), exclude (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | 'TRANSFER' | null;
    const exclude = searchParams.get('exclude');

    const result = await getCategoriesFlat(type ?? undefined);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    // Filter out excluded category
    let data = result.data ?? [];
    if (exclude) {
      data = data.filter((cat: { id: string }) => cat.id !== exclude);
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API categories flat error:', err);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}