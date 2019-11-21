import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity({ name: 'Sites' })
export class Sites extends BaseEntity {
  @PrimaryGeneratedColumn()
  public siteId: number;

  @Column()
  public siteName: string;

  @Column()
  public siteNumber: number;

  @Column()
  public siteCode: string;

  @Column()
  public siteDescription: string;

  @Column()
  public ect_lat: number;

  @Column()
  public ect_long: number;

  @Column()
  public ec_footprint: number;

  @Column()
  public pred_wind_direction: string;

  @Column()
  public musym: string;

  @Column()
  public soilTexture: string;

  @Column()
  public watershed: string;

  @Column()
  public enabled: boolean;

  @Column()
  public updatedBy: number;

  @Column()
  public lastUpdate: Date;

  constructor() {
    super();
  }
}
