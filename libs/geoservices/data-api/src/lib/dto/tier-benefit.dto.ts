import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTierBenefitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  benefitId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  valueType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  unit?: string;

  @IsOptional()
  @IsBoolean()
  showcase?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}

export class UpdateTierBenefitDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  benefitId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  valueType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  unit?: string;

  @IsOptional()
  @IsBoolean()
  showcase?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}

export class TierBenefitResponseDto {
  id: number;
  benefitId: string;
  name: string;
  description?: string;
  valueType?: string;
  value?: string;
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
