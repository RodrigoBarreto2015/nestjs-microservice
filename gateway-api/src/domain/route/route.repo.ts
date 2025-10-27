import { Route } from './route.entity';

export abstract class RouteRepository {
  abstract findAll(): Promise<Route[]>;
  abstract findByPrefix(prefix: string): Promise<Route | null>;
  abstract create(route: Route): Promise<Route>;
  abstract update(route: Route): Promise<Route>;
  abstract delete(id: string): Promise<void>;
}
