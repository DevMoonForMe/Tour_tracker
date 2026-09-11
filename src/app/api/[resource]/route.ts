import { NextResponse } from 'next/server';
import { readData, writeData } from '../../../../lib/db';

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  const data = readData(resource);
  return NextResponse.json(data);
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  const data = readData(resource);
  const body = await request.json();
  
  if (Array.isArray(data)) {
    data.push(body);
  } else {
    // For settings, it's an object
    Object.assign(data, body);
  }
  
  writeData(resource, data);
  return NextResponse.json(body, { status: 201 });
}
