import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateUpstreamDto {
  @IsString()
  name!: string;

  @IsUrl()
  baseUrl!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  jwtRequired?: boolean;

  @IsOptional()
  @IsString()
  jwtIssuer?: string;

  @IsOptional()
  @IsString()
  jwtAudience?: string;

  @IsOptional()
  @IsString()
  jwksUri?: string;

  @IsOptional()
  @IsString()
  jwtAlg?: string;

  @IsOptional()
  @IsInt()
  timeoutMs?: number;

  @IsOptional()
  @IsInt()
  cbErrorPct?: number;

  @IsOptional()
  @IsInt()
  cbResetMs?: number;

  @IsOptional()
  @IsUrl()
  canaryUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  canaryWeight?: number;

  @IsOptional()
  @IsUrl()
  shadowUrl?: string;
}
