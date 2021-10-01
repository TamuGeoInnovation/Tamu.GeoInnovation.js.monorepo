import 'reflect-metadata';
import { createConnection } from 'typeorm';

import { Trip, StatusChange, DataTask, PersistanceRecord, Vehicle, Log } from '@tamu-gisc/veoride/common/entities';
import { StatusChangeCollector, TripCollector, VehicleCollector } from '@tamu-gisc/veoride/scraper';

import { dbConfig, mdsProviderTripsOptions, mdsStatusChangesOptions, mdsVehiclesOptions } from './environments/environment';

createConnection({
  ...dbConfig,
  entities: [Trip, StatusChange, DataTask, PersistanceRecord, Vehicle, Log]
})
  .then((connection) => {
    console.log('Database connection successful!');
    const t = new TripCollector(mdsProviderTripsOptions).init();
    const sc = new StatusChangeCollector(mdsStatusChangesOptions).init();
    const v = new VehicleCollector(mdsVehiclesOptions).init();
  })
  .catch((error) => {
    console.error('Database connection error', error);
  });
