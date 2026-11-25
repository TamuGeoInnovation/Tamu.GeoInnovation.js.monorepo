import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Event, UserRsvp } from '../entities/all.entity';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { EventDashboard } from '../dashboards/event-dashboard';

/** The admin RSVP dashboard (#2878): each event's RSVPs counted by person type, when they were made, and an event's people. */
@Injectable()
export class RsvpDashboardProvider extends EventDashboard<UserRsvp> {
  constructor(
    @InjectRepository(UserRsvp) rsvpRepo: Repository<UserRsvp>,
    @InjectRepository(Event) eventRepo: Repository<Event>,
    people: DashboardProfilesService
  ) {
    super(rsvpRepo, eventRepo, people);
  }
}
