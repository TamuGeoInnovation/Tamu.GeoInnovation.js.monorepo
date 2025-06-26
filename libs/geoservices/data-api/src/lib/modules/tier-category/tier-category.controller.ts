import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { TierCategoryService } from './tier-category.service';
import { TierCategory } from '../../entities/tier-category.entity';
import { LegacyAuthGuard } from '../../guards/legacy-auth/legacy-auth.guard';
import { LegacyAdminGuard } from '../../guards/legacy-admin/legacy-admin.guard';

@Controller('tier-category')
@UseGuards(LegacyAuthGuard, LegacyAdminGuard)
export class TierCategoryController {
  constructor(private readonly tierCategoryService: TierCategoryService) {}

  /**
   * Create a new tier category
   */
  @Post()
  async create(@Body() categoryData: Partial<TierCategory>): Promise<TierCategory> {
    return this.tierCategoryService.create(categoryData);
  }

  /**
   * Get all tier categories
   */
  @Get()
  async findAll(): Promise<TierCategory[]> {
    return this.tierCategoryService.findAll();
  }

  /**
   * Get active tier categories only
   */
  @Get('active')
  async findActive(): Promise<TierCategory[]> {
    return this.tierCategoryService.findActive();
  }

  /**
   * Get tier categories by tier ID
   */
  @Get('by-tier/:tierId')
  async findByTierId(@Param('tierId') tierId: string): Promise<TierCategory[]> {
    return this.tierCategoryService.findByTierId(+tierId);
  }

  /**
   * Get a tier category by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TierCategory> {
    return this.tierCategoryService.findOne(+id);
  }

  /**
   * Get a tier category by categoryId
   */
  @Get('by-category-id/:categoryId')
  async findByCategoryId(@Param('categoryId') categoryId: string): Promise<TierCategory> {
    return this.tierCategoryService.findByCategoryId(categoryId);
  }

  /**
   * Update a tier category
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<TierCategory>): Promise<TierCategory> {
    return this.tierCategoryService.update(+id, updateData);
  }

  /**
   * Delete a tier category
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.tierCategoryService.remove(+id);
  }

  /**
   * Deactivate a tier category
   */
  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<TierCategory> {
    return this.tierCategoryService.deactivate(+id);
  }

  /**
   * Activate a tier category
   */
  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<TierCategory> {
    return this.tierCategoryService.activate(+id);
  }
}
