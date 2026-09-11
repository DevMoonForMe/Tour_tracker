import { NextResponse } from 'next/server';
import { readData, writeData, isValidResource } from '@/lib/db';

export async function GET(
  _request: Request,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  if (!isValidResource(resource)) {
    return NextResponse.json({ error: `Invalid resource: ${resource}` }, { status: 400 });
  }

  const data = readData(resource);
  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  if (!isValidResource(resource)) {
    return NextResponse.json({ error: `Invalid resource: ${resource}` }, { status: 400 });
  }

  const data = readData(resource);
  const body = await request.json();

  if (Array.isArray(data)) {
    data.push(body);
    writeData(resource, data);
    return NextResponse.json(body, { status: 201 });
  } else {
    // For settings object
    const updated = { ...data, ...body };
    writeData(resource, updated);
    return NextResponse.json(updated, { status: 200 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params;
  if (!isValidResource(resource)) {
    return NextResponse.json({ error: `Invalid resource: ${resource}` }, { status: 400 });
  }

  const body = await request.json();
  if (resource === 'settings') {
    const existing = readData('settings');
    const updated = { ...existing, ...body };
    writeData('settings', updated);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'PUT on collection requires an ID' }, { status: 400 });
}
