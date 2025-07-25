import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { TierCategory } from './tier-category.entity';
import { BaseDatestampedEntity } from './base-datestamped.entity';

@Entity('Tiers')
export class Tier extends BaseDatestampedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  tierId: string;

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  interval: string;

  @Column({ type: 'bit', nullable: false, default: true })
  active: boolean;

  @OneToMany(() => TierCategory, (category) => category.tier, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  categories: TierCategory[];
}
