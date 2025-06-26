import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tier } from '../../entities/tier.entity';

@Injectable()
export class TierService {
  constructor(@InjectRepository(Tier) private readonly tierRepository: Repository<Tier>) {}

  /**
   * Create a new tier
   */
  async create(tierData: Partial<Tier>): Promise<Tier> {
    const tier = this.tierRepository.create({
      ...tierData
    });

    return this.tierRepository.save(tier);
  }

  /**
   * Get all tiers
   */
  async findAll(): Promise<Tier[]> {
    return this.tierRepository.find({
      relations: ['categories'],
      order: { added: 'DESC' }
    });
  }

  /**
   * Get active tiers only
   */
  async findActive(): Promise<Tier[]> {
    return this.tierRepository.find({
      where: { active: true },
      relations: ['categories'],
      order: { added: 'DESC' }
    });
  }

  /**
   * Get a tier by ID
   */
  async findOne(id: number): Promise<Tier> {
    return this.tierRepository.findOne({
      where: { id },
      relations: ['categories']
    });
  }

  /**
   * Get a tier by tierId
   */
  async findByTierId(tierId: string): Promise<Tier> {
    return this.tierRepository.findOne({
      where: { tierId },
      relations: ['categories']
    });
  }

  /**
   * Update a tier
   */
  async update(id: number, updateData: Partial<Tier>): Promise<Tier> {
    await this.tierRepository.update(id, {
      ...updateData,
      updated: new Date()
    });
    return this.findOne(id);
  }

  /**
   * Delete a tier
   */
  async remove(id: number): Promise<void> {
    await this.tierRepository.delete(id);
  }

  /**
   * Soft delete a tier by setting active to false
   */
  async deactivate(id: number): Promise<Tier> {
    return this.update(id, { active: false });
  }

  /**
   * Reactivate a tier by setting active to true
   */
  async activate(id: number): Promise<Tier> {
    return this.update(id, { active: true });
  }
}
