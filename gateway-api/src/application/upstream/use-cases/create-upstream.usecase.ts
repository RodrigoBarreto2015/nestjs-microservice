/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CreateUpstreamInput } from '../dto';
import { randomUUID } from 'node:crypto';
import { UpstreamRepository } from '../../ports';
import { Upstream } from '@domain/upstream/upstream.entity';
import { JwtConfig } from '@shared/types/JwtConfig';

export class CreateUpstreamUseCase {
  constructor(private readonly upstreamsRepository: UpstreamRepository) {}

  async execute(input: CreateUpstreamInput): Promise<Upstream> {
    const upstream = await this.upstreamsRepository.findByName(input.name);
    if (upstream) {
      throw new Error('Upstream with this name already exists');
    }

    const jwtConfig: JwtConfig = input.jwt as JwtConfig;

    const newUpstream = new Upstream(
      randomUUID(),
      input.name,
      input.baseUrl,
      input.enabled ?? true,
      {
        required: jwtConfig.required ?? false,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        jwksUri: jwtConfig.jwksUri,
        alg: jwtConfig.alg,
      },
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
