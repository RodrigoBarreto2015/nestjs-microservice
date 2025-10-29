import { RouteRepository } from '@app/ports';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RouteResolver {
  constructor(private readonly routesRepository: RouteRepository) {}

  async resolve({ path }: { path: string }) {
    const routesWithUpstream =
      await this.routesRepository.findAllEnabledWithUpstream();
    const match = routesWithUpstream
      ?.filter((r) => path.startsWith(r.route.prefix))
      .sort((a, b) => b.route.prefix.length - a.route.prefix.length)[0];

    if (!match) return null;

    console.log({
      prefix: match.route.prefix,
      rewrite: match.route.rewrite,
      upstream: match.upstream,
    });

    return {
      prefix: match.route.prefix,
      rewrite: match.route.rewrite,
      upstream: match.upstream,
    };
  }
}
