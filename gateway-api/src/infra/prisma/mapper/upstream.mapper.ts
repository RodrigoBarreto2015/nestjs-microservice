/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Upstream } from '@domain/upstream/upstream.entity';
import { UpstreamPrisma } from './upstream.prisma.type';
import { JwtConfig } from '@shared/types/JwtConfig';

export class UpstreamMapper {
  static toDomain(raw: UpstreamPrisma | undefined): Upstream {
    if (!raw) {
      throw new Error('Upstream not found');
    }

    return new Upstream(
      raw.id,
      raw.name,
      raw.baseUrl,
      raw.enabled,
      {
        required: raw.jwtRequired,
        audience: raw.jwtAudiences || undefined,
        issuer: raw.jwtIssuer || undefined,
        jwksUri: raw.jwksUrl || undefined,
        alg: raw.jwtAlg || undefined,
      },
      raw.timeoutMs,
      raw.cbErrorPct,
      raw.cbResetMs,
      raw.canaryUrl ?? undefined,
      raw.canaryWeight ?? undefined,
      raw.shadowUrl ?? undefined,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(domain: Upstream): UpstreamPrisma {
    const jwt: JwtConfig = {
      required: domain.jwt.required,
      audience: domain.jwt.audience || undefined,
      issuer: domain.jwt.issuer || undefined,
      jwksUri: domain.jwt.jwksUri || undefined,
      alg: domain.jwt.alg || undefined,
    };

    return {
      id: domain.id,
      name: domain.name,
      baseUrl: domain.baseUrl,
      enabled: domain.enabled,
      jwtRequired: jwt.required,
      jwtAudiences: jwt.audience || null,
      jwtIssuer: jwt.issuer || null,
      jwksUrl: jwt.jwksUri || null,
      jwtAlg: jwt.alg || null,
      timeoutMs: domain.timeoutMs,
      cbErrorPct: domain.cbErrorPct,
      cbResetMs: domain.cbResetMs,
      canaryUrl: domain.canaryUrl || null,
      canaryWeight: domain.canaryWeight || null,
      shadowUrl: domain.shadowUrl || null,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
