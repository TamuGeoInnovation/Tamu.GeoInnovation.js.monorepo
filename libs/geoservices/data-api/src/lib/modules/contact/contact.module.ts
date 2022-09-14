import { Module } from '@nestjs/common';

import { CommonNestServicesModule } from '@tamu-gisc/common/nest/services';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [CommonNestServicesModule],
  controllers: [ContactController],
  providers: [ContactService]
})
export class ContactModule {}
