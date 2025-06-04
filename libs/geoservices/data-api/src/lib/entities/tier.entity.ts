import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TierCategory } from './tier-category.entity';

@Entity('Tiers')
export class Tier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  tierId: string;

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  @Column({ type: 'bit', nullable: false, default: true })
  active: boolean;

  @Column({ type: 'datetime', nullable: false, default: () => 'GETDATE()' })
  created: Date;

  @Column({ type: 'datetime', nullable: true })
  updated: Date;

  @OneToMany(() => TierCategory, (category) => category.tier, { cascade: true })
  categories: TierCategory[];
}
