/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Route } from '@domain/route/route.entity';
import { RoutePrisma } from './route.prisma.type';

export class RouteMapper {
  static toDomain(raw: RoutePrisma | undefined): Route {
    if (!raw) {
      throw new Error('Route not found');
    }

    return new Route(
      raw.id,
      raw.prefix,
      raw.upstreamId,
      true,
      raw.rewrite ?? undefined,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(domain: Route): RoutePrisma {
    return {
      id: domain.id,
      prefix: domain.prefix,
      rewrite: domain.rewrite ?? null,
      upstreamId: domain.upstreamId,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
