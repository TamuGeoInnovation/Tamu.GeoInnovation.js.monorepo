import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TierCategory } from '../../entities/tier-category.entity';

@Injectable()
export class TierCategoryService {
  constructor(@InjectRepository(TierCategory) private readonly tierCategoryRepository: Repository<TierCategory>) {}

  /**
   * Create a new tier category
   */
  async create(categoryData: Partial<TierCategory>): Promise<TierCategory> {
    const category = this.tierCategoryRepository.create({
      ...categoryData,
      added: new Date()
    });
    return this.tierCategoryRepository.save(category);
  }

  /**
   * Get all tier categories
   */
  async findAll(): Promise<TierCategory[]> {
    return this.tierCategoryRepository.find({
      relations: ['tier', 'benefits'],
      order: { order: 'ASC', added: 'DESC' }
    });
  }

  /**
   * Get active tier categories only
   */
  async findActive(): Promise<TierCategory[]> {
    return this.tierCategoryRepository.find({
      where: { active: true },
      relations: ['tier', 'benefits'],
      order: { order: 'ASC', added: 'DESC' }
    });
  }

  /**
   * Get tier categories by tier ID
   */
  async findByTierId(tierId: number): Promise<TierCategory[]> {
    return this.tierCategoryRepository.find({
      where: { tierId },
      relations: ['tier', 'benefits'],
      order: { order: 'ASC' }
    });
  }

  /**
   * Get a tier category by ID
   */
  async findOne(id: number): Promise<TierCategory> {
    return this.tierCategoryRepository.findOne({
      where: { id },
      relations: ['tier', 'benefits']
    });
  }

  /**
   * Get a tier category by categoryId
   */
  async findByCategoryId(categoryId: string): Promise<TierCategory> {
    return this.tierCategoryRepository.findOne({
      where: { categoryId },
      relations: ['tier', 'benefits']
    });
  }

  /**
   * Update a tier category
   */
  async update(id: number, updateData: Partial<TierCategory>): Promise<TierCategory> {
    await this.tierCategoryRepository.update(id, {
      ...updateData,
      updated: new Date()
    });
    return this.findOne(id);
  }

  /**
   * Delete a tier category
   */
  async remove(id: number): Promise<void> {
    await this.tierCategoryRepository.delete(id);
  }

  /**
   * Soft delete a tier category by setting active to false
   */
  async deactivate(id: number): Promise<TierCategory> {
    return this.update(id, { active: false });
  }

  /**
   * Reactivate a tier category by setting active to true
   */
  async activate(id: number): Promise<TierCategory> {
    return this.update(id, { active: true });
  }
}
