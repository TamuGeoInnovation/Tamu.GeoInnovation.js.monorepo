export enum SHOWDOWN_EVENT {
  ShowdownConcert = 'showdown-concert',
  ShowdownGame = 'showdown-game',
  YellPractice = 'yell-practice',
  BBQ = '13-0-burn'
}

export enum GAMEDAY_LAYERS {
  GAMEDAY_ROOT = 'gameday-root',
  GAMEDAY_ROOT_DISABLED_AND_PRESALE = 'gameday-root-disabled-and-presale',
  GAMEDAY_ROOT_POIS = 'gameday-root-pois',
  GAMEDAY_STRIPES = 'gameday-stripes',
  GAMEDAY_RNS_SPACES = 'gameday-rns-spaces',
  GAMEDAY_FOOTBALL_PARKING_LOTS = 'gameday-football-parking-lots',
  GAMEDAY_GRASS_MALL_AREAS = 'gameday-grass-mall-areas',
  GAMEDAY_GET_TO_THE_GRID = 'gameday-get-to-the-grid'
}

export const GAMEDAY_EVENT_NAMES = {
  [SHOWDOWN_EVENT.ShowdownConcert]: 'Cotton Holdings Lone Star Showdown Concert',
  [SHOWDOWN_EVENT.ShowdownGame]: 'Showdown Football Game',
  [SHOWDOWN_EVENT.YellPractice]: 'Yell Practice',
  [SHOWDOWN_EVENT.BBQ]: '13-0 Burn'
};

export interface FootballSettings {
  accessible: boolean;
  event: SHOWDOWN_EVENT;
}

export interface QueryParamSettings {
  /**
   * Event name
   */
  event: SHOWDOWN_EVENT;

  /**
   * Whether or not the user requires accessible accommodations
   */
  accessible?: string;
}
