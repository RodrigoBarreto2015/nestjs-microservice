import { Upstream } from '@domain/upstream/upstream.entity';
import { UpstreamRepository } from '@domain/upstream/upstream.repo';

export class ListUpstreamsUseCase {
  constructor(private readonly upstreamRepository: UpstreamRepository) {}

  async execute(): Promise<Upstream[]> {
    return this.upstreamRepository.findAll();
  }
}
