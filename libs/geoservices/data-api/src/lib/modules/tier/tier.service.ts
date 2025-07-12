import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tier } from '../../entities/tier.entity';
import { TierCategory } from '../../entities/tier-category.entity';
import { TierBenefit } from '../../entities/tier-benefit.entity';

@Injectable()
export class TierService {
  constructor(
    @InjectRepository(Tier) private readonly tierRepository: Repository<Tier>,
    @InjectRepository(TierCategory) private readonly tierCategoryRepository: Repository<TierCategory>,
    @InjectRepository(TierBenefit) private readonly tierBenefitRepository: Repository<TierBenefit>
  ) {}

  /**
   * Create a new tier
   */
  public async create(tierData: Partial<Tier>): Promise<Tier> {
    // Create the tier entity using the repository's create method
    // This properly handles the cascade operations for nested entities
    const tier = this.tierRepository.create({
      ...tierData
    });

    return this.tierRepository.save(tier);
  }

  /**
   * Create or update a tier with full cascade support
   */
  public async createOrUpdate(tierData: Partial<Tier>): Promise<Tier> {
    if (tierData.id) {
      // If ID exists, it's an update operation
      return this.update(tierData.id, tierData);
    } else {
      // If no ID, it's a create operation
      return this.create(tierData);
    }
  }

  /**
   * Get all tiers
   */
  public async findAll(): Promise<Tier[]> {
    return this.tierRepository.find({
      relations: ['categories', 'categories.benefits'],
      order: { added: 'DESC' }
    });
  }

  /**
   * Get active tiers only
   */
  public async findActive(): Promise<Tier[]> {
    return this.tierRepository.find({
      where: { active: true },
      relations: ['categories', 'categories.benefits'],
      order: { added: 'DESC' }
    });
  }

  /**
   * Get a tier by ID
   */
  public async findOne(id: number): Promise<Tier> {
    return this.tierRepository
      .createQueryBuilder('tier')
      .where('tier.id = :id', { id })
      .leftJoinAndSelect('tier.categories', 'category')
      .leftJoinAndSelect('category.benefits', 'benefit')
      .orderBy('category.order', 'ASC')
      .addOrderBy('benefit.order', 'ASC')
      .getOne();
  }

  /**
   * Get a tier by tierId
   */
  public async findByTierId(tierId: string): Promise<Tier> {
    return this.tierRepository.findOne({
      where: { tierId },
      relations: ['categories', 'categories.benefits']
    });
  }

  /**
   * Update a tier
   */
  public async update(id: number, updateData: Partial<Tier>): Promise<Tier> {
    delete updateData.id;

    const existingTier = await this.tierRepository.findOne({
      where: { id },
      relations: ['categories', 'categories.benefits']
    });

    if (!existingTier) {
      throw new Error(`Tier with ID ${id} not found`);
    }

    // Use merge and save instead of update to handle cascades properly
    const updatedTier = this.tierRepository.merge(existingTier, {
      ...updateData,
      id: id, // Ensure we preserve the ID
      updated: new Date()
    });

    // Save with cascade operations for categories and benefits
    return this.tierRepository.save(updatedTier);
  }

  /**
   * Delete a tier
   */
  public async remove(id: number): Promise<void> {
    await this.tierRepository.delete(id);
  }

  /**
   * Soft delete a tier by setting active to false
   */
  public async deactivate(id: number): Promise<Tier> {
    return this.update(id, { active: false });
  }

  /**
   * Reactivate a tier by setting active to true
   */
  public async activate(id: number): Promise<Tier> {
    return this.update(id, { active: true });
  }
}
