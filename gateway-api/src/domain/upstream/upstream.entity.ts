import { JwtConfig } from '@shared/types/JwtConfig';

export class Upstream {
  constructor(
    public readonly id: string,
    public name: string,
    public baseUrl: string,
    public enabled: boolean = true,
    public jwt: JwtConfig = { required: false },
    public timeoutMs: number = 8000,
    public cbErrorPct: number = 50,
    public cbResetMs: number = 10000,
    public canaryUrl?: string,
    public canaryWeight?: number,
    public shadowUrl?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
