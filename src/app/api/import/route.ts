import { NextResponse } from 'next/server';
import { importAllData } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 });
    }

    importAllData(payload);
    return NextResponse.json({ success: true, message: 'Data imported successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to import data' }, { status: 500 });
  }
}
