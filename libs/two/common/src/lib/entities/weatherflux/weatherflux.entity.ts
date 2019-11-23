import { Entity, Column, PrimaryGeneratedColumn, TableForeignKey } from 'typeorm';
import {
  validate,
  validateOrReject,
  Contains,
  IsIP,
  IsNotEmpty,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  IsDate,
  Min,
  Max,
  IsNumber
} from 'class-validator';
import { CNR4 } from '../cnr4/cnr4.entity';
import { CR6 } from '../cr6/cr6.entity';
import { CS655 } from '../cs655/cs655.entity';
import { EC100 } from '../ec100/ec100.entity';
import { HFP01 } from '../hfp01/hfp01.entity';
import { IRGASON } from '../irgason/irgason.entity';
import { TCAV } from '../tcav/tcav.entity';
import { TE525 } from '../te525/te525.entity';

/**
 * Represents all sensors used in the TWO project.
 */
@Entity()
export class WeatherFlux {
  constructor(
    readonly cnr4: CNR4,
    readonly cr6: CR6,
    readonly cs655: CS655,
    readonly ec100: EC100,
    readonly hfp01: HFP01,
    readonly irgason: IRGASON,
    readonly tcav: TCAV,
    readonly te525: TE525
  ) {}

  @PrimaryGeneratedColumn()
  public record_id: number;
}
