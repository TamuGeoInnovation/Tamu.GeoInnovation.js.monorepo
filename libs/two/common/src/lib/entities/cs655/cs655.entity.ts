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
  IsNumber
} from 'class-validator';
import { StationInfo } from '../station/station.entity';
import { WeatherFlux } from '../weatherflux/weatherflux.interface';

/**
 * Represents a sensor used in the TWO project.
 * Used for WeatherFlux.
 */
@ChildEntity()
export class CS655 extends StationInfo {
  // @PrimaryGeneratedColumn({ name: "RECORD" })
  // @IsNotEmpty()
  // record: number | null = null;

  /**
   * Average volumetric soil water content for each CS616, CS650, or CS655.
   * X is an index for the number of each sensor model above
   * Units: %
   * @type {(number | null)}
   * @memberof CS655
   */
  @Column({ name: 'SWC_1_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public swc_1_1_1: number | null = null;

  /**
   * Average volumetric soil water content for each CS616, CS650, or CS655.
   * X is an index for the number of each sensor model above
   * Units: %
   * @type {(number | null)}
   * @memberof CS655
   */
  @Column({ name: 'SWC_2_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public swc_2_1_1: number | null = null;

  /**
   * Average electrical conductivity for each sensor.
   * X is an index for the number of CS650 or CS655.
   * Units: dS m-1
   * @type {(number | null)}
   * @memberof CS655
   */
  @Column({ name: 'cs65x_ec_1_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public cs65x_ec_1_1_1: number | null = null;

  /**
   * Average electrical conductivity for each sensor.
   * X is an index for the number of CS650 or CS655.
   * Units: dS m-1
   * @type {(number | null)}
   * @memberof CS655
   */
  @Column({ name: 'cs65x_ec_2_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public cs65x_ec_2_1_1: number | null = null;

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
