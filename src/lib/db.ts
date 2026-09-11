import fs from 'fs';
import path from 'path';

export const VALID_RESOURCES = ['trips', 'members', 'contributions', 'expenses', 'settings'] as const;
export type ValidResource = typeof VALID_RESOURCES[number];

export function isValidResource(resource: string): resource is ValidResource {
  return VALID_RESOURCES.includes(resource as ValidResource);
}

const dataDir = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const getFilePath = (resource: ValidResource) => path.join(dataDir, `${resource}.json`);

export function readData(resource: ValidResource) {
  ensureDataDir();
  const filePath = getFilePath(resource);
  if (!fs.existsSync(filePath)) {
    const fallback = resource === 'settings' ? {} : [];
    writeData(resource, fallback);
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8').trim();
    if (!raw) {
      const fallback = resource === 'settings' ? {} : [];
      writeData(resource, fallback);
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    const fallback = resource === 'settings' ? {} : [];
    writeData(resource, fallback);
    return fallback;
  }
}

export function writeData(resource: ValidResource, data: any) {
  ensureDataDir();
  const filePath = getFilePath(resource);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function importAllData(payload: {
  trips?: any[];
  members?: any[];
  contributions?: any[];
  expenses?: any[];
  settings?: Record<string, any>;
}) {
  ensureDataDir();
  if (Array.isArray(payload.trips)) {
    writeData('trips', payload.trips);
  }
  if (Array.isArray(payload.members)) {
    writeData('members', payload.members);
  }
  if (Array.isArray(payload.contributions)) {
    writeData('contributions', payload.contributions);
  }
  if (Array.isArray(payload.expenses)) {
    writeData('expenses', payload.expenses);
  }
  if (payload.settings && typeof payload.settings === 'object' && !Array.isArray(payload.settings)) {
    writeData('settings', payload.settings);
  }
}
