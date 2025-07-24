import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CreateTierBenefitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  public benefitId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public valueType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public valueLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public unit?: string;

  @IsOptional()
  @IsBoolean()
  public showcase?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public order?: number;

  @IsOptional()
  @IsBoolean()
  public active?: boolean;

  @IsOptional()
  @IsNumber()
  public categoryId?: number;
}

export class UpdateTierBenefitDto {
  @IsOptional()
  @Transform((params) => {
    return params.value !== null ? params.value : undefined;
  })
  @IsNumber()
  public id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  public benefitId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public name?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public valueType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public valueLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public unit?: string;

  @IsOptional()
  @IsBoolean()
  public showcase?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public order?: number;

  @IsOptional()
  @IsBoolean()
  public active?: boolean;

  @IsOptional()
  @IsNumber()
  public categoryId?: number;
}

export class TierBenefitResponseDto {
  id: number;
  benefitId: string;
  name: string;
  description?: string;
  value?: string;
  valueType?: string;
  valueLabel?: string;
  unit?: string;
  showcase: boolean;
  order: number;
  active: boolean;
  added: Date;
  updated: Date;
  categoryId?: number;
  category?: {
    id: number;
    categoryId: string;
    name: string;
    description?: string;
    order: number;
    active: boolean;
  };
}
