import { Route } from 'generated/prisma/client';

type RouteKeys = keyof Route;

export type RoutePrisma = Pick<Route, RouteKeys>;
