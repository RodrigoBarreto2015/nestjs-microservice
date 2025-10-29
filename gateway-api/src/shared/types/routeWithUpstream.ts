import { Route } from '@domain/route/route.entity';
import { Upstream } from '@domain/upstream/upstream.entity';

export type RouteWithUpstream = {
  route: Route;
  upstream: Upstream;
};
