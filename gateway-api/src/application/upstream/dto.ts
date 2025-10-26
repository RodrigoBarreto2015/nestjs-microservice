import { JwtConfig } from '@shared/types/JwtConfig';

export type CreateUpstreamInput = {
  name: string;
  baseUrl: string;
  enabled: boolean;
  jwt?: JwtConfig;
  timeoutMs?: number;
  cbErrorPct?: number;
  cbResetMs?: number;
  canaryUrl?: string;
  canaryWeight?: number;
  shadowUrl?: string;
};
