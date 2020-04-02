import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PhoneNumberType } from '@tamu-gisc/covid/common/entities';

import { PhoneNumberTypesService } from './phone-number-types.service';
import { PhoneNumberTypesController } from './phone-number-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneNumberType])],
  controllers: [PhoneNumberTypesController],
  providers: [PhoneNumberTypesService]
})
export class PhoneNumberTypesModule {}
