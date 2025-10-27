import { Upstream } from './upstream.entity';

export abstract class UpstreamRepository {
  abstract findAll(): Promise<Upstream[]>;
  abstract findById(id: string): Promise<Upstream | null>;
  abstract findByName(name: string): Promise<Upstream | null>;
  abstract create(upstream: Upstream): Promise<Upstream>;
  abstract update(upstream: Upstream): Promise<Upstream>;
  abstract delete(id: string): Promise<void>;
}
