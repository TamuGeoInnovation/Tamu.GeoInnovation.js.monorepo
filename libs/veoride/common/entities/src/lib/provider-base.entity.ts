import { Entity, BaseEntity, Column } from 'typeorm';

@Entity()
export class ProviderBase extends BaseEntity {
  @Column()
  public provider_id: string;

  @Column()
  public provider_name: string;

  @Column()
  public device_id: string;

  @Column()
  public vehicle_id: string;

  @Column()
  public vehicle_type: string;

  @Column()
  public propulsionTypes: string;
}
