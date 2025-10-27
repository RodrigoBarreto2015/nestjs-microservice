import { Route } from '@domain/route/route.entity';
import { RouteRepository } from '@domain/route/route.repo';
import { PrismaService } from './service/prisma.service';
import { RouteMapper } from './mapper/route.mapper';
import { Injectable } from '@nestjs/common';

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
