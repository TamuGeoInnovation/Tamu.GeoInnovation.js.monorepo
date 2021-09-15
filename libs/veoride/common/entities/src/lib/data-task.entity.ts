import {
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  Column
} from 'typeorm';

import { v4 as guid } from 'uuid';

@Entity()
export class DataTask extends BaseEntity {
  @PrimaryColumn()
  public id: string;

  @UpdateDateColumn()
  public updated: Date;

  @CreateDateColumn()
  public created: Date;

  @Column()
  public status: number;

  @Column({ length: 'max' })
  public parameters: string;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.id === undefined) {
      this.id = guid();
    }
  }
}
