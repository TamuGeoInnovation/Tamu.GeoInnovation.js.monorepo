import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PhoneNumber, PhoneNumberType, County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneNumber, PhoneNumberType, County, CountyClaim])],
  controllers: [PhoneNumbersController],
  providers: [PhoneNumbersService]
})
export class PhoneNumbersModule {}
