import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { TierCategory } from './tier-category.entity';
import { BaseDatestampedEntity } from './base-datestamped.entity';

@Entity('TierBenefits')
export class TierBenefit extends BaseDatestampedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  benefitId: string;

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  /**
   * The actual value of the benefit, which can be a string, number, or boolean.
   */
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  value: string;

  /**
   * String representative of the stored value (e.g. numeric, boolean, string)
   *
   * This is used to determine how the value should:
   *
   * 1) be displayed to the user in pricing pages
   * 2) Enable admins to interactively set value types with visible constraints to reduce errors
   */
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  valueType: string;

  /**
   * User-friendly label for the value, which can be used for display purposes.
   *
   * For example if the value is boolean, the label could be "Yes" or "No" for a specific benefit and "Enabled" or "Disabled" for another.
   */
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  valueLabel: string;

  /**
   * The unit of measurement for the benefit value, if applicable (e.g., "GB", "hours", "credits").
   * This is optional and can be null if the benefit does not have a unit.
   * This helps in understanding the context of the value provided.
   *
   * For example, if the value is "100", the unit could be "GB" to indicate that it represents 100 gigabytes.
   */
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  unit: string;

  @Column({ type: 'bit', nullable: false, default: false })
  showcase: boolean;

  @Column({ type: 'int', nullable: false, default: 1 })
  order: number;

  @Column({ type: 'bit', nullable: false, default: true })
  active: boolean;

  @ManyToOne(() => TierCategory, (category) => category.benefits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: TierCategory;
}
