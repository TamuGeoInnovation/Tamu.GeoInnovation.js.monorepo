import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Matches
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { CreateTierCategoryDto, UpdateTierCategoryDto, TierCategoryResponseDto } from './tier-category.dto';

export class CreateTierDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public tierId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsBoolean()
  public active?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  public cost?: number;

  @IsOptional()
  @IsString()
  @Matches(/^(daily|weekly|monthly|yearly)$/, { message: 'Invalid billing interval' })
  public interval?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTierCategoryDto)
  public categories?: CreateTierCategoryDto[];
}

export class UpdateTierDto {
  @IsNumber()
  public id: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public tierId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public name?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  public cost?: number;

  @IsOptional()
  @IsString()
  @Matches(/^(daily|weekly|monthly|yearly)$/, { message: 'Invalid billing interval' })
  public interval?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTierCategoryDto)
  categories?: UpdateTierCategoryDto[];
}

export class CloneTierDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  public tierIds: string[];
}

export class TierResponseDto {
  id: number;
  tierId: string;
  name: string;
  description?: string;
  active: boolean;
  added: Date;
  updated: Date;
  categories?: TierCategoryResponseDto[];
}
