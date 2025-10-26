export class Route {
  constructor(
    public readonly id: string,
    public prefix: string,
    public upstreamId: string,
    public enabled: boolean = true,
    public rewrite?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
