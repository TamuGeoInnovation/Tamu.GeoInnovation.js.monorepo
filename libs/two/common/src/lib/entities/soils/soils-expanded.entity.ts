import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Soils' })
export class SoilsExpanded extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'record_id' })
  public record_id: number;

  @Column({ name: 'siteCode', type: 'varchar', nullable: true })
  public sitecode: string;

  @Column({ name: 'siteID', type: 'mediumint', nullable: true })
  public siteid: number;

  @Column({ name: 'Timestamp', type: 'datetime' })
  public timestamp: Date;

  @Column({ name: 'Record', type: 'mediumint', nullable: true })
  public record: number;

  @Column({ name: 'fileName', type: 'varchar', nullable: true })
  public filename: string;

  @Column({ name: 'VWC_1_Max', type: 'double precision', nullable: true })
  public vwc_1_max: number;

  @Column({ name: 'VWC_1_TMx', type: 'datetime', nullable: true })
  public vwc_1_tmx: Date;

  @Column({ name: 'VWC_1_Min', type: 'double precision', nullable: true })
  public vwc_1_min: number;

  @Column({ name: 'VWC_1_TMn', type: 'datetime', nullable: true })
  public vwc_1_tmn: Date;

  @Column({ name: 'VWC_1_Avg', type: 'double precision', nullable: true })
  public vwc_1_avg: number;

  @Column({ name: 'VWC_2_Max', type: 'double precision', nullable: true })
  public vwc_2_max: number;

  @Column({ name: 'VWC_2_TMx', type: 'datetime', nullable: true })
  public vwc_2_tmx: Date;

  @Column({ name: 'VWC_2_Min', type: 'double precision', nullable: true })
  public vwc_2_min: number;

  @Column({ name: 'VWC_2_TMn', type: 'datetime', nullable: true })
  public vwc_2_tmn: Date;

  @Column({ name: 'VWC_2_Avg', type: 'double precision', nullable: true })
  public vwc_2_avg: number;

  @Column({ name: 'VWC_3_Max', type: 'double precision', nullable: true })
  public vwc_3_max: number;

  @Column({ name: 'VWC_3_TMx', type: 'datetime', nullable: true })
  public vwc_3_tmx: Date;

  @Column({ name: 'VWC_3_Min', type: 'double precision', nullable: true })
  public vwc_3_min: number;

  @Column({ name: 'VWC_3_TMn', type: 'datetime', nullable: true })
  public vwc_3_tmn: Date;

  @Column({ name: 'VWC_3_Avg', type: 'double precision', nullable: true })
  public vwc_3_avg: number;

  @Column({ name: 'VWC_4_Max', type: 'double precision', nullable: true })
  public vwc_4_max: number;

  @Column({ name: 'VWC_4_TMx', type: 'datetime', nullable: true })
  public vwc_4_tmx: Date;

  @Column({ name: 'VWC_4_Min', type: 'double precision', nullable: true })
  public vwc_4_min: number;

  @Column({ name: 'VWC_4_TMn', type: 'datetime', nullable: true })
  public vwc_4_tmn: Date;

  @Column({ name: 'VWC_4_Avg', type: 'double precision', nullable: true })
  public vwc_4_avg: number;

  @Column({ name: 'VWC_5_Max', type: 'double precision', nullable: true })
  public vwc_5_max: number;

  @Column({ name: 'VWC_5_TMx', type: 'datetime', nullable: true })
  public vwc_5_tmx: Date;

  @Column({ name: 'VWC_5_Min', type: 'double precision', nullable: true })
  public vwc_5_min: number;

  @Column({ name: 'VWC_5_TMn', type: 'datetime', nullable: true })
  public vwc_5_tmn: Date;

  @Column({ name: 'VWC_5_Avg', type: 'double precision', nullable: true })
  public vwc_5_avg: number;

  @Column({ name: 'EC_1_Avg', type: 'double precision', nullable: true })
  public ec_1_avg: number;

  @Column({ name: 'VR_1_Avg', type: 'double precision', nullable: true })
  public vr_1_avg: number;

  @Column({ name: 'P_1_Avg', type: 'double precision', nullable: true })
  public p_1_avg: number;

  @Column({ name: 'T_1_Avg', type: 'double precision', nullable: true })
  public t_1_avg: number;

  @Column({ name: 'EC_2_Avg', type: 'double precision', nullable: true })
  public ec_2_avg: number;

  @Column({ name: 'VR_2_Avg', type: 'double precision', nullable: true })
  public vr_2_avg: number;

  @Column({ name: 'P_2_Avg', type: 'double precision', nullable: true })
  public p_2_avg: number;

  @Column({ name: 'T_2_Avg', type: 'double precision', nullable: true })
  public t_2_avg: number;

  @Column({ name: 'EC_3_Avg', type: 'double precision', nullable: true })
  public ec_3_avg: number;

  @Column({ name: 'VR_3_Avg', type: 'double precision', nullable: true })
  public vr_3_avg: number;

  @Column({ name: 'P_3_Avg', type: 'double precision', nullable: true })
  public p_3_avg: number;

  @Column({ name: 'T_3_Avg', type: 'double precision', nullable: true })
  public t_3_avg: number;

  @Column({ name: 'EC_4_Avg', type: 'double precision', nullable: true })
  public ec_4_avg: number;

  @Column({ name: 'VR_4_Avg', type: 'double precision', nullable: true })
  public vr_4_avg: number;

  @Column({ name: 'P_4_Avg', type: 'double precision', nullable: true })
  public p_4_avg: number;

  @Column({ name: 'T_4_Avg', type: 'double precision', nullable: true })
  public t_4_avg: number;

  @Column({ name: 'EC_5_Avg', type: 'double precision', nullable: true })
  public ec_5_avg: number;

  @Column({ name: 'VR_5_Avg', type: 'double precision', nullable: true })
  public vr_5_avg: number;

  @Column({ name: 'P_5_Avg', type: 'double precision', nullable: true })
  public p_5_avg: number;

  @Column({ name: 'T_5_Avg', type: 'double precision', nullable: true })
  public t_5_avg: number;

  @Column({ name: 'MatP1_Max', type: 'double precision', nullable: true })
  public matp1_max: number;

  @Column({ name: 'MatP1_TMx', type: 'datetime', nullable: true })
  public matp1_tmx: Date;

  @Column({ name: 'MatP1_Min', type: 'double precision', nullable: true })
  public matp1_min: number;

  @Column({ name: 'MatP1_TMn', type: 'datetime', nullable: true })
  public matp1_tmn: Date;

  @Column({ name: 'MatP1_Avg', type: 'double precision', nullable: true })
  public matp1_avg: number;

  @Column({ name: 'MatP2_Max', type: 'double precision', nullable: true })
  public matp2_max: number;

  @Column({ name: 'MatP2_TMx', type: 'datetime', nullable: true })
  public matp2_tmx: Date;

  @Column({ name: 'MatP2_Min', type: 'double precision', nullable: true })
  public matp2_min: number;

  @Column({ name: 'MatP2_TMn', type: 'datetime', nullable: true })
  public matp2_tmn: Date;

  @Column({ name: 'MatP2_Avg', type: 'double precision', nullable: true })
  public matp2_avg: number;

  @Column({ name: 'MatP3_Max', type: 'double precision', nullable: true })
  public matp3_max: number;

  @Column({ name: 'MatP3_TMx', type: 'datetime', nullable: true })
  public matp3_tmx: Date;

  @Column({ name: 'MatP3_TMn', type: 'datetime', nullable: true })
  public matp3_tmn: Date;

  @Column({ name: 'MatP3_Min', type: 'double precision', nullable: true })
  public matp3_min: number;

  @Column({ name: 'MatP3_Avg', type: 'double precision', nullable: true })
  public matp3_avg: number;

  @Column({ name: 'MatP4_Max', type: 'double precision', nullable: true })
  public matp4_max: number;

  @Column({ name: 'MatP4_TMx', type: 'datetime', nullable: true })
  public matp4_tmx: Date;

  @Column({ name: 'MatP4_Min', type: 'double precision', nullable: true })
  public matp4_min: number;

  @Column({ name: 'MatP4_TMn', type: 'datetime', nullable: true })
  public matp4_tmn: Date;

  @Column({ name: 'MatP4_Avg', type: 'double precision', nullable: true })
  public matp4_avg: number;

  @Column({ name: 'MatP5_Max', type: 'double precision', nullable: true })
  public matp5_max: number;

  @Column({ name: 'MatP5_TMx', type: 'datetime', nullable: true })
  public matp5_tmx: Date;

  @Column({ name: 'MatP5_Min', type: 'double precision', nullable: true })
  public matp5_min: number;

  @Column({ name: 'MatP5_TMn', type: 'datetime', nullable: true })
  public matp5_tmn: Date;

  @Column({ name: 'MatP5_Avg', type: 'double precision', nullable: true })
  public matp5_avg: number;

  @Column({ name: 'GW_Depth_Avg', type: 'double precision', nullable: true })
  public gw_depth_avg: number;

  @Column({ name: 'GW_Temp_Avg', type: 'double precision', nullable: true })
  public gw_temp_avg: number;

  @Column({ name: 'GW_BEC_Avg', type: 'double precision', nullable: true })
  public gw_bec_avg: number;

  @Column({ name: 'soilNode', type: 'mediumint', nullable: true })
  public soilnode: number;

  @Column({ name: 'StartTemp_C(1)', type: 'double precision', nullable: true })
  public start_temp_c_1: number;

  @Column({ name: 'StartTemp_C(2)', type: 'double precision', nullable: true })
  public start_temp_c_2: number;

  @Column({ name: 'StartTemp_C(3)', type: 'double precision', nullable: true })
  public start_temp_c_3: number;

  @Column({ name: 'StartTemp_C(4)', type: 'double precision', nullable: true })
  public start_temp_c_4: number;

  @Column({ name: 'StartTemp_C(5)', type: 'double precision', nullable: true })
  public start_temp_c_5: number;

  @Column({ name: 'DeltaT_C(1)', type: 'double precision', nullable: true })
  public delta_t_c_1: number;

  @Column({ name: 'DeltaT_C(2)', type: 'double precision', nullable: true })
  public delta_t_c_2: number;

  @Column({ name: 'DeltaT_C(3)', type: 'double precision', nullable: true })
  public delta_t_c_3: number;

  @Column({ name: 'DeltaT_C(4)', type: 'double precision', nullable: true })
  public delta_t_c_4: number;

  @Column({ name: 'DeltaT_C(5)', type: 'double precision', nullable: true })
  public delta_t_c_5: number;
}
