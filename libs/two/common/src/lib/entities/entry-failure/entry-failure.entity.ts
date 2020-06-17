import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, PrimaryColumn, TableInheritance } from 'typeorm';
import {  IsNotEmpty, IsDateString } from 'class-validator';

@Entity({
  name: 'Entry_failure'
})
export class EntryFailure  {
  @PrimaryGeneratedColumn({ name: 'id' })
  @IsNotEmpty()
  id: number;

  @Column({ name: 'siteCode', type: 'varchar', nullable: false })
  sitecode: string | null = null;

  @Column({ name: 'record', type: 'mediumint', nullable: true })
  record: number | null = null;

  @Column({ name: 'timestamp', type: 'datetime', nullable: true })
  @IsDateString()
  timestamp: string | null = null;

  @Column({ name: 'property', type: 'varchar', nullable: false })
  @IsNotEmpty()
  property: string | null = null;

  @Column({ name: 'validation_error', type: 'varchar', nullable: false })
  @IsNotEmpty()
  validationError: string | null = null;

  constructor(row?: any) {
    // super();
    if (row) {
      Object.keys(row).forEach((key, index) => {
        if (key in this) {
          if (row[key]) {
            this[key] = Number(row[key]) || String(row[key]) || null;
          }
        }
      });
    }
  }
}
