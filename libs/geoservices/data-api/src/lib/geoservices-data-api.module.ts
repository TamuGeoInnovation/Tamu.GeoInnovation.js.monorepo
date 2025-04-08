import { Module } from '@nestjs/common';

import { ContactModule } from './modules/contact/contact.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [ContactModule, PaymentsModule],
  controllers: [],
  providers: [],
  exports: []
})
export class GeoservicesDataApiModule {}
