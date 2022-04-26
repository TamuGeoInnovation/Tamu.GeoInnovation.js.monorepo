import 'reflect-metadata';
import { createConnection } from 'typeorm';

import { Trip, StatusChange, DataTask, Vehicle, Log } from '@tamu-gisc/veoride/common/entities';
import { StatusChangeCollector, TripCollector, VehicleCollector } from '@tamu-gisc/veoride/scraper';

import { dbConfig, mdsProviderTripsOptions, mdsStatusChangesOptions, mdsVehiclesOptions } from './environments/environment';

connect()
  .then(() => {
    console.log('Database connection successful!');
    new TripCollector(mdsProviderTripsOptions).init();
    new StatusChangeCollector(mdsStatusChangesOptions).init();
    new VehicleCollector(mdsVehiclesOptions).init();
  })
  .catch((error) => {
    connect();
    console.error('Database connection error', error);
  });

function connect() {
  return createConnection({
    ...dbConfig,
    entities: [Trip, StatusChange, DataTask, Vehicle, Log]
  });
}
