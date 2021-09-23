import 'reflect-metadata';
import { createConnection } from 'typeorm';

import { Trip, StatusChange, DataTask, PersistanceRecord } from '@tamu-gisc/veoride/common/entities';
import { StatusChangeCollector, TripCollector } from '@tamu-gisc/veoride/scraper';

import { dbConfig, mdsProviderTripsOptions, mdsStatusChangesOptions } from './environments/environment';

createConnection({
  ...dbConfig,
  entities: [Trip, StatusChange, DataTask, PersistanceRecord]
})
  .then((connection) => {
    console.log('Database connection successful!');
    // const t = new TripCollector(mdsProviderTripsOptions).init();
    const sc = new StatusChangeCollector(mdsStatusChangesOptions).init();
  })
  .catch((error) => {
    console.error('Database connection error', error);
  });
