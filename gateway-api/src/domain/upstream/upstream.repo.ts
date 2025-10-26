import { Upstream } from './upstream.entity';

export interface UpstreamRepository {
  findAll(): Promise<Upstream[]>;
  findById(id: string): Promise<Upstream | null>;
  findByName(name: string): Promise<Upstream | null>;
  create(upstream: Upstream): Promise<Upstream>;
  update(upstream: Upstream): Promise<Upstream>;
  delete(id: string): Promise<void>;
}
