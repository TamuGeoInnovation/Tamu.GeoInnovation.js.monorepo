import { Entity, PrimaryColumn, UpdateDateColumn, CreateDateColumn, BeforeInsert, BaseEntity, Column } from 'typeorm';

import { v4 as guid } from 'uuid';

@Entity()
export class Token extends BaseEntity {
  @PrimaryColumn()
  public token: string;

  @UpdateDateColumn()
  public updated: Date;

  @CreateDateColumn()
  public created: Date;

  @Column({ nullable: true })
  public expires: Date;

  @Column()
  public identity: string;

  @BeforeInsert()
  private generateGuid(): void {
    if (this.token === undefined) {
      this.token = guid();
    }
  }
}
