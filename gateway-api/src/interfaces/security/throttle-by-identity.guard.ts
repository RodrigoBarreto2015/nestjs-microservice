import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';

@Injectable()
export class ThrottleByIdentityGuard extends ThrottlerGuard {
  protected getTracker(
    req: FastifyRequest & { user?: { sub?: string } },
  ): Promise<string> {
    const sub = req.user?.sub ?? 'unknown';

    const xff = req.headers['x-forwarded-for'];
    const ipFromHeader = Array.isArray(xff)
      ? xff[0]
      : xff?.split(',')[0].trim();

    const ip =
      req.id ||
      ipFromHeader ||
      req.raw.socket.remoteAddress ||
      req.socket.remoteAddress ||
      '0.0.0.0';

    return Promise.resolve(`throttle:${sub}:${ip}`);
  }
}
