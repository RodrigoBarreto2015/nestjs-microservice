import { ProxyAdapter } from '@infra/proxy/proxy.adapter';
import { UpstreamJwtGuard } from '@interfaces/security/upstream-jwt.guard';
import {
  All,
  Controller,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Controller()
export class ProxyController {
  private proxy = new ProxyAdapter();

  @UseGuards(UpstreamJwtGuard)
  @All('*')
  async route(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const request = req.resolved?.upstream || undefined;

    if (!request) {
      return reply
        .status(HttpStatus.NOT_FOUND)
        .send({ error: 'No route for path' });
    }

    let target = request.baseUrl;
    if (
      request.canaryUrl &&
      typeof request.canaryWeight === 'number' &&
      request.canaryWeight > 0
    ) {
      const random = Math.floor(Math.random() * 100 + 1);
      if (random < request.canaryWeight) {
        target = request.canaryUrl;
      }
    }

    if (request.shadowUrl) {
      void this.proxy.sendShadow(
        req as FastifyRequest & { rawBody?: Buffer },
        request.shadowUrl,
      );
    }

    const handler = this.proxy.handler(request, target);
    return handler(req, reply);
  }
}
