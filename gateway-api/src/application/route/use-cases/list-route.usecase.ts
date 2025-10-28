import { RouteRepository } from '@app/ports';
import { Route } from '@domain/route/route.entity';

export class ListRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(): Promise<Route[]> {
    return this.routeRepository.findAll();
  }
}
