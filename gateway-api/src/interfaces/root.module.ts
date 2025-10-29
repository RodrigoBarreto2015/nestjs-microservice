import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { PrismaService } from '@infra/prisma/service/prisma.service';
import { JwtVerifier } from '@infra/auth/jwt-verifier';
import { RouteRepository, UpstreamRepository } from '@app/ports';
import { UpstreamPrismaRepo } from '@infra/prisma/upstream.prisma-repo';
import { RoutePrismaRepo } from '@infra/prisma/route.prisma-repo';
import { ListUpstreamsUseCase } from '@app/upstream/use-cases/list-upstreams.usecase';
import { CreateRouteUseCase } from '@app/route/use-cases/create-route.usecase';
import { CreateUpstreamUseCase } from '@app/upstream/use-cases/create-upstream.usecase';
import { ListRoutesUseCase } from '@app/route/use-cases/list-route.usecase';
import { UpstreamsController } from './http/upstreams.controller';
import { RoutesController } from './http/routes.controller';
import { ProxyController } from './http/proxy.controller';
import { UpstreamJwtGuard } from './security/upstream-jwt.guard';
import { RouteResolutionMiddleware } from './http/middleware/route-resolution.middleware';
import { ThrottleByIdentityGuard } from './security/throttle-by-identity.guard';
import { OtelModule } from '@infra/observability/otel.module';
import { RouteResolver } from '@infra/proxy/route.resolver';
import { ProxyAdapter } from '@infra/proxy/proxy.adapter';
import { ProxyService } from '@infra/proxy/proxy.service';

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
      useFactory: () => ({
        store: new Keyv(
          new KeyvRedis(process.env.REDIS_URL || 'redis://localhost:6379'),
        ),
        ttl: 15,
      }),
    }),
  ],
  controllers: [UpstreamsController, RoutesController, ProxyController],
  providers: [
    PrismaService,
    JwtVerifier,

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
    //route use cases
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

    //Proxy
    RouteResolver,
    ProxyAdapter,
    ProxyService,

    //Guard
    UpstreamJwtGuard,
    ThrottleByIdentityGuard,
  ],
  exports: [ProxyService],
})
export class RootModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RouteResolutionMiddleware).forRoutes('*');
  }
}
