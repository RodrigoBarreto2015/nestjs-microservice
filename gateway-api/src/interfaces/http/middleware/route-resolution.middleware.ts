import { RouteRepository, UpstreamRepository } from '@app/ports';
import { Upstream } from '@domain/upstream/upstream.entity';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

type Next = () => void;

@Injectable()
export class RouteResolutionMiddleware implements NestMiddleware {
  constructor(
    private readonly routes: RouteRepository,
    private readonly upstreams: UpstreamRepository,
  ) {}

  async use(req: FastifyRequest, _res: FastifyReply, next: Next) {
    const url = req.raw.url ?? '/';
    const pathname = url.split('?', 1)[0];

    const all = await this.routes.findAll();
    const sorted = all
      .slice()
      .sort((a, b) => b.prefix.length - a.prefix.length);

    const match = sorted.find(
      (route) => pathname.startsWith(route.prefix) && route.enabled !== false,
    );

    if (!match) return next();

    const upstream = await this.upstreams.findById(match.upstreamId);

    req.resolved = {
      match,
      upstream: upstream as Upstream,
    };
    req.matchedPrefix = match.prefix;

    next();
  }
}
