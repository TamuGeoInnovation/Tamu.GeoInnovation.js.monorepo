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
export class CR6 extends StationInfo {
  // [prop: string]: number | string | null;

  // /**
  //  *
  //  *
  //  * @type {(number | null)}
  //  * @memberof CR6
  //  */
  // @PrimaryGeneratedColumn({ name: "RECORD" })
  // @IsNotEmpty()
  // record: number | null = null;

  /**
   * Time of data collection
   * Units: yyyy-mm-dd hh:mm:ss
   * @type {(string | null)}
   * @memberof CR6
   */
  @Column({ name: 'Timestamp', type: 'datetime', nullable: true })
  @IsNotEmpty()
  @IsDateString()
  public timestamp: string | null = null;

  constructor(row?: WeatherFlux) {
    super();
    if (row) {
      Object.keys(row).forEach((key, index) => {
        // console.log(key, index);
        const key_lowercase = key.toLowerCase();
        if (key_lowercase in this) {
          if (row[key]) {
            this[key_lowercase] = String(row[key]) || null;
          }
          // console.log("Yeah we got this")
        }
      });
    }
  }
}
