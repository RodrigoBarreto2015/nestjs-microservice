import 'fastify';
import { Upstream } from '@domain/upstream/upstream.entity';

declare module 'fastify' {
  interface FastifyRequest {
    resolved?: {
      match: {
        prefix: string;
        enabled?: boolean;
        upstreamId: string;
      };
      upstream: Upstream;
    };
    matchedPrefix?: string;
  }
}

export {};
