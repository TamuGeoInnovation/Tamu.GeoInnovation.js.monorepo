import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import { Tier } from './tier.entity';
import { TierBenefit } from './tier-benefit.entity';
import { BaseDatestampedEntity } from './base-datestamped.entity';

@Entity('TierCategories')
export class TierCategory extends BaseDatestampedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  categoryId: string;

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: false, default: 1 })
  order: number;

  @Column({ type: 'bit', nullable: false, default: true })
  active: boolean;

  @ManyToOne(() => Tier, (tier) => tier.categories, { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'tierId' })
  tier: Tier;

  @OneToMany(() => TierBenefit, (benefit) => benefit.category, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  benefits: TierBenefit[];
}
