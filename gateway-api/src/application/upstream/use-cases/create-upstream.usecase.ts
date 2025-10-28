import { Upstream } from '@domain/upstream/upstream.entity';
import { CreateUpstreamInput } from '../dto';
import { randomUUID } from 'node:crypto';
import { UpstreamRepository } from '../../ports';

export class CreateUpstreamUseCase {
  constructor(private readonly upstreamsRepository: UpstreamRepository) {}

  async execute(input: CreateUpstreamInput): Promise<Upstream> {
    const upstream = await this.upstreamsRepository.findByName(input.name);
    if (upstream) {
      throw new Error('Upstream with this name already exists');
    }

    const newUpstream = new Upstream(
      randomUUID(),
      input.name,
      input.baseUrl,
      input.enabled ?? true,
      input.jwt,
      input.timeoutMs ?? 8000,
      input.cbErrorPct ?? 50,
      input.cbResetMs ?? 10000,
      input.canaryUrl,
      input.canaryWeight,
      input.shadowUrl,
    );

    return this.upstreamsRepository.create(newUpstream);
  }
}
