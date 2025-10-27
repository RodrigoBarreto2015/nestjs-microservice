import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export type VerifyParams = {
  token: string;
  jwksUri: string;
  issuer?: string;
  audience?: string;
  alg?: string;
};

export class JwtVerifier {
  private getJwks(jwksUri: string) {
    if (!jwksCache.has(jwksUri)) {
      jwksCache.set(
        jwksUri,
        createRemoteJWKSet(new URL(jwksUri), {
          cooldownDuration: 60000,
          cacheMaxAge: 3600000,
        }),
      );
    }
    return jwksCache.get(jwksUri)!;
  }

  async verify(params: VerifyParams) {
    const JWKS = this.getJwks(params.jwksUri);
    const res = await jwtVerify(params.token, JWKS, {
      algorithms: params.alg ? [params.alg] : undefined,
      issuer: params.issuer,
      audience: params.audience,
    });
    return res.payload;
  }
}
