import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'WeatherFlux' })
export class WeatherfluxExpanded extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'RECORD' })
  public record: number | null;

  @Column({ name: 'siteCode', type: 'varchar', nullable: true })
  public sitecode;

  @Column({ name: 'siteID', type: 'mediumint', nullable: true })
  public siteid: number | null;

  @Column({ name: 'record_id', type: 'mediumint', nullable: true })
  public record_id: number | null;

  @Column({ name: 'NETRAD', type: 'double precision', nullable: true })
  public netrad: number | null;

  @Column({ name: 'ALB', type: 'double precision', nullable: true })
  public alb: number | null;

  @Column({ name: 'SW_IN', type: 'double precision', nullable: true })
  public sw_in: number | null;

  @Column({ name: 'SW_OUT', type: 'double precision', nullable: true })
  public sw_out: number | null;

  @Column({ name: 'LW_IN', type: 'double precision', nullable: true })
  public lw_in: number | null;

  @Column({ name: 'LW_OUT', type: 'double precision', nullable: true })
  public lw_out: number | null;

  @Column({ name: 'T_nr_Avg', type: 'double precision', nullable: true })
  public t_nr_avg: number | null;

  @Column({ name: 'LW_IN_meas', type: 'double precision', nullable: true })
  public lw_in_meas: number | null;

  @Column({ name: 'LW_OUT_meas', type: 'double precision', nullable: true })
  public lw_out_meas: number | null;

  @Column({ name: 'Timestamp', type: 'datetime', nullable: true })
  public timestamp: string | null;

  @Column({ name: 'SWC_1_1_1', type: 'double precision', nullable: true })
  public swc_1_1_1: number | null;

  @Column({ name: 'SWC_2_1_1', type: 'double precision', nullable: true })
  public swc_2_1_1: number | null;

  @Column({ name: 'cs65x_ec_1_1_1', type: 'double precision', nullable: true })
  public cs65x_ec_1_1_1: number | null;

  @Column({ name: 'cs65x_ec_2_1_1', type: 'double precision', nullable: true })
  public cs65x_ec_2_1_1: number | null;

  @Column({ name: 'TA_1_1_1', type: 'double precision', nullable: true })
  public ta_1_1_1: number | null;

  @Column({ name: 'RH_1_1_1', type: 'double precision', nullable: true })
  public rh_1_1_1: number | null;

  @Column({ name: 'T_DP_1_1_1', type: 'double precision', nullable: true })
  public t_dp_1_1_1: number | null;

  @Column({ name: 'amb_e', type: 'double precision', nullable: true })
  public amb_e: number | null;

  @Column({ name: 'amb_e_sat', type: 'double precision', nullable: true })
  public amb_e_sat: number | null;

  @Column({ name: 'TA_2_1_1', type: 'double precision', nullable: true })
  public ta_2_1_1: number | null;

  @Column({ name: 'RH_2_1_1', type: 'double precision', nullable: true })
  public rh_2_1_1: number | null;

  @Column({ name: 'T_DP_2_1_1', type: 'double precision', nullable: true })
  public t_dp_2_1_1: number | null;

  @Column({ name: 'e', type: 'double precision', nullable: true })
  public e: number | null;

  @Column({ name: 'e_sat', type: 'double precision', nullable: true })
  public e_sat: number | null;

  @Column({ name: 'TA_3_1_1', type: 'double precision', nullable: true })
  public ta_3_1_1: number | null;

  @Column({ name: 'RH_3_1_1', type: 'double precision', nullable: true })
  public rh_3_1_1: number | null;

  @Column({ name: 'T_DP_3_1_1', type: 'double precision', nullable: true })
  public t_dp_3_1_1: number | null;

  @Column({ name: 'e_probe', type: 'double precision', nullable: true })
  public e_probe: number | null;

  @Column({ name: 'e_sat_probe', type: 'double precision', nullable: true })
  public e_sat_probe: number | null;

  @Column({ name: 'H2O_probe', type: 'double precision', nullable: true })
  public h2o_probe: number | null;

  @Column({ name: 'PA', type: 'double precision', nullable: true })
  public pa: number | null;

  @Column({ name: 'VPD', type: 'double precision', nullable: true })
  public vpd: number | null;

  @Column({ name: 'G', type: 'double precision', nullable: true })
  public g: number | null;

  @Column({ name: 'shf_plate_1_1_1', type: 'double precision', nullable: true })
  public shf_plate_1_1_1: number | null;

  @Column({ name: 'shf_plate_2_1_1', type: 'double precision', nullable: true })
  public shf_plate_2_1_1: number | null;

  @Column({ name: 'shf_plate_3_1_1', type: 'double precision', nullable: true })
  public shf_plate_3_1_1: number | null;

  @Column({ name: 'shf_plate_4_1_1', type: 'double precision', nullable: true })
  public shf_plate_4_1_1: number | null;

  @Column({ name: 'Fc', type: 'double precision', nullable: true })
  public fc: number | null;

  @Column({ name: 'Fc_mass', type: 'double precision', nullable: true })
  public fc_mass: number | null;

  @Column({ name: 'Fc_qc', type: 'double precision', nullable: true })
  public fc_qc: number | null;

  @Column({ name: 'Fc_samples', type: 'double precision', nullable: true })
  public fc_samples: number | null;

  @Column({ name: 'LE', type: 'double precision', nullable: true })
  public le: number | null;

  @Column({ name: 'LE_QC', type: 'double precision', nullable: true })
  public le_qc: number | null;

  @Column({ name: 'LE_samples', type: 'double precision', nullable: true })
  public le_samples: number | null;

  @Column({ name: 'ET', type: 'double precision', nullable: true })
  public et: number | null;

  @Column({ name: 'ET_QC', type: 'double precision', nullable: true })
  public et_qc: number | null;

  @Column({ name: 'H', type: 'double precision', nullable: true })
  public h: number | null;

  @Column({ name: 'H_QC', type: 'double precision', nullable: true })
  public h_qc: number | null;

  @Column({ name: 'H_samples', type: 'double precision', nullable: true })
  public h_samples: number | null;

  @Column({ name: 'SG', type: 'double precision', nullable: true })
  public sg: number | null;

  @Column({ name: 'energy_closure', type: 'double precision', nullable: true })
  public energy_closure: number | null;

  @Column({ name: 'poor_energy_closure_flg', type: 'double precision', nullable: true })
  public poor_energy_closure_flg: number | null;

  @Column({ name: 'Bowen_ratio', type: 'double precision', nullable: true })
  public bowen_ratio: number | null;

  @Column({ name: 'TAU', type: 'double precision', nullable: true })
  public tau: number | null;

  @Column({ name: 'TAU_QC', type: 'double precision', nullable: true })
  public tau_qc: number | null;

  @Column({ name: 'USTAR', type: 'double precision', nullable: true })
  public ustar: number | null;

  @Column({ name: 'TSTAR', type: 'double precision', nullable: true })
  public tstar: number | null;

  @Column({ name: 'TKE', type: 'double precision', nullable: true })
  public tke: number | null;

  @Column({ name: 'Ux', type: 'double precision', nullable: true })
  public ux: number | null;

  @Column({ name: 'Ux_SIGMA', type: 'double precision', nullable: true })
  public ux_sigma: number | null;

  @Column({ name: 'Uy', type: 'double precision', nullable: true })
  public uy: number | null;

  @Column({ name: 'Uy_SIGMA', type: 'double precision', nullable: true })
  public uy_sigma: number | null;

  @Column({ name: 'Uz', type: 'double precision', nullable: true })
  public uz: number | null;

  @Column({ name: 'Uz_SIGMA', type: 'double precision', nullable: true })
  public uz_sigma: number | null;

  @Column({ name: 'T_SONIC', type: 'double precision', nullable: true })
  public t_sonic: number | null;

  @Column({ name: 'T_SONIC_SIGMA', type: 'double precision', nullable: true })
  public t_sonic_sigma: number | null;

  @Column({ name: 'sonic_azimuth', type: 'double precision', nullable: true })
  public sonic_azimuth: number | null;

  @Column({ name: 'WS', type: 'double precision', nullable: true })
  public ws: number | null;

  @Column({ name: 'WS_RSLT', type: 'double precision', nullable: true })
  public ws_rslt: number | null;

  @Column({ name: 'WD_SONIC', type: 'double precision', nullable: true })
  public wd_sonic: number | null;

  @Column({ name: 'WD_SIGMA', type: 'double precision', nullable: true })
  public wd_sigma: number | null;

  @Column({ name: 'WD', type: 'double precision', nullable: true })
  public wd: number | null;

  @Column({ name: 'WS_MAX', type: 'double precision', nullable: true })
  public ws_max: number | null;

  @Column({ name: 'CO2_density', type: 'double precision', nullable: true })
  public co2_density: number | null;

  @Column({ name: 'CO2_density_SIGMA', type: 'double precision', nullable: true })
  public co2_density_sigma: number | null;

  @Column({ name: 'CO2_mixratio', type: 'double precision', nullable: true })
  public co2_mixratio: number | null;

  @Column({ name: 'H2O_density', type: 'double precision', nullable: true })
  public h2o_density: number | null;

  @Column({ name: 'H2O_density_SIGMA', type: 'double precision', nullable: true })
  public h2o_density_sigma: number | null;

  @Column({ name: 'H2O_mixratio', type: 'double precision', nullable: true })
  public h2o_mixratio: number | null;

  @Column({ name: 'CO2_sig_strgth_Min', type: 'double precision', nullable: true })
  public co2_sig_strgth_min: number | null;

  @Column({ name: 'H2O_sig_strgth_Min', type: 'double precision', nullable: true })
  public h2o_sig_strgth_min: number | null;

  @Column({ name: 'FETCH_MAX', type: 'double precision', nullable: true })
  public fetch_max: number | null;

  @Column({ name: 'FETCH_90', type: 'double precision', nullable: true })
  public fetch_90: number | null;

  @Column({ name: 'FETCH_55', type: 'double precision', nullable: true })
  public fetch_55: number | null;

  @Column({ name: 'FETCH_40', type: 'double precision', nullable: true })
  public fetch_40: number | null;

  @Column({ name: 'UPWND_DIST_INTRST', type: 'double precision', nullable: true })
  public upwnd_dist_intrst: number | null;

  @Column({ name: 'FP_DIST_INTRST', type: 'double precision', nullable: true })
  public fp_dist_intrst: number | null;

  @Column({ name: 'TS_1_1_1', type: 'double precision', nullable: true })
  public ts_1_1_1: number | null;

  @Column({ name: 'TS_2_1_1', type: 'double precision', nullable: true })
  public ts_2_1_1: number | null;

  @Column({ name: 'Precip1_tot', type: 'double precision', nullable: true })
  public precip1_tot: number | null;

  @Column({ name: 'Precip2_Tot', type: 'double precision', nullable: true })
  public precip2_tot: number | null;
}
