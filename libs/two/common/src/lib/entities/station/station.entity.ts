import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { WeatherFlux } from '../weatherflux/weatherflux.entity';

@Entity({ name: 'weatherflux' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class StationInfo {
  [prop: string]: number | string | null;

  @PrimaryGeneratedColumn({ name: 'RECORD' })
  @IsNotEmpty()
  public record: number | null = null;

  @Column({ name: 'siteCode', type: 'varchar', nullable: true })
  public sitecode = 'NA';

  @Column({ name: 'siteID', type: 'mediumint', nullable: true })
  public siteid: number | null = null;

  @Column({ name: 'record_id', type: 'mediumint', nullable: true })
  public record_id: number | null = null;

  constructor(row?) {
    if (row) {
      Object.keys(row).forEach((key, index) => {
        // console.log(key, index);
        const key_lowercase = key.toLowerCase();
        if (key_lowercase in this) {
          if (row[key]) {
            this[key_lowercase] = Number(row[key]) || String(row[key]) || null;
          }
          // console.log("Yeah we got this")
        }
      });
    }
  }
}
