import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TierCategory } from './tier-category.entity';

@Entity('TierBenefits')
export class TierBenefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  benefitId: string;

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  value: string;

  @Column({ type: 'bit', nullable: false, default: false })
  showcase: boolean;

  @Column({ type: 'int', nullable: false, default: 1 })
  order: number;

  @Column({ type: 'bit', nullable: false, default: true })
  active: boolean;

  @Column({ type: 'datetime', nullable: false, default: () => 'GETDATE()' })
  created: Date;

  @Column({ type: 'datetime', nullable: true })
  updated: Date;

  @ManyToOne(() => TierCategory, (category) => category.benefits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: TierCategory;

  @Column({ type: 'int', nullable: false })
  categoryId: number;
}
