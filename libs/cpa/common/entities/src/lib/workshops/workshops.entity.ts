import { Entity, BaseEntity, PrimaryColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Workshops' })
export class Workshops extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @PrimaryColumn()
  public guid: string;

  @Column()
  public title: string;

  @Column()
  public description: string;

  @Column()
  public date: Date;
}
