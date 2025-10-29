import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ThrottleByIdentityGuard } from '../security/throttle-by-identity.guard';
import { UpstreamJwtGuard } from '../security/upstream-jwt.guard';
import { ProxyService } from '@infra/proxy/proxy.service';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

@Controller()
export class ProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @UseGuards(UpstreamJwtGuard, ThrottleByIdentityGuard)
  @All(METHODS)
  async route(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    console.log(reply);
    return this.proxy.forward(req, reply);
  }
}
