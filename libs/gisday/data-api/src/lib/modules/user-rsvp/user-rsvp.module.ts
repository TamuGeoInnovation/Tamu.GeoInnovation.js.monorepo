import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRsvpController } from '../../controllers/user-rsvp/user-rsvp.controller';
import { UserRsvpProvider } from '../../providers/user-rsvp/user-rsvp.provider';
import { EventRepo, RsvpTypeRepo, UserRsvpRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRsvpRepo, EventRepo, RsvpTypeRepo])],
  controllers: [UserRsvpController],
  providers: [UserRsvpProvider]
})
export class UserRsvpModule {}
