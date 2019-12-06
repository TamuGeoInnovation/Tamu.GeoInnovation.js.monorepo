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
export class HFP01 extends StationInfo {
  // [prop: string]: number | null;

  // @PrimaryGeneratedColumn({ name: "RECORD" })
  // @IsNotEmpty()
  // record: number | null = null;

  /**
   * Heat flux at the ground surface
   * Units: W m-2
   *
   * @type {(number | null)}
   * @memberof HFP01
   */
  @Column({ name: 'G', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public g: number | null = null;

  /**
   * Average soil heat flux; x is an index for the number of
   * HFP01 or HFP01SC
   * Units: W m-2
   * @type {(number | null)}
   * @memberof HFP01
   */
  @Column({ name: 'shf_plate_1_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public shf_plate_1_1_1: number | null = null;

  /**
   * Average soil heat flux; x is an index for the number of
   * HFP01 or HFP01SC
   * Units: W m-2
   * @type {(number | null)}
   * @memberof HFP01
   */
  @Column({ name: 'shf_plate_2_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public shf_plate_2_1_1: number | null = null;

  /**
   * Average soil heat flux; x is an index for the number of
   * HFP01 or HFP01SC
   * Units: W m-2
   * @type {(number | null)}
   * @memberof HFP01
   */
  @Column({ name: 'shf_plate_3_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public shf_plate_3_1_1: number | null = null;

  /**
   * Average soil heat flux; x is an index for the number of
   * HFP01 or HFP01SC
   * Units: W m-2
   * @type {(number | null)}
   * @memberof HFP01
   */
  @Column({ name: 'shf_plate_4_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public shf_plate_4_1_1: number | null = null;

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
