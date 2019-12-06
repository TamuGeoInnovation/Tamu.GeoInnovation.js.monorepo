import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Ancillary' })
export class AncillaryExpanded extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'record_id' })
  public record_id: number;

  @Column({ name: 'Record', type: 'mediumint', nullable: true })
  public record: number;

  @Column({ name: 'siteCode', type: 'varchar', nullable: true })
  public sitecode: string;

  @Column({ name: 'siteID', type: 'mediumint', nullable: true })
  public siteid: number;

  @Column({ name: 'Timestamp', type: 'datetime' })
  public timestamp: Date;

  @Column({ name: 'Abs_Rain', type: 'double precision', nullable: true })
  public abs_rain: number;

  @Column({ name: 'Accumulation', type: 'double precision', nullable: true })
  public accumulation: number;

  @Column({ name: 'AirTC', type: 'double precision', nullable: true })
  public airtc: number;

  @Column({ name: 'BattV_Min', type: 'double precision', nullable: true })
  public battv_min: number;

  @Column({ name: 'Error_Code', type: 'double precision', nullable: true })
  public error_code: number;

  @Column({ name: 'Intensity', type: 'double precision', nullable: true })
  public intensity: number;

  @Column({ name: 'METAR_4678', type: 'double precision', nullable: true })
  public metar_4678: number;

  @Column({ name: 'NDVI', type: 'double precision', nullable: true })
  public ndvi: number;

  @Column({ name: 'NDVI_FieldNIR', type: 'double precision', nullable: true })
  public ndvi_fieldnir: number;

  @Column({ name: 'NDVI_FieldRed', type: 'double precision', nullable: true })
  public ndvi_fieldred: number;

  @Column({ name: 'NDVI_SkyNIR', type: 'double precision', nullable: true })
  public ndvi_skynir: number;

  @Column({ name: 'NDVI_SkyRed', type: 'double precision', nullable: true })
  public ndvi_skyred: number;

  @Column({ name: 'NWS', type: 'double precision', nullable: true })
  public nws: number;

  @Column({ name: 'PAR_Den', type: 'double precision', nullable: true })
  public par_den: number;

  @Column({ name: 'PAR_Den_2', type: 'double precision', nullable: true })
  public par_den_2: number;

  @Column({ name: 'PAR_Tot_2_Tot', type: 'double precision', nullable: true })
  public par_tot_2_tot: number;

  @Column({ name: 'PAR_Tot_Tot', type: 'double precision', nullable: true })
  public par_tot_tot: number;

  @Column({ name: 'Particle_Count', type: 'double precision', nullable: true })
  public particle_count: number;

  @Column({ name: 'PRI', type: 'double precision', nullable: true })
  public pri: number;

  @Column({ name: 'PRI_FieldWB1', type: 'double precision', nullable: true })
  public pri_fieldwb1: number;

  @Column({ name: 'PRI_FieldWB2', type: 'double precision', nullable: true })
  public pri_fieldwb2: number;

  @Column({ name: 'PRI_SkyWB1', type: 'double precision', nullable: true })
  public pri_skywb1: number;

  @Column({ name: 'PRI_SkyWB2', type: 'double precision', nullable: true })
  public pri_skywb2: number;

  @Column({ name: 'PTemp_C', type: 'double precision', nullable: true })
  public ptemp_c: number;

  @Column({ name: 'Rain_mm_Tot', type: 'double precision', nullable: true })
  public rain_mm_tot: number;

  @Column({ name: 'Reflectivity', type: 'double precision', nullable: true })
  public reflectivity: number;

  @Column({ name: 'RH', type: 'double precision', nullable: true })
  public rh: number;

  @Column({ name: 'Sensor_Temp', type: 'double precision', nullable: true })
  public sensor_temp: number;

  @Column({ name: 'Snow_Depth_Int', type: 'double precision', nullable: true })
  public snow_depth_int: number;

  @Column({ name: 'Synop_4677', type: 'double precision', nullable: true })
  public synop_4677: number;
}
