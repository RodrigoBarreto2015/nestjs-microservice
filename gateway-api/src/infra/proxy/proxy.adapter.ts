/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Upstream } from '@domain/upstream/upstream.entity';
import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import CircuitBreaker from 'opossum';

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
    const path = req.raw.url ?? req.raw.url ?? '/';
    const target = new URL(path, url).toString();

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

  handler(upstream: Upstream, targetBase: string) {
    const breaker = this.breaker(upstream);

    return async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        await breaker.fire();

        const path = req.raw.url ?? '/';
        const target = new URL(path, targetBase).toString();

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
