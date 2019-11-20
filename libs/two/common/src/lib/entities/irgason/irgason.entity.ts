import { ChildEntity, Entity, Column, PrimaryGeneratedColumn, TableForeignKey } from 'typeorm';
import { IsNotEmpty, IsInt, IsDate, Min, Max, IsNumber } from 'class-validator';
import { StationInfo } from '../station/station.entity';
import { WeatherFlux } from '../weatherflux/weatherflux.interface';

/**
 * Represents a sensor used in the TWO project.
 * Used for WeatherFlux.
 */
@ChildEntity()
export class IRGASON extends StationInfo {
  // [prop: string]: number | null;

  // @PrimaryGeneratedColumn({ name: "RECORD" })
  // @IsNotEmpty()
  // record: number | null = null;

  /**
   * CO2 flux
   * Units: umolCO2 m-2 s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Fc', type: 'double precision', nullable: true })
  // @IsNotEmpty()
  //@IsNumber()
  public fc: number | null = null;

  /**
   * Final corrected CO2 flux
   * Units: mg m-2 s-1
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Fc_mass', type: 'double precision', nullable: true })
  //@IsNumber()
  public fc_mass: number | null = null;

  /**
   * Overall quality grade for fc_molar and fc_mass following Foken et al. 2012
   * Units: Grade
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Fc_qc', type: 'double precision', nullable: true })
  //@IsNumber()
  public fc_qc: number | null = null;

  /**
   * Total number of time series samples used in calculation of Fo (description was incomplete)
   * Units: samples
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Fc_samples', type: 'double precision', nullable: true })
  //@IsNumber()
  public fc_samples: number | null = null;

  /**
   * Final corrected latent heat flux
   * Units: W m-2
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'LE', type: 'double precision', nullable: true })
  //@IsNumber()
  public le: number | null = null;

  /**
   * Overall quality grade for LE following Foken et al. 2012
   * Units: Grade
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'LE_QC', type: 'double precision', nullable: true })
  //@IsNumber()
  public le_qc: number | null = null;

  /**
   * Total number of time series samples used in calculation of LE
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'LE_samples', type: 'double precision', nullable: true })
  //@IsNumber()
  public le_samples: number | null = null;

  /**
   * Evapotranspiration
   * Units: mm hour-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'ET', type: 'double precision', nullable: true })
  //@IsNumber()
  public et: number | null = null;

  /**
   * Overall quality grade for ET
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'ET_QC', type: 'double precision', nullable: true })
  //@IsNumber()
  public et_qc: number | null = null;

  /**
   * Final corrected sensible heat flux derived from sonic sensible heat flux
   * Units: W m-2
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'H', type: 'double precision', nullable: true })
  //@IsNumber()
  public h: number | null = null;

  /**
   * Overall quality grade for Hs following Foken et al. 2012
   * Units: grade
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'H_QC', type: 'double precision', nullable: true })
  //@IsNumber()
  public h_qc: number | null = null;

  /**
   * Total number of time series samples used in calculation of H
   * Units: samples
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'H_samples', type: 'double precision', nullable: true })
  //@IsNumber()
  public h_samples: number | null = null;

  /**
   * The change in heat storage in the soil above the soil heat flux plates during the averaging interval
   * Units: W m-2
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'SG', type: 'double precision', nullable: true })
  //@IsNumber()
  public sg: number | null = null;

  /**
   * The ratio of sensible and latent heat fluxes over surface heat flux plus net
   * Units: fraction
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'energy_closure', type: 'double precision', nullable: true })
  //@IsNumber()
  public energy_closure: number | null = null;

  /**
   * 1 if true, energy closure is poor due to unknown reasons
   * Units: None
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'poor_energy_closure_flg', type: 'double precision', nullable: true })
  //@IsNumber()
  public poor_energy_closure_flg: number | null = null;

  /**
   * The ratio of final sensible heat flux over final latent heat flux
   * Units: fraction
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Bowen_ratio', type: 'double precision', nullable: true })
  //@IsNumber()
  public bowen_ratio: number | null = null;

  /**
   * Final corrected momentum flux
   * Units: kg m-1 s-2
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'TAU', type: 'double precision', nullable: true })
  //@IsNumber()
  public tau: number | null = null;

  /**
   * Overall quality grade for tau following Foken et al. 2012
   * Units: grade
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'TAU_QC', type: 'double precision', nullable: true })
  //@IsNumber()
  public tau_qc: number | null = null;

  /**
   * Friction velocity after coordinate rotations and frequency correction
   * Units: m s-1
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'USTAR', type: 'double precision', nullable: true })
  //@IsNumber()
  public ustar: number | null = null;

  /**
   * Scaling temperature after coordinate rotations, frequency corrections, and SDN
   * Units: deg C
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'TSTAR', type: 'double precision', nullable: true })
  //@IsNumber()
  public tstar: number | null = null;

  /**
   * Specific turbulence kinectic energy after coordinate rotation
   * Units: m2 s-2
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'TKE', type: 'double precision', nullable: true })
  //@IsNumber()
  public tke: number | null = null;

  /**
   * Average wind speed in x direction (horz.)
   * Units: m s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Ux', type: 'double precision', nullable: true })
  //@IsNumber()
  public ux: number | null = null;

  /**
   * Standard deviation of Ux
   * Units: m s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Ux_SIGMA', type: 'double precision', nullable: true })
  //@IsNumber()
  public ux_sigma: number | null = null;

  /**
   * Average wind speed in y direction (horz.)
   * Units: m s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Uy', type: 'double precision', nullable: true })
  //@IsNumber()
  public uy: number | null = null;

  /**
   * Standard deviation of Uy
   * Units: m s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Uy_SIGMA', type: 'double precision', nullable: true })
  //@IsNumber()
  public uy_sigma: number | null = null;

  /**
   * Average wind speed in z directoin (vert.)
   * Units: m s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Uz', type: 'double precision', nullable: true })
  //@IsNumber()
  public uz: number | null = null;

  /**
   * Standard deviation of Uz
   * Units: m s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'Uz_SIGMA', type: 'double precision', nullable: true })
  //@IsNumber()
  public uz_sigma: number | null = null;

  /**
   * Average sonic temperature
   * Units: deg C
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'T_SONIC', type: 'double precision', nullable: true })
  //@IsNumber()
  public t_sonic: number | null = null;

  /**
   * Standard deviation of sonic temperature
   * Units: deg C
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'T_SONIC_SIGMA', type: 'double precision', nullable: true })
  //@IsNumber()
  public t_sonic_sigma: number | null = null;

  /**
   * Compass direction in which the sonic negative x-axis points
   * Units: Decimal degrees
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'sonic_azimuth', type: 'double precision', nullable: true })
  //@IsNumber()
  public sonic_azimuth: number | null = null;

  /**
   * Average wind speed
   * Units: m s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'WS', type: 'double precision', nullable: true })
  //@IsNumber()
  public ws: number | null = null;

  /**
   * Average horizontal wind speed
   * Units: m s-1
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'WS_RSLT', type: 'double precision', nullable: true })
  //@IsNumber()
  public ws_rslt: number | null = null;

  /**
   * Average wind direction in the sonic coordinate system
   * Units: Decimal degrees
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'WD_SONIC', type: 'double precision', nullable: true })
  //@IsNumber()
  public wd_sonic: number | null = null;

  /**
   * Standard deviation of wind direction
   * Units: Decimal degrees
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'WD_SIGMA', type: 'double precision', nullable: true })
  //@IsNumber()
  public wd_sigma: number | null = null;

  /**
   * Average compass wind direction
   * Units: Decimal degrees
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'WD', type: 'double precision', nullable: true })
  //@IsNumber()
  public wd: number | null = null;

  /**
   * Maximum wind speed
   * Units: m s-1
   *
   * @memberof Irgason
   */
  @Column({ name: 'WS_MAX', type: 'double precision', nullable: true })
  //@IsNumber()
  public ws_max: number | null = null;

  /**
   * Avreage CO2 mass density
   * Units: mg m-3
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'CO2_density', type: 'double precision', nullable: true })
  //@IsNumber()
  public co2_density: number | null = null;

  /**
   * Standard deviation of CO2 mass density
   * Units: mg m-3
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'CO2_density_SIGMA', type: 'double precision', nullable: true })
  //@IsNumber()
  public co2_density_sigma: number | null = null;

  /**
   * Moles CO2 per mole of air
   * Units: mol/mol
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'CO2_mixratio', type: 'double precision', nullable: true })
  //@IsNumber()
  public co2_mixratio: number | null = null;

  /**
   * Water vapor mass density
   * Units: g m-3
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'H2O_density', type: 'double precision', nullable: true })
  //@IsNumber()
  public h2o_density: number | null = null;

  /**
   * Standard deviation of water vapor mass density
   * Units: g m-3
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'H2O_density_SIGMA', type: 'double precision', nullable: true })
  //@IsNumber()
  public h2o_density_sigma: number | null = null;

  /**
   * Moles H2O per mole of air
   * Units: mol / mol
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'H2O_mixratio', type: 'double precision', nullable: true })
  //@IsNumber()
  public h2o_mixratio: number | null = null;

  /**
   * Minimum CO2 signal strength
   * Units: fraction
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'CO2_sig_strgth_Min', type: 'double precision', nullable: true })
  //@IsNumber()
  public co2_sig_strgth_min: number | null = null;

  /**
   * Minimum H2O signal strength
   * Units: fraction
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'H2O_sig_strgth_Min', type: 'double precision', nullable: true })
  //@IsNumber()
  public h2o_sig_strgth_min: number | null = null;

  /**
   * Distance upwind where the maximum contribution to the footprint is found
   * Units: m
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'FETCH_MAX', type: 'double precision', nullable: true })
  //@IsNumber()
  public fetch_max: number | null = null;

  /**
   * Upwind distance that contains 90% of cumulative footprint
   * Units: m
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'FETCH_90', type: 'double precision', nullable: true })
  //@IsNumber()
  public fetch_90: number | null = null;

  /**
   * Upwind distance that contains 55% of footprint
   * Units: m
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'FETCH_55', type: 'double precision', nullable: true })
  //@IsNumber()
  public fetch_55: number | null = null;

  /**
   * Upwind distance that contains 40% of footprint. If NAN is returned,
   * integration of the model never reached 90% within the allowable distance of integration.
   * Units: m
   *
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'FETCH_40', type: 'double precision', nullable: true })
  //@IsNumber()
  public fetch_40: number | null = null;

  /**
   * Upwind distance of interest for the average wind direction
   * Units: m
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'UPWND_DIST_INTRST', type: 'double precision', nullable: true })
  //@IsNumber()
  public upwnd_dist_intrst: number | null = null;

  /**
   * Percentage of footprint from within the upwind range of interest
   * Units: %
   * @type {number}
   * @memberof Irgason
   */
  @Column({ name: 'FP_DIST_INTRST', type: 'double precision', nullable: true })
  //@IsNumber()
  public fp_dist_intrst: number | null = null;

  // TODO: Need to make sure that only WeatherFlux objects are sent here.
  // If not WeatherFlux, either error or fail gracefully
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
