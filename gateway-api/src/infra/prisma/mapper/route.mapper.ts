/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Route } from '@domain/route/route.entity';
import type { Route as RoutePrisma } from '@prisma/client';

export class RouteMapper {
  static toDomain(raw: RoutePrisma): Route {
    if (!raw) {
      throw new Error('Route not found');
    }

    return new Route(
      raw.id as string,
      raw.prefix as string,
      raw.upstreamId as string,
      true,
      (raw.rewrite as string) ?? undefined,
      raw.createdAt as Date,
      raw.updatedAt as Date,
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
