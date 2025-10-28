import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { CreateRouteUseCase } from '@app/route/use-cases/create-route.usecase';
import { ListRoutesUseCase } from '@app/route/use-cases/list-route.usecase';

@Controller('admin/routes')
export class RoutesController {
  constructor(
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly listRoutesUseCase: ListRoutesUseCase,
  ) {}

  @Get()
  list() {
    return this.listRoutesUseCase.execute();
  }

  @Post()
  createRoute(@Body() dto: CreateRouteDto) {
    return this.createRouteUseCase.execute({
      prefix: dto.prefix,
      upstreamId: dto.upstreamId,
      rewrite: dto.rewrite,
    });
  }
}
