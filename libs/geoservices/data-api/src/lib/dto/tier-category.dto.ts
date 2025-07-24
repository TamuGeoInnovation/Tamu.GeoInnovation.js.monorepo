import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ValidateNested,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateTierBenefitDto, UpdateTierBenefitDto, TierBenefitResponseDto } from './tier-benefit.dto';

export class CreateTierCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  public categoryId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public order?: number;

  @IsOptional()
  @IsBoolean()
  public active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTierBenefitDto)
  public benefits?: CreateTierBenefitDto[];
}

export class UpdateTierCategoryDto {
  @IsOptional()
  @IsNumber()
  public id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  public categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public name?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public order?: number;

  @IsOptional()
  @IsBoolean()
  public active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTierBenefitDto)
  public benefits?: UpdateTierBenefitDto[];
}

export class TierCategoryResponseDto {
  id: number;
  categoryId: string;
  name: string;
  description?: string;
  order: number;
  active: boolean;
  added: Date;
  updated: Date;
  benefits?: TierBenefitResponseDto[];
}
