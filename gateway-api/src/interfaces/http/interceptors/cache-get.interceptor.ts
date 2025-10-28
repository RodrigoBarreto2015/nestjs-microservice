import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';

export class CacheGetInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if ((request.method ?? 'GET').toUpperCase() !== 'GET') {
      return next.handle();
    }

    const url = request.raw.url ?? '/';
    const key = `GET:${url}`;

    return from(this.cache.get(key)).pipe(
      switchMap((cached) => {
        if (cached !== undefined && cached !== null) {
          return of(cached);
        }

        return next.handle().pipe(
          tap((response) => {
            this.cache.set(key, response);
          }),
        );
      }),
    );
  }
}
