import { promises as fs } from 'fs';
import path from 'path';
import type { PhotoSpec } from './types';
import { watch } from 'chokidar';

const configPath = path.resolve(process.cwd(), 'config/spec.json');
let configCache: PhotoSpec[] = [];

export async function readConfig(): Promise<PhotoSpec[]> {
  try {
    const configJSON = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configJSON) as PhotoSpec[];
  } catch (error) {
    console.error('Failed to load config:', error);
    return [];
  }
}

if (process.env.NODE_ENV === 'development') {
  watch(configPath).on('change', async () => {
    console.log('reload config...');
    configCache = await readConfig();
  });
}

export async function getConfig(): Promise<PhotoSpec[]> {
  if (configCache.length === 0) {
    configCache = await readConfig();
  }
  return configCache;
}
