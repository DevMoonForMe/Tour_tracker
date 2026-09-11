import { NextResponse } from 'next/server';
import { readData, writeData, isValidResource } from '@/lib/db';

export async function PUT(
  request: Request,
  context: { params: Promise<{ resource: string; id: string }> }
) {
  const { resource, id } = await context.params;
  if (!isValidResource(resource)) {
    return NextResponse.json({ error: `Invalid resource: ${resource}` }, { status: 400 });
  }

  const data = readData(resource);
  const body = await request.json();

  if (Array.isArray(data)) {
    const index = data.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...body, id };
      writeData(resource, data);
      return NextResponse.json(data[index]);
    } else {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
  }

  return NextResponse.json({ error: 'Invalid resource type for ID update' }, { status: 400 });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ resource: string; id: string }> }
) {
  const { resource, id } = await context.params;
  if (!isValidResource(resource)) {
    return NextResponse.json({ error: `Invalid resource: ${resource}` }, { status: 400 });
  }

  let data = readData(resource);

  if (Array.isArray(data)) {
    const originalLength = data.length;
    data = data.filter((item: any) => item.id !== id);
    if (data.length === originalLength) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    writeData(resource, data);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid resource type for ID deletion' }, { status: 400 });
}
