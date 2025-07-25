import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';

import { TierService } from './tier.service';
import { Tier } from '../../entities/tier.entity';
import { CreateTierDto, UpdateTierDto, CloneTierDto } from '../../dto/tier.dto';
import { LegacyAuthGuard } from '../../guards/legacy-auth/legacy-auth.guard';
import { LegacyAdminGuard } from '../../guards/legacy-admin/legacy-admin.guard';

@Controller('tier')
@UseGuards(LegacyAuthGuard, LegacyAdminGuard)
export class TierController {
  constructor(private readonly tierService: TierService) {}

  /**
   * Create a new tier
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() tierData: CreateTierDto): Promise<Tier> {
    // Type assertion needed until service layer is updated to handle DTOs properly
    return this.tierService.create(tierData as Partial<Tier>);
  }

  /**
   * Get all tiers
   */
  @Get()
  async findAll(): Promise<Tier[]> {
    return this.tierService.findAll();
  }

  @Post('clone')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  public copy(@Body() cloneData: CloneTierDto) {
    return this.tierService.copyTiers(cloneData.tierIds);
  }

  /**
   * Get active tiers only
   */
  @Get('active')
  async findActive(): Promise<Tier[]> {
    return this.tierService.findActive();
  }

  /**
   * Get a tier by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tier> {
    return this.tierService.findOne(+id);
  }

  /**
   * Get a tier by tierId
   */
  @Get('by-tier-id/:tierId')
  async findByTierId(@Param('tierId') tierId: string): Promise<Tier> {
    return this.tierService.findByTierId(tierId);
  }

  /**
   * Update a tier
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() updateData: UpdateTierDto): Promise<Tier> {
    // Type assertion needed until service layer is updated to handle DTOs properly
    return this.tierService.update(+id, updateData as Partial<Tier>);
  }

  /**
   * Delete a tier
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.tierService.remove(+id);
  }

  /**
   * Deactivate a tier
   */
  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<Tier> {
    return this.tierService.deactivate(+id);
  }

  /**
   * Activate a tier
   */
  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<Tier> {
    return this.tierService.activate(+id);
  }
}
