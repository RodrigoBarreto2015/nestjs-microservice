import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUpstreamDto } from './dto/create-upstream.dto';
import { CreateUpstreamUseCase } from '@app/upstream/use-cases/create-upstream.usecase';
import { ListUpstreamsUseCase } from '@app/upstream/use-cases/list-upstreams.usecase';

@Controller('admin/upstreams')
export class UpstreamsController {
  constructor(
    private readonly createUpstreamUseCase: CreateUpstreamUseCase,
    private readonly listUpstreamsUseCase: ListUpstreamsUseCase,
  ) {}

  @Get()
  async listUpstreams() {
    return this.listUpstreamsUseCase.execute();
  }

  @Post()
  async create(@Body() dto: CreateUpstreamDto) {
    console.log(dto);
    return this.createUpstreamUseCase.execute({
      name: dto.name,
      baseUrl: dto.baseUrl,
      enabled: dto.enabled ?? true,
      jwt: {
        required: dto.jwtRequired ?? false,
        issuer: dto.jwtIssuer,
        audience: dto.jwtAudience,
        jwksUri: dto.jwksUri,
        alg: dto.jwtAlg,
      },
      timeoutMs: dto.timeoutMs,
      cbErrorPct: dto.cbErrorPct,
      cbResetMs: dto.cbResetMs,
      canaryUrl: dto.canaryUrl,
      canaryWeight: dto.canaryWeight,
      shadowUrl: dto.shadowUrl,
    });
  }
}
