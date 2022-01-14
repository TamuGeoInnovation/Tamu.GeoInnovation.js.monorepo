export interface IEffluentTierMetadata {
  number: string;
  classification: 'Residence' | 'E&G' | 'Dining';
  area: number;
  tiers: Array<{
    tier: number;
    zone: number;
  }>;
}
