import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const getFilePath = (resource: string) => path.join(dataDir, `${resource}.json`);

export function readData(resource: string) {
  const filePath = getFilePath(resource);
  if (!fs.existsSync(filePath)) {
    if (resource === 'settings') return {};
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    if (resource === 'settings') return {};
    return [];
  }
}

export function writeData(resource: string, data: any) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(getFilePath(resource), JSON.stringify(data, null, 2), 'utf-8');
}
