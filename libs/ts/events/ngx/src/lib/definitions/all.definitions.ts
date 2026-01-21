import { FourHRoundupTs } from './4h-roundup.definitions';
import { AggielandSaturdayEventTs } from './aggieland-saturday.definitions';
import { BigEventTs } from './big-event.definitions';
import { FamilyWeekendTs } from './family-weekend.definitions';
import { GraduationSpringEventTs } from './graduation-spring.definitions';
import { GraduationFallEventTs } from './graduation-fall.definitions';
import { SummerCommencementTs } from './graduation-summer.definitions';
import { HsGraduationTs } from './hs-graduation.definitions';
import { MaroonWhiteTs } from './maroon-white-game.definitions';
import { MS150Ts } from './ms150.definitions';
import { MusterTs } from './muster.definitions';
import { PhysicsAndEngineeringFestivalTs } from './phys-engineering-festival.definitions';
import { SoftballRegionalsTs } from './softball-regionals.definitions';
import { TroubadourTs } from './troubadour-festival.definitions';
import { FootballParkingEvent } from './football-parking.definitions';
import { RingDayEvent } from './ring-day.definitions';
import { ISpecialEventRoot } from '../interfaces/special-event.interface';
import { MensBasketball_Ts } from './mens-basketball.definitions';
import { WomensBasketball_Ts } from './womens-basketball.definitions';
import { GisDayTs } from './gis-day-map.definitions';
import { BaseballParkingTs } from './baseball-parking.definitions';

export const EventDefinitions: Array<ISpecialEventRoot> = [
  FourHRoundupTs,
  AggielandSaturdayEventTs,
  BigEventTs,
  FamilyWeekendTs,
  GraduationFallEventTs,
  GraduationSpringEventTs,
  SummerCommencementTs,
  HsGraduationTs,
  MaroonWhiteTs,
  MensBasketball_Ts,
  MS150Ts,
  MusterTs,
  PhysicsAndEngineeringFestivalTs,
  SoftballRegionalsTs,
  TroubadourTs,
  FootballParkingEvent,
  RingDayEvent,
  WomensBasketball_Ts,
  GisDayTs,
  BaseballParkingTs
];
