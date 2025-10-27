/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Upstream } from '@domain/upstream/upstream.entity';
import type { Upstream as UpstreamPrisma } from '@prisma/client';
import { JwtConfig } from '@shared/types/JwtConfig';

export class UpstreamMapper {
  static toDomain(raw: UpstreamPrisma): Upstream {
    if (!raw) {
      throw new Error('Upstream not found');
    }

    return new Upstream(
      raw.id as string,
      raw.name as string,
      raw.baseUrl as string,
      raw.enabled as boolean,
      {
        required: raw.jwtRequired,
        audience: raw.jwtAudiences || undefined,
        issuer: raw.jwtIssuer || undefined,
        jwksUri: raw.jwksUrl || undefined,
        alg: raw.jwtAlg || undefined,
      },
      raw.timeoutMs as number,
      raw.cbErrorPct as number,
      raw.cbResetMs as number,
      (raw.canaryUrl as string) ?? undefined,
      (raw.canaryWeight as number) ?? undefined,
      (raw.shadowUrl as string) ?? undefined,
      raw.createdAt as Date,
      raw.updatedAt as Date,
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
