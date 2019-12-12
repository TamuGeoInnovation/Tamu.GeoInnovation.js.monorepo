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
export class CNR4 extends StationInfo {
  // @PrimaryGeneratedColumn({ name: "RECORD" })
  // @IsNotEmpty()
  // record: number | null = null;

  /**
   * Average net radiation (corrected for wind)
   * Units: W m-2
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'NETRAD', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public netrad: number | null = null;

  /**
   * Average albedo
   * Units: %
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'ALB', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public alb: number | null = null;

  /**
   * Average incoming short wave radiation
   * Units: W m-2
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'SW_IN', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public sw_in: number | null = null;

  /**
   * Average outgoing short wave radiation
   * Units: W m-2
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'SW_OUT', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public sw_out: number | null = null;

  /**
   * Average income long wave radiation
   * Units: W m-2
   *
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'LW_IN', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public lw_in: number | null = null;

  /**
   * Average outgoing long wave radiation
   * Units: W m-2
   *
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'LW_OUT', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public lw_out: number | null = null;

  /**
   * Average sensor body temperature
   * Units: Klvin
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'T_nr_Avg', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public t_nr_avg: number | null = null;

  /**
   * Average raw incoming long wave radiation
   * Units: W m-2
   *
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'LW_IN_meas', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public lw_in_meas: number | null = null;

  /**
   * Average raw outgoing long wave radiation
   * Units: W m-22 (Document says m-22, not sure if right)
   * @type {(number | null)}
   * @memberof CNR4
   */
  @Column({ name: 'LW_OUT_meas', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public lw_out_meas: number | null = null;

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
