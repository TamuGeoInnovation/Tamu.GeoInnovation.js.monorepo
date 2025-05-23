export interface GsvcsSubscriptionBenefit {
  id: string;
  name: string;
  description: string;
  value: number | string;
  showcase: boolean;
}

export interface GsvcsSubscriptionTier {
  id: string;
  name: string;
  description: string;
  benefits: GsvcsSubscriptionBenefit[];
}

export interface GsvcsSubscription {
  tier: GsvcsSubscriptionTier;
  status: string;
  active: boolean;
  nextPaymentDate: string; // MMDDYYYY format
  nextPaymentDateISO: string; // ISO format, if needed
  amount: number | string;
}
