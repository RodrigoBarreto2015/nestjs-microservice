import { JwtVerifier } from '@infra/auth/jwt-verifier';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Injectable()
export class UpstreamJwtGuard implements CanActivate {
  constructor(private readonly verifier: JwtVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const upstream = req.resolved?.upstream;

    if (!upstream) return true;
    if (!upstream.jwt?.required)
      throw new UnauthorizedException('Missing Bearer token');

    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return false;

    const token = auth.slice('Bearer '.length).trim();

    try {
      await this.verifier.verify({
        token,
        jwksUri: upstream.jwt.jwksUri!,
        audience: upstream.jwt.audience!,
        issuer: upstream.jwt.issuer!,
        alg: upstream.jwt.alg!,
      });

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
