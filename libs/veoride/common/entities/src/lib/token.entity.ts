import { Entity, PrimaryColumn, UpdateDateColumn, BeforeInsert, BaseEntity, Column } from 'typeorm';

import { v4 as guid } from 'uuid';

@Entity()
export class Token extends BaseEntity {
  @PrimaryColumn()
  public guid: string;

  @UpdateDateColumn()
  public updated: Date;

  @Column({ nullable: false })
  public issued: Date;

  @Column({ nullable: false })
  public expires: Date;

  @Column({ nullable: false })
  public identity: string;

  @Column({ default: false })
  public revoked: boolean;

  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
  }
}
