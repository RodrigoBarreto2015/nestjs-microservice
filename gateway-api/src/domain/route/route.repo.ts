import { Route } from './route.entity';

export interface RouteRepository {
  findAll(): Promise<Route[]>;
  findByPrefix(prefix: string): Promise<Route | null>;
  create(route: Route): Promise<Route>;
  update(route: Route): Promise<Route>;
  delete(id: string): Promise<void>;
}
