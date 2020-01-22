import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Scenarios' })
export class Scenarios extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @PrimaryColumn()
  public guid: string;

  @Column()
  public title: string;

  @Column()
  public description: string;

  @Column()
  public mapCenter: string;

  @Column()
  public zoom: number;

  @Column({ length: 'max' })
  public layers: string;
}
