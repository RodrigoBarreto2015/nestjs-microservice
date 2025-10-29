import { Injectable } from '@nestjs/common';
import { ProxyAdapter } from './proxy.adapter';
import { RouteResolver } from './route.resolver';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class ProxyService {
  constructor(
    private readonly resolver: RouteResolver,
    private readonly adapter: ProxyAdapter,
  ) {}

  async forward(req: FastifyRequest, reply: FastifyReply) {
    const path = req.raw.url ?? '/';
    const match = await this.resolver.resolve({ path });
    if (!match) {
      return reply.code(404).send({
        message: `No route matches ${req.method} ${path}`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    const handler = this.adapter.handler(match.upstream, {
      prefix: match.prefix,
      rewrite: match.rewrite ?? null,
      targetBase: match.upstream.baseUrl,
    });

    return handler(req, reply);
  }
}
