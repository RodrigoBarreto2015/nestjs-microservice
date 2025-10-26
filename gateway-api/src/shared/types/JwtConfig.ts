export type JwtConfig = {
  required: boolean;
  issuer?: string;
  audience?: string;
  jwksUri?: string;
  alg?: string;
};
