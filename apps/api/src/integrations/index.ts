import type { DirectoryAdapter } from './base.adapter.js';
import { BingPlacesAdapter } from './bing.adapter.js';
import { FacebookBusinessAdapter } from './facebook.adapter.js';
import { YelpBusinessAdapter } from './yelp.adapter.js';

const registry = new Map<string, DirectoryAdapter>();

export function registerAdapter(adapter: DirectoryAdapter): void {
  registry.set(adapter.slug, adapter);
}

export function getAdapter(slug: string): DirectoryAdapter | undefined {
  return registry.get(slug);
}

export function getAllAdapters(): DirectoryAdapter[] {
  return Array.from(registry.values());
}

// Auto-register built-in adapters at module load
registerAdapter(new BingPlacesAdapter());
registerAdapter(new FacebookBusinessAdapter());
registerAdapter(new YelpBusinessAdapter());
