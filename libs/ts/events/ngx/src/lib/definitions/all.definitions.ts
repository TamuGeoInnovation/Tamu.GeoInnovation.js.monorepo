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
import { SoftballParkingTs } from './softball-parking.definitions';
import { SwimmingParkingTs } from './swimming-parking.definitions';
import { TennisParkingTs } from './tennis-parking.definitions';
import { IndoorTrackParkingTs } from './indoor-track-parking.definitions';
import { OutdoorTrackParkingTs } from './outdoor-track-parking.definitions';
import { CrossCountryParkingTs } from './cross-country-parking.definitions';
import { SoccerParkingTs } from './soccer-parking.definitions';
import { VolleyballParkingTs } from './volleyball-parking.definitions';
import { TroubadourTs } from './troubadour-festival.definitions';
import { FootballParkingEvent } from './football-parking.definitions';
import { RingDayEvent } from './ring-day.definitions';
import { AggiemapCustomMapConfiguration } from '../interfaces/special-event.interface';
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
import { MaintenanceParkingTs } from './maintenance-parking.definitions';
import { BaseballParkingTs } from './baseball-parking.definitions';
import { SavannahBananasParkingTs } from './savannah-bananas.definitions';
import { VisitorParkingTs } from './visitor-parking.definitions';
import { MotorcycleParkingTs } from './motorcycle-parking.definitions';
import { AVPParkingTs } from './avp-parking.definitions';
import { NscParkingTs } from './nsc-parking.definitions';
import { BreakSummerParkingTs } from './break-summer.definitions';
import { SustainableTransportationTs } from './sustainable-transportation.definitions';
import { TsMainParkingTs } from './main-parking.definitions';
import { SecGroundsConferenceTs } from './sec-grounds-conference.definitions';

export const EventDefinitions: Array<AggiemapCustomMapConfiguration> = [
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
  SoftballParkingTs,
  SwimmingParkingTs,
  TennisParkingTs,
  IndoorTrackParkingTs,
  OutdoorTrackParkingTs,
  CrossCountryParkingTs,
  SoccerParkingTs,
  VolleyballParkingTs,
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
  RetireeParkingTs,
  MaintenanceParkingTs,
  BaseballParkingTs,
  //SavannahBananasParkingTs, // put back when map is ready
  VisitorParkingTs,
  MotorcycleParkingTs,
  AVPParkingTs,
  NscParkingTs,
  BreakSummerParkingTs,
  SustainableTransportationTs,
  TsMainParkingTs,
  SecGroundsConferenceTs
];
