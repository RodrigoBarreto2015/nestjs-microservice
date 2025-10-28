import { IsOptional, IsString } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  prefix!: string;

  @IsString()
  upstreamId!: string;

  @IsOptional()
  @IsString()
  rewrite?: string;
}
