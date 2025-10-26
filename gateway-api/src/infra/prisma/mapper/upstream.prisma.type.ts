import { Upstream } from 'generated/prisma/client';

type UpstreamKeys = keyof Upstream;

export type UpstreamPrisma = Pick<Upstream, UpstreamKeys>;
