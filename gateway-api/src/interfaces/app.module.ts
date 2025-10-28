import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UpstreamsController } from './http/upstreams.controller';
import { UpstreamPrismaRepo } from '@infra/prisma/upstream.prisma-repo';
import { RoutePrismaRepo } from '@infra/prisma/route.prisma-repo';
import { CreateUpstreamUseCase } from '@app/upstream/use-cases/create-upstream.usecase';
import { ListUpstreamsUseCase } from '@app/upstream/use-cases/list-upstreams.usecase';
import { PrismaService } from '@infra/prisma/service/prisma.service';
import { RouteResolutionMiddleware } from './http/middleware/route-resolution.middleware';
import { JwtVerifier } from '@infra/auth/jwt-verifier';
import { UpstreamJwtGuard } from './security/upstream-jwt.guard';
import { ProxyController } from './http/proxy.controller';
import { CreateRouteUseCase } from '@app/route/use-cases/create-route.usecase';
import { ListRoutesUseCase } from '@app/route/use-cases/list-route.usecase';
import { RoutesController } from './http/routes.controller';
import { RouteRepository, UpstreamRepository } from '@app/ports';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { OtelModule } from '@infra/observability/otel.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottleByIdentityGuard } from './security/throttle-by-identity.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrometheusModule.register(),
    OtelModule,
    ThrottlerModule.forRoot([{ ttl: 60, limit: 120 }]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        }),
        ttl: 15,
      }),
    }),
  ],
  controllers: [UpstreamsController, RoutesController, ProxyController],
  providers: [
    PrismaService,
    JwtVerifier,
    UpstreamJwtGuard,
    ThrottleByIdentityGuard,
    //Repositories
    { provide: UpstreamRepository, useClass: UpstreamPrismaRepo },
    { provide: RouteRepository, useClass: RoutePrismaRepo },
    //upstream use cases
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
    //upstream use cases
    {
      provide: CreateRouteUseCase,
      useFactory: (routeRepo: RouteRepository) =>
        new CreateRouteUseCase(routeRepo),
      inject: [RouteRepository],
    },
    {
      provide: ListRoutesUseCase,
      useFactory: (routeRepo: RouteRepository) =>
        new ListRoutesUseCase(routeRepo),
      inject: [RouteRepository],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RouteResolutionMiddleware).forRoutes('*');
  }
}
