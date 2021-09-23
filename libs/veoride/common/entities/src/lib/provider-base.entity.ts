import { Entity, BaseEntity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class ProviderBase extends BaseEntity {
  @Column()
  public provider_id: string;

  @Column()
  public provider_name: string;

  @Column()
  public vehicle_id: string;

  @Column()
  public vehicle_type: string;

  @Column()
  public propulsion_types: string;
}
