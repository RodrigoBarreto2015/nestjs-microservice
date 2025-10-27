import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UpstreamsController } from './http/upstreams.controller';
import { UpstreamRepository } from '@domain/upstream/upstream.repo';
import { UpstreamPrismaRepo } from '@infra/prisma/upstream.prisma-repo';
import { RouteRepository } from '@domain/route/route.repo';
import { RoutePrismaRepo } from '@infra/prisma/route.prisma-repo';
import { CreateUpstreamUseCase } from '@app/upstream/use-cases/create-upstream.usecase';
import { ListUpstreamsUseCase } from '@app/upstream/use-cases/list-upstreams.usecase';
import { PrismaService } from '@infra/prisma/service/prisma.service';
import { RouteResolutionMiddleware } from './http/middleware/route-resolution.middleware';
import { JwtVerifier } from '@infra/auth/jwt-verifier';
import { UpstreamJwtGuard } from './security/upstream-jwt.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UpstreamsController],
  providers: [
    PrismaService,
    JwtVerifier,
    UpstreamJwtGuard,
    //Repositories
    { provide: UpstreamRepository, useClass: UpstreamPrismaRepo },
    { provide: RouteRepository, useClass: RoutePrismaRepo },
    //use cases
    {
      provide: CreateUpstreamUseCase,
      useFactory: (upstreamRepo: UpstreamRepository) =>
        new CreateUpstreamUseCase(upstreamRepo),
      inject: [UpstreamRepository],
    },
    {
      provide: ListUpstreamsUseCase,
      useFactory: (upstreamRepo: UpstreamRepository) =>
        new ListUpstreamsUseCase(upstreamRepo),
      inject: [UpstreamRepository],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RouteResolutionMiddleware).forRoutes('*');
  }
}
