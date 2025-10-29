import { randomUUID } from 'node:crypto';
import { RouteRepository } from '@app/ports';
import { Route } from '@domain/route/route.entity';

export class CreateRouteUseCase {
  constructor(private routes: RouteRepository) {}
  async execute(input: {
    prefix: string;
    upstreamId: string;
    rewrite?: string;
  }): Promise<Route> {
    const exists = await this.routes.findByPrefix(input.prefix);
    if (exists) throw new Error('Route prefix already exists');
    const r = new Route(
      randomUUID(),
      input.prefix,
      input.upstreamId,
      true,
      input.rewrite,
    );
    return this.routes.create(r);
  }
}
