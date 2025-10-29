/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import CircuitBreaker from 'opossum';
import { Upstream } from '@domain/upstream/upstream.entity';
import { Injectable } from '@nestjs/common';

type RouteMatch = {
  prefix: string;
  rewrite?: string | null;
  targetBase: string;
};

function joinPath(base: string, path: string) {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

@Injectable()
export class ProxyAdapter {
  private breakers = new Map<string, CircuitBreaker>();

  private breaker(upstream: Upstream) {
    if (!this.breakers.has(upstream.id)) {
      this.breakers.set(
        upstream.id,
        new CircuitBreaker(() => true, {
          timeout: upstream.timeoutMs ?? 5000,
          errorThresholdPercentage: upstream.cbErrorPct ?? 50,
          resetTimeout: upstream.cbResetMs ?? 30000,
        }),
      );
    }
    return this.breakers.get(upstream.id)!;
  }

  async sendShadow(
    req: FastifyRequest & { rawBody?: Buffer },
    url: string,
  ): Promise<Response | undefined> {
    const path = req.raw.url ?? '/';
    const target = joinPath(url, path);

    const incoming = req.headers as Record<
      string,
      string | string[] | undefined
    >;
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(incoming)) {
      if (!v) continue;
      if (k.toLowerCase() === 'authorization') continue;
      headers[k] = Array.isArray(v) ? v.join(',') : String(v);
    }

    let body: ArrayBuffer | undefined = undefined;
    if (req.rawBody) {
      body = new Uint8Array(req.rawBody).slice().buffer;
    }
    try {
      return await fetch(target, {
        method: req.method,
        headers,
        body,
      });
    } catch {
      return undefined;
    }
  }

  handler(upstream: Upstream, match: RouteMatch) {
    const breaker = this.breaker(upstream);

    return async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        await breaker.fire();

        const originalPath = req.raw.url ?? '/';

        const rewrittenPath =
          match.rewrite && match.rewrite.length > 0
            ? originalPath.replace(match.prefix, match.rewrite)
            : originalPath;

        const target = joinPath(match.targetBase, rewrittenPath);

        const incoming = req.headers as Record<
          string,
          string | string[] | undefined
        >;
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(incoming)) {
          const key = k.toLowerCase();
          if (!v) continue;
          if (
            key === 'authorization' ||
            key === 'host' ||
            key === 'content-length'
          )
            continue;
          headers[k] = Array.isArray(v) ? v.join(',') : String(v);
        }
        headers['x-forwarded-for'] =
          (incoming['x-forwarded-for'] as string) ?? req.ip;
        headers['x-request-id'] =
          (incoming['x-request-id'] as string) ?? randomUUID();

        // eslint-disable-next-line no-console
        console.log(
          `➡️  ${req.method} ${originalPath} -> ${match.targetBase}${rewrittenPath}`,
        );

        await reply.from(target, {
          rewriteRequestHeaders: (_req, _headers) => ({
            ..._headers,
            ...headers,
          }),
        });
      } catch (err: any) {
        req.log.error({ err }, 'Proxy failed');
        reply.status(502).send({
          error: 'Bad gateway',
          detail: err?.message ?? 'Upstream proxy failed',
        });
      }
    };
  }
}
