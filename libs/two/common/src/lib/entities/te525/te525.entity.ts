import { ChildEntity, Entity, Column, PrimaryGeneratedColumn, TableForeignKey } from 'typeorm';
import {
  validate,
  validateOrReject,
  Contains,
  IsIP,
  IsNotEmpty,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  IsDate,
  Min,
  Max,
  IsNumber,
  IsDateString
} from 'class-validator';
import { StationInfo } from '../station/station.entity';
import { WeatherFlux } from '../weatherflux/weatherflux.interface';

/**
 * Represents a sensor used in the TWO project.
 * Used for WeatherFlux.
 */
@ChildEntity()
export class TE525 extends StationInfo {
  // [prop: string]: number | null;

  // @PrimaryGeneratedColumn({ name: "RECORD" })
  // @IsNotEmpty()
  // record: number | null = null;

  /**
   * Total precipitation, sensor 1
   * Units: mm
   * @type {(number | null)}
   * @memberof CR6
   */
  @Column({ name: 'Precip1_tot', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public precip1_tot: number | null = null;

  /**
   * Total precipitation, sensor 2
   * Units: mm
   * @type {(number | null)}
   * @memberof TE525
   */
  @Column({ name: 'Precip2_Tot', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public precip2_tot: number | null = null;

  constructor(row?: WeatherFlux) {
    super();
    if (row) {
      Object.keys(row).forEach((key, index) => {
        // console.log(key, index);
        const key_lowercase = key.toLowerCase();
        if (key_lowercase in this) {
          if (row[key]) {
            this[key_lowercase] = Number(row[key]) || null;
          }
          // console.log("Yeah we got this")
        }
      });
    }
  }
}
