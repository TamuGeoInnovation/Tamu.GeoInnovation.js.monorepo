export interface GsvcsSubscriptionTierCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  benefits: GsvcsSubscriptionBenefit[];
}

export interface GsvcsSubscriptionBenefit {
  id: string;
  name: string;
  description: string;
  value: number | string;
  showcase: boolean;
  order: number;
}

export interface GsvcsSubscriptionTier {
  id: string;
  name: string;
  description: string;
  categories: GsvcsSubscriptionTierCategory[];
}

export interface GsvcsSubscription {
  tier: GsvcsSubscriptionTier;
  status: string;
  active: boolean;
  nextPaymentDate: string; // MMDDYYYY format
  nextPaymentDateISO: string; // ISO format, if needed
  amount: number | string;
}
