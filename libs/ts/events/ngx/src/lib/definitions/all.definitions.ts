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
import { MoveOut } from './move-out.definitions';
import { GisDayTs } from './gis-day-map.definitions';
import { ContractorParkingTs } from './contractor-parking.definitions';
import { TimedParking_Ts } from './timed-parking.definitions';
import { VendorParking_Ts } from './vendor-parking.definitions';
import { MoveInTs } from './move-in.definitions';
import { NightWeekendTs } from './night-weekend.definitions';
import { StudentSelectableTs } from './student-selectable.definitions';
import { FreshmanSelectableTs } from './freshman-parking.definitions';
import { StaffSelectableTs } from './staff-selectable.definitions';
import { BusinessParkingTs } from './business-parking.definitions';
import { MotoristAssistanceTs } from './motorist-assistance.definitions';
import { MediaParkingTs } from './media-parking.definitions';
import { AccessibleParkingTs } from './accessible-parking.definitions';
import { ServiceLoadingTs } from './service-and-loading-zones.definitions';
import { RetireeParkingTs } from './retiree-parking.definitions';

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
  MoveOut,
  ContractorParkingTs,
  TimedParking_Ts,
  VendorParking_Ts,
  MoveInTs,
  NightWeekendTs,
  StudentSelectableTs,
  FreshmanSelectableTs,
  StaffSelectableTs,
  BusinessParkingTs,
  MotoristAssistanceTs,
  MediaParkingTs,
  AccessibleParkingTs,
  ServiceLoadingTs,
  RetireeParkingTs
];
