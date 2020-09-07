import { Entity, BeforeUpdate, PrimaryColumn, BeforeInsert } from 'typeorm';
import * as guid from 'uuid/v4';

@Entity()
export class GuidIdentity {
  @PrimaryColumn()
  public guid: string;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
  }
}
