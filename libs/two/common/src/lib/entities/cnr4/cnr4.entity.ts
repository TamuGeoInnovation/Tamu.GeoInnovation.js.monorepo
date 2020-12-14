import { ChildEntity, Column } from 'typeorm';

import { StationInfo } from '../station/station.entity';
import { WeatherFlux } from '../weatherflux/weatherflux.interface';

/**
 * Represents a sensor used in the TWO project.
 * Used for WeatherFlux.
 */
@ChildEntity()
export class CNR4 extends StationInfo {
  /**
   * Average net radiation (corrected for wind)
   *
   * Units: W m-2
   */
  @Column({ name: 'NETRAD', type: 'double precision', nullable: true })
  public netrad: number | null = null;

  /**
   * Average albedo
   *
   * Units: %
   */
  @Column({ name: 'ALB', type: 'double precision', nullable: true })
  public alb: number | null = null;

  /**
   * Average incoming short wave radiation
   *
   * Units: W m-2
   */
  @Column({ name: 'SW_IN', type: 'double precision', nullable: true })
  public sw_in: number | null = null;

  /**
   * Average outgoing short wave radiation
   *
   * Units: W m-2
   */
  @Column({ name: 'SW_OUT', type: 'double precision', nullable: true })
  public sw_out: number | null = null;

  /**
   * Average income long wave radiation
   *
   * Units: W m-2
   */
  @Column({ name: 'LW_IN', type: 'double precision', nullable: true })
  public lw_in: number | null = null;

  /**
   * Average outgoing long wave radiation
   *
   * Units: W m-2
   */
  @Column({ name: 'LW_OUT', type: 'double precision', nullable: true })
  public lw_out: number | null = null;

  /**
   * Average sensor body temperature
   *
   * Units: Klvin
   */
  @Column({ name: 'T_nr_Avg', type: 'double precision', nullable: true })
  public t_nr_avg: number | null = null;

  /**
   * Average raw incoming long wave radiation
   *
   * Units: W m-2
   */
  @Column({ name: 'LW_IN_meas', type: 'double precision', nullable: true })
  public lw_in_meas: number | null = null;

  /**
   * Average raw outgoing long wave radiation
   *
   * Units: W m-22 (Document says m-22, not sure if right)
   */
  @Column({ name: 'LW_OUT_meas', type: 'double precision', nullable: true })
  public lw_out_meas: number | null = null;

  constructor(row?: WeatherFlux) {
    super();
    if (row) {
      Object.keys(row).forEach((key, index) => {
        const key_lowercase = key.toLowerCase();
        if (key_lowercase in this) {
          if (row[key]) {
            this[key_lowercase] = Number(row[key]) || null;
          }
        }
      });
    }
  }
}
