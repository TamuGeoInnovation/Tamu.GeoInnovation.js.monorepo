import { ChildEntity, Column } from 'typeorm';

import { StationInfo } from '../station/station.entity';
import { WeatherFlux } from '../weatherflux/weatherflux.interface';

/**
 * Represents a sensor used in the TWO project.
 * Used for WeatherFlux.
 */
@ChildEntity()
export class HFP01 extends StationInfo {
  /**
   * Heat flux at the ground surface
   *
   * Units: W m-2
   */
  @Column({ name: 'G', type: 'double precision', nullable: true })
  public g: number | null = null;

  /**
   * Average soil heat flux; x is an index for the number of
   * HFP01 or HFP01SC
   *
   * Units: W m-2
   */
  @Column({ name: 'shf_plate_1_1_1', type: 'double precision', nullable: true })
  public shf_plate_1_1_1: number | null = null;

  /**
   * Average soil heat flux; x is an index for the number of
   * HFP01 or HFP01SC
   *
   * Units: W m-2
   */
  @Column({ name: 'shf_plate_2_1_1', type: 'double precision', nullable: true })
  public shf_plate_2_1_1: number | null = null;

  /**
   * Average soil heat flux; x is an index for the number of
   * HFP01 or HFP01SC
   *
   * Units: W m-2
   */
  @Column({ name: 'shf_plate_3_1_1', type: 'double precision', nullable: true })
  public shf_plate_3_1_1: number | null = null;

  /**
   * Average soil heat flux; x is an index for the number of
   * HFP01 or HFP01SC
   *
   * Units: W m-2
   */
  @Column({ name: 'shf_plate_4_1_1', type: 'double precision', nullable: true })
  public shf_plate_4_1_1: number | null = null;

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
