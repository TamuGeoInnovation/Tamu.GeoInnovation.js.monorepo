import { Module } from '@nestjs/common';

import { ContactModule } from './modules/contact/contact.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TierModule } from './modules/tier/tier.module';
import { TierCategoryModule } from './modules/tier-category/tier-category.module';
import { TierBenefitModule } from './modules/tier-benefit/tier-benefit.module';

@Module({
  imports: [ContactModule, PaymentsModule, TierModule, TierCategoryModule, TierBenefitModule],
  controllers: [],
  providers: [],
  exports: []
})
export class GeoservicesDataApiModule {}
