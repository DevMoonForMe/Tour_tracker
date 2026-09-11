import { NextResponse } from 'next/server';
import { readData, writeData } from '../../../../../lib/db';

export async function PUT(request: Request, context: { params: Promise<{ resource: string, id: string }> }) {
  const { resource, id } = await context.params;
  const data = readData(resource);
  const body = await request.json();
  
  if (Array.isArray(data)) {
    const index = data.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...body };
      writeData(resource, data);
      return NextResponse.json(data[index]);
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }
  
  return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 });
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string, id: string }> }) {
  const { resource, id } = await context.params;
  let data = readData(resource);
  
  if (Array.isArray(data)) {
    data = data.filter((item: any) => item.id !== id);
    writeData(resource, data);
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 });
}
