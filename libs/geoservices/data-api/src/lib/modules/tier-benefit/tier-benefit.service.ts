import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TierBenefit } from '../../entities/tier-benefit.entity';

@Injectable()
export class TierBenefitService {
  constructor(@InjectRepository(TierBenefit) private readonly tierBenefitRepository: Repository<TierBenefit>) {}

  /**
   * Create a new tier benefit
   */
  async create(benefitData: Partial<TierBenefit>): Promise<TierBenefit> {
    const benefit = this.tierBenefitRepository.create({
      ...benefitData,
      added: new Date()
    });
    return this.tierBenefitRepository.save(benefit);
  }

  /**
   * Get all tier benefits
   */
  async findAll(): Promise<TierBenefit[]> {
    return this.tierBenefitRepository.find({
      relations: ['category'],
      order: { order: 'ASC', added: 'DESC' }
    });
  }

  /**
   * Get active tier benefits only
   */
  async findActive(): Promise<TierBenefit[]> {
    return this.tierBenefitRepository.find({
      where: { active: true },
      relations: ['category'],
      order: { order: 'ASC', added: 'DESC' }
    });
  }

  /**
   * Get showcase tier benefits only
   */
  async findShowcase(): Promise<TierBenefit[]> {
    return this.tierBenefitRepository.find({
      where: { showcase: true, active: true },
      relations: ['category'],
      order: { order: 'ASC', added: 'DESC' }
    });
  }

  /**
   * Get tier benefits by category ID
   */
  async findByCategoryId(categoryId: number): Promise<TierBenefit[]> {
    return this.tierBenefitRepository.find({
      where: { categoryId },
      relations: ['category'],
      order: { order: 'ASC' }
    });
  }

  /**
   * Get a tier benefit by ID
   */
  async findOne(id: number): Promise<TierBenefit> {
    return this.tierBenefitRepository.findOne({
      where: { id },
      relations: ['category']
    });
  }

  /**
   * Get a tier benefit by benefitId
   */
  async findByBenefitId(benefitId: string): Promise<TierBenefit> {
    return this.tierBenefitRepository.findOne({
      where: { benefitId },
      relations: ['category']
    });
  }

  /**
   * Update a tier benefit
   */
  async update(id: number, updateData: Partial<TierBenefit>): Promise<TierBenefit> {
    await this.tierBenefitRepository.update(id, {
      ...updateData,
      updated: new Date()
    });
    return this.findOne(id);
  }

  /**
   * Delete a tier benefit
   */
  async remove(id: number): Promise<void> {
    await this.tierBenefitRepository.delete(id);
  }

  /**
   * Soft delete a tier benefit by setting active to false
   */
  async deactivate(id: number): Promise<TierBenefit> {
    return this.update(id, { active: false });
  }

  /**
   * Reactivate a tier benefit by setting active to true
   */
  async activate(id: number): Promise<TierBenefit> {
    return this.update(id, { active: true });
  }

  /**
   * Toggle showcase status
   */
  async toggleShowcase(id: number): Promise<TierBenefit> {
    const benefit = await this.findOne(id);
    return this.update(id, { showcase: !benefit.showcase });
  }
}
