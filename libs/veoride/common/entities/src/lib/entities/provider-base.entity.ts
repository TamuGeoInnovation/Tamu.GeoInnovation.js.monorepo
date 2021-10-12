import { Entity, BaseEntity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';

import { v4 as guid } from 'uuid';
@Entity()
export class ProviderBase extends BaseEntity {
  @PrimaryColumn()
  public guid: string;

  @Column()
  public device_id: string;

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

  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
  }
}
