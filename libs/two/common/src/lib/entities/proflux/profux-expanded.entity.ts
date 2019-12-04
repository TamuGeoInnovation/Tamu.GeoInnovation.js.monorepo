import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, AfterLoad } from 'typeorm';

@Entity({ name: 'ProFlux' })
export class ProFluxExpanded extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'record_id' })
  public record_id: number;

  @Column({ name: 'siteCode', type: 'varchar', nullable: true })
  public sitecode: string;

  @Column({ name: 'siteID', type: 'mediumint', nullable: true })
  public siteid: number;

  @Column({ name: 'file_date', type: 'date', select: false })
  public file_date: Date;

  @Column({ name: 'file_time', type: 'time', select: false })
  public file_time: Date;

  @Column({ name: 'absolute_units_hf', type: 'double precision' })
  public absolute_limits_hf: number;

  @Column({ name: 'air_density', type: 'double precision' })
  public air_density: number;

  @Column({ name: 'air_heat_capacity', type: 'double precision' })
  public air_heat_capacity: number;

  @Column({ name: 'air_molar_volume', type: 'double precision' })
  public air_molar_volume: number;

  @Column({ name: 'air_pressure', type: 'double precision' })
  public air_pressure: number;

  @Column({ name: 'air_temperature', type: 'double precision' })
  public air_temperature: number;

  @Column({ name: 'amplitude_resolution_hf', type: 'double precision' })
  public amplitude_resolution_hf: number;

  @Column({ name: 'attack_angle_hf', type: 'mediumint' })
  public attack_angle_hf: number;

  @Column({ name: 'bowen_ratio', type: 'double precision' })
  public bowen_ratio: number;

  @Column({ name: 'co2_def_timelag', type: 'tinyint' })
  public co2_def_timelag: number;

  @Column({ name: 'co2_flux', type: 'double precision' })
  public co2_flux: number;

  @Column({ name: 'co2_mixing_ratio', type: 'double precision' })
  public co2_mixing_ratio: number;

  @Column({ name: 'co2_molar_density', type: 'double precision' })
  public co2_molar_density: number;

  @Column({ name: 'co2_mole_fraction', type: 'double precision' })
  public co2_mole_fraction: number;

  @Column({ name: 'co2_scf', type: 'double precision' })
  public co2_scf: number;

  @Column({ name: 'co2_spikes' })
  public co2_spikes: number;

  @Column({ name: 'co2_strg', type: 'double precision', nullable: true })
  public co2_strg: number;

  @Column({ name: 'co2_time_lag', type: 'double precision' })
  public co2_time_lag: number;

  @Column({ name: 'co2_v_adv', type: 'double precision' })
  public co2_v_adv: number;

  @Column({ name: 'co2_var', type: 'double precision' })
  public co2_var: number;

  @Column({ name: 'daytime', type: 'double precision' })
  public daytime: number;

  @Column({ name: 'discontinuities_hf', type: 'double precision' })
  public discontinuities_hf: number;

  @Column({ name: 'discontinuities_sf', type: 'double precision' })
  public discontinuities_sf: number;

  @Column({ name: 'drop_out_hf', type: 'double precision' })
  public drop_out_hf: number;

  @Column({ name: 'e', type: 'double precision' })
  public e: number;

  @Column({ name: 'es', type: 'double precision' })
  public es: number;

  @Column({ name: 'et', type: 'double precision' })
  public et: number;

  @Column({ name: 'file_DOY', type: 'varchar' })
  public file_ooy: string;

  @Column({ name: 'file_name', type: 'varchar' })
  public file_name: string;

  @Column({ name: 'file_records', type: 'mediumint' })
  public file_records: number;

  @Column({ name: 'H', type: 'double precision' })
  public h: number;

  @Column({ name: 'H_scf', type: 'double precision' })
  public h_scf: number;

  @Column({ name: 'H_strg', type: 'double precision', nullable: true })
  public h_strg: number;

  @Column({ name: 'h20_v_adv', type: 'double precision' })
  public h20_v_adv: number;

  @Column({ name: 'h2o_def_timelag', type: 'tinyint' })
  public h2o_def_timelag: number;

  @Column({ name: 'h2o_flux', type: 'double precision' })
  public h2o_flux: number;

  @Column({ name: 'h2o_mixing_ratio', type: 'double precision' })
  public h2o_mixing_ratio: number;

  @Column({ name: 'h2o_molar_density', type: 'double precision' })
  public h2o_molar_density: number;

  @Column({ name: 'h2o_mole_fraction', type: 'double precision' })
  public h2o_mole_fraction: number;

  @Column({ name: 'h2o_scf', type: 'double precision' })
  public h2o_scf: number;

  @Column({ name: 'h2o_spikes', type: 'mediumint' })
  public h2o_spikes: number;

  @Column({ name: 'h2o_strg', type: 'double precision', nullable: true })
  public h2o_strg: number;

  @Column({ name: 'h2o_time_lag', type: 'double precision' })
  public h2o_time_lag: number;

  @Column({ name: 'h2o_var', type: 'double precision' })
  public h2o_var: number;

  @Column({ name: 'L', type: 'double precision' })
  public l: number;

  @Column({ name: 'LE', type: 'varchar' })
  public le: string;

  @Column({ name: 'LE_scf', type: 'double precision' })
  public le_scf: number;

  @Column({ name: 'LE_strg', type: 'double precision' })
  public le_strg: number;

  @Column({ name: 'max_wind_speed', type: 'double precision' })
  public max_wind_speed: number;

  @Column({ name: 'model', type: 'mediumint' })
  public model: number;

  @Column({ name: 'non_steady_wind_hf', type: 'mediumint' })
  public non_steady_wind_hf: number;

  @Column({ name: 'pitch', type: 'double precision' })
  public pitch: number;

  @Column({ name: 'qc_co2_flux', type: 'double precision' })
  public qc_co2_flux: number;

  @Column({ name: 'qc_h', type: 'mediumint' })
  public qc_h: number;

  @Column({ name: 'qc_co2_flux', type: 'mediumint' })
  public hq_h2o_flux: number;

  @Column({ name: 'qc_LE', type: 'mediumint' })
  public qc_le: number;

  @Column({ name: 'qc_Tau', type: 'mediumint' })
  public qc_tau: number;

  @Column({ name: 'RH', type: 'double precision' })
  public rh: number;

  @Column({ name: 'roll', type: 'double precision' })
  public roll: number;

  @Column({ name: 'skewness_kurtosis_hf', type: 'mediumint' })
  public skewness_kurtosis_hf: number;

  @Column({ name: 'skewness_kurtosis_sf', type: 'double precision' })
  public skewness_kurtosis_sf: number;

  @Column({ name: 'sonic_temperature', type: 'double precision' })
  public sonic_temperature: number;

  @Column({ name: 'specific_humidity', type: 'double precision' })
  public specific_humidity: number;

  @Column({ name: 'spikes_hf', type: 'double precision' })
  public spikes_hf: number;

  @Column({ name: 'T_star', type: 'double precision' })
  public t_star: number;

  @Column({ name: 'Tau', type: 'double precision' })
  public tau: number;

  @Column({ name: 'Tau_scf', type: 'double precision' })
  public tau_scf: number;

  @Column({ name: 'Tdew', type: 'double precision' })
  public tdew: number;

  @Column({ name: 'timelag_hf', type: 'mediumint' })
  public timelag_hf: number;

  @Column({ name: 'timelag_sf', type: 'mediumint' })
  public timelag_sf: number;

  @Column({ name: 'TKE', type: 'double precision' })
  public tke: number;

  @Column({ name: 'ts_spikes', type: 'mediumint' })
  public ts_spikes: number;

  @Column({ name: 'ts_var', type: 'double precision' })
  public ts_var: number;

  @Column({ name: 'u_rot', type: 'double precision' })
  public u_rot: number;

  @Column({ name: 'u_spikes', type: 'mediumint' })
  public u_spikes: number;

  @Column({ name: 'u_star', type: 'double precision' })
  public u_star: number;

  @Column({ name: 'u_unrot', type: 'double precision' })
  public u_unrot: number;

  @Column({ name: 'u_var', type: 'double precision' })
  public u_var: number;

  @Column({ name: 'un_co2_flux', type: 'double precision' })
  public un_co2_flux: number;

  @Column({ name: 'un_H', type: 'double precision' })
  public un_h: number;

  @Column({ name: 'un_co2_flux', type: 'double precision' })
  public un_h2o_flux: number;

  @Column({ name: 'un_LE', type: 'double precision' })
  public un_le: number;

  @Column({ name: 'un_Tau', type: 'double precision' })
  public un_tau: number;

  @Column({ name: 'used_records', type: 'mediumint' })
  public used_records: number;

  @Column({ name: 'v_rot', type: 'double precision' })
  public v_rot: number;

  @Column({ name: 'v_spkes', type: 'mediumint' })
  public v_spkes: number;

  @Column({ name: 'v_unrot', type: 'double precision' })
  public v_unrot: number;

  @Column({ name: 'v_var', type: 'double precision' })
  public v_var: number;

  @Column({ name: 'VPD', type: 'double precision' })
  public vpd: number;

  @Column({ name: 'w_co2_cov', type: 'double precision' })
  public w_co2_cov: number;

  @Column({ name: 'w_ho2_cov', type: 'double precision' })
  public w_ho2_cov: number;

  @Column({ name: 'w_rot', type: 'double precision' })
  public w_rot: number;

  @Column({ name: 'w_spikes', type: 'mediumint' })
  public w_spikes: number;

  @Column({ name: 'w_ts_cov', type: 'double precision' })
  public w_ts_cov: number;

  @Column({ name: 'w_unrot', type: 'double precision' })
  public w_unrot: number;

  @Column({ name: 'w_var', type: 'double precision' })
  public w_var: number;

  @Column({ name: 'water_vapor_density', type: 'double precision' })
  public water_vapor_density: number;

  @Column({ name: 'wind_dir', type: 'double precision' })
  public wind_dir: number;

  @Column({ name: 'wind_speed', type: 'double precision' })
  public wind_speed: number;

  @Column({ name: 'x_10_prct', type: 'mediumint' })
  public x_10_prct: number;

  @Column({ name: 'x_30_prct', type: 'mediumint' })
  public x_30_prct: number;

  @Column({ name: 'x_50_prct', type: 'mediumint' })
  public x_50_prct: number;

  @Column({ name: 'x_70_prct', type: 'mediumint' })
  public x_70_prct: number;

  @Column({ name: 'x_90_prct', type: 'mediumint' })
  public x_90_prct: number;

  @Column({ name: 'x_offset', type: 'mediumint' })
  public x_offset: number;

  @Column({ name: 'x_peak', type: 'double precision' })
  public x_peak: number;

  @Column({ name: 'yaw', type: 'double precision' })
  public yaw: number;

  @Column({ name: 'z_minus_d_div_l', type: 'double precision' })
  public z_minus_d_div_l: number;

  protected timestamp: Date;

  @AfterLoad()
  public computeFields() {
    this.timestamp = new Date(`${this.file_date}T${this.file_time}`);
  }
}
