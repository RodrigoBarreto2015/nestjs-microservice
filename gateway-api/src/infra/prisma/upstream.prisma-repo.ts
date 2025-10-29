import { PrismaService } from './service/prisma.service';
import { UpstreamMapper } from './mapper/upstream.mapper';
import { Injectable } from '@nestjs/common';
import { UpstreamRepository } from '@app/ports';
import { Upstream } from '@domain/upstream/upstream.entity';

@Injectable()
export class UpstreamPrismaRepo implements UpstreamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Upstream[]> {
    return (
      await this.prisma.upstream.findMany({ orderBy: { name: 'asc' } })
    ).map((upstream) => {
      console.log('Mapping upstream: ', upstream);
      return UpstreamMapper.toDomain(upstream);
    });
  }

  async findById(id: string): Promise<Upstream | null> {
    const upstream = await this.prisma.upstream.findUnique({ where: { id } });
    if (!upstream) {
      return null;
    }
    return UpstreamMapper.toDomain(upstream);
  }

  async findByName(name: string): Promise<Upstream | null> {
    const upstream = await this.prisma.upstream.findUnique({ where: { name } });
    if (!upstream) {
      return null;
    }
    return UpstreamMapper.toDomain(upstream);
  }

  async create(upstream: Upstream): Promise<Upstream> {
    const data = UpstreamMapper.toPersistence(upstream);
    return await this.prisma.upstream
      .create({ data })
      .then((upstream) => UpstreamMapper.toDomain(upstream));
  }

  async update(upstream: Upstream): Promise<Upstream> {
    const data = UpstreamMapper.toPersistence(upstream);
    return await this.prisma.upstream
      .update({ where: { id: data.id }, data })
      .then((upstream) => UpstreamMapper.toDomain(upstream));
  }

  async delete(id: string): Promise<void> {
    return await this.prisma.upstream.delete({ where: { id } }).then(() => {});
  }
}
