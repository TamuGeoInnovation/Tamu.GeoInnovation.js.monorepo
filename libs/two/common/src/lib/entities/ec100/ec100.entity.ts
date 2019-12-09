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
export class EC100 extends StationInfo {
  // [prop: string]: number | null;

  // @PrimaryGeneratedColumn({ name: "RECORD" })
  // @IsNotEmpty()
  // record: number | null = null;

  /**
   * Average ambient temperature from EC100 temperature probe
   * Units: Deg C
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'TA_1_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public ta_1_1_1: number | null = null;

  /**
   * Relative humidity calculated from average temperature
   * Units: %
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'RH_1_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public rh_1_1_1: number | null = null;

  /**
   * Average dewpoint temperature calculated using temperature
   * from EC100 temperature probe.
   * Units: deg c
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'T_DP_1_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public t_dp_1_1_1: number | null = null;

  /**
   * Average water vapor pressure calculated using temperature
   * from the EC100 temperature probe
   * Units: kPa
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'amb_e', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public amb_e: number | null = null;

  /**
   * Average saturated water vapor pressure calculated using temperature
   * from the EC100 temperature probe
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'amb_e_sat', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public amb_e_sat: number | null = null;

  /**
   * Average ambient temperature calculated from sonic temperature,
   * water vapor density, and pressure
   * Units: deg C
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'TA_2_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public ta_2_1_1: number | null = null;

  /**
   * Average relative humidty calculated using sonic temperature,
   * water vapor density, and pressure
   * Units: %
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'RH_2_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public rh_2_1_1: number | null = null;

  /**
   * Average dewpoint temperature calculated using sonic temperature,
   * water vapor density, and pressure
   * Units: deg C
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'T_DP_2_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public t_dp_2_1_1: number | null = null;

  /**
   * Average water vapor pressure calculated from sonic temperature
   * Units: kPa
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'e', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public e: number | null = null;

  /**
   * Average saturated water vapor pressure calculated from sonic temperature
   * Units: kPa
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'e_sat', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public e_sat: number | null = null;

  /**
   * Average air temperature from temp/RH probe
   * Units: deg C
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'TA_3_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public ta_3_1_1: number | null = null;

  /**
   * Average relative humidity from temp/RH probe
   * Units: %
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'RH_3_1_1', type: 'double precision', nullable: true })
  @IsNotEmpty()
  @IsNumber()
  public rh_3_1_1: number | null = null;

  /**
   * Average dewpoint temperature from temp/RH probe
   * Units: deg C
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'T_DP_3_1_1', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public t_dp_3_1_1: number | null = null;

  /**
   * Average saturation vapor pressure derived from gas analyzer measurements
   * Units: kPa
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'e_probe', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public e_probe: number | null = null;

  /**
   * Average vapor pressure derived from gas analyzer measurements
   * Units: kPa
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'e_sat_probe', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public e_sat_probe: number | null = null;

  /**
   * Average water vapor density derived from temp/RH probe measurements
   * Units: g/m^3
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'H2O_probe', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public h2o_probe: number | null = null;

  /**
   * Average ambient air pressure
   * Units: kPa
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'PA', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public pa: number | null = null;

  /**
   * Vapor pressure deficit
   * Units: hPa
   *
   * @type {(number | null)}
   * @memberof EC100
   */
  @Column({ name: 'VPD', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  // @IsNumber()
  public vpd: number | null = null;

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
