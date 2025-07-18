import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { TierBenefitService } from './tier-benefit.service';
import { TierBenefit } from '../../entities/tier-benefit.entity';
import { CreateTierBenefitDto, UpdateTierBenefitDto } from '../../dto/tier-benefit.dto';
import { LegacyAuthGuard } from '../../guards/legacy-auth/legacy-auth.guard';
import { LegacyAdminGuard } from '../../guards/legacy-admin/legacy-admin.guard';

@Controller('tier-benefit')
@UseGuards(LegacyAuthGuard, LegacyAdminGuard)
export class TierBenefitController {
  constructor(private readonly tierBenefitService: TierBenefitService) {}

  /**
   * Create a new tier benefit
   */
  @Post()
  async create(@Body() benefitData: CreateTierBenefitDto): Promise<TierBenefit> {
    return this.tierBenefitService.create(benefitData);
  }

  /**
   * Get all tier benefits
   */
  @Get()
  async findAll(): Promise<TierBenefit[]> {
    return this.tierBenefitService.findAll();
  }

  /**
   * Get active tier benefits only
   */
  @Get('active')
  async findActive(): Promise<TierBenefit[]> {
    return this.tierBenefitService.findActive();
  }

  /**
   * Get showcase tier benefits only
   */
  @Get('showcase')
  async findShowcase(): Promise<TierBenefit[]> {
    return this.tierBenefitService.findShowcase();
  }

  /**
   * Get tier benefits by category ID
   */
  @Get('by-category/:categoryId')
  async findByCategoryId(@Param('categoryId') categoryId: string): Promise<TierBenefit[]> {
    return this.tierBenefitService.findByCategoryId(+categoryId);
  }

  /**
   * Get a tier benefit by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TierBenefit> {
    return this.tierBenefitService.findOne(+id);
  }

  /**
   * Get a tier benefit by benefitId
   */
  @Get('by-benefit-id/:benefitId')
  async findByBenefitId(@Param('benefitId') benefitId: string): Promise<TierBenefit> {
    return this.tierBenefitService.findByBenefitId(benefitId);
  }

  /**
   * Update a tier benefit
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateTierBenefitDto): Promise<TierBenefit> {
    return this.tierBenefitService.update(+id, updateData);
  }

  /**
   * Delete a tier benefit
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.tierBenefitService.remove(+id);
  }

  /**
   * Deactivate a tier benefit
   */
  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<TierBenefit> {
    return this.tierBenefitService.deactivate(+id);
  }

  /**
   * Activate a tier benefit
   */
  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<TierBenefit> {
    return this.tierBenefitService.activate(+id);
  }

  /**
   * Toggle showcase status
   */
  @Post(':id/toggle-showcase')
  async toggleShowcase(@Param('id') id: string): Promise<TierBenefit> {
    return this.tierBenefitService.toggleShowcase(+id);
  }
}
