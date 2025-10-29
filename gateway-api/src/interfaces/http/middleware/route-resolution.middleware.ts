import { Injectable, NestMiddleware } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import { RouteRepository, UpstreamRepository } from '@app/ports';
import { Upstream } from '@domain/upstream/upstream.entity';

type Next = () => void;

@Injectable()
export class RouteResolutionMiddleware
  implements NestMiddleware<IncomingMessage, ServerResponse>
{
  constructor(
    private readonly routes: RouteRepository,
    private readonly upstreams: UpstreamRepository,
  ) {}

  async use(
    req: IncomingMessage & { resolved?: any; matchedPrefix?: string },
    _res: ServerResponse,
    next: Next,
  ) {
    const url = req.url ?? '/';
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
