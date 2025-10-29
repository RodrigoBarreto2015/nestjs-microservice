import { PrismaService } from './service/prisma.service';
import { RouteMapper } from './mapper/route.mapper';
import { Injectable } from '@nestjs/common';
import { RouteRepository } from '@app/ports';
import { Route } from '@domain/route/route.entity';
import { RouteWithUpstream } from '@shared/types/routeWithUpstream';
import { Prisma } from '@prisma/client';
import { UpstreamMapper } from './mapper/upstream.mapper';

type RouteWithUpstreamRow = Prisma.RouteGetPayload<{
  include: { upstream: true };
}>;

@Injectable()
export class RoutePrismaRepo implements RouteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Route[]> {
    return (
      await this.prisma.route.findMany({ orderBy: { prefix: 'asc' } })
    ).map((route) => RouteMapper.toDomain(route));
  }

  async findByPrefix(prefix: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({ where: { prefix } });
    if (!route) {
      return null;
    }
    return RouteMapper.toDomain(route);
  }

  async findAllEnabledWithUpstream(): Promise<RouteWithUpstream[] | null> {
    const routes = await this.prisma.route.findMany({
      include: { upstream: true },
      orderBy: { prefix: 'desc' },
    });

    const filteredRoutes = routes.filter(
      (route) => (route as RouteWithUpstreamRow).upstream?.enabled !== false,
    );

    return filteredRoutes.map((route) => ({
      route: RouteMapper.toDomain(route),
      upstream: UpstreamMapper.toDomain(route.upstream),
    }));
  }

  async create(route: Route): Promise<Route> {
    const data = RouteMapper.toPersistence(route);
    return await this.prisma.route
      .create({ data })
      .then((route) => RouteMapper.toDomain(route));
  }

  async update(route: Route): Promise<Route> {
    const data = RouteMapper.toPersistence(route);
    return await this.prisma.route
      .update({ where: { id: data.id }, data })
      .then((route) => RouteMapper.toDomain(route));
  }

  async delete(id: string): Promise<void> {
    return await this.prisma.route.delete({ where: { id } }).then(() => {});
  }
}
