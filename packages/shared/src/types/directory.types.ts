export type DirectoryHealth = 'healthy' | 'degraded' | 'down';
export type DirectoryType = 'browser' | 'file_export' | 'api';

export interface DirectoryConfig {
  id: string;
  name: string;
  slug: string;
  type: DirectoryType;
  apiConfig: Record<string, unknown>;
  rateLimits: { dailyCap: number; timeoutSeconds: number };
  healthStatus: DirectoryHealth;
  paused: boolean;
  lastHealthCheck: string | null;
}
