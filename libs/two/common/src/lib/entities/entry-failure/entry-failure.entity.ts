import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, PrimaryColumn, TableInheritance } from 'typeorm';
import { IsNotEmpty, IsDateString } from 'class-validator';

@Entity({
  name: 'Entry_failure'
})
export class EntryFailure {
  @PrimaryGeneratedColumn({ name: 'id' })
  @IsNotEmpty()
  public id: number;

  @Column({ name: 'siteCode', type: 'varchar', nullable: false })
  public sitecode: string | null = null;

  @Column({ name: 'record', type: 'mediumint', nullable: true })
  public record: number | null = null;

  @Column({ name: 'timestamp', type: 'datetime', nullable: true })
  @IsDateString()
  public timestamp: string | null = null;

  @Column({ name: 'property', type: 'varchar', nullable: false })
  @IsNotEmpty()
  public property: string | null = null;

  @Column({ name: 'validation_error', type: 'varchar', nullable: false })
  @IsNotEmpty()
  public validationError: string | null = null;

  constructor(row) {
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
