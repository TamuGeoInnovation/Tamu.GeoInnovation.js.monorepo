import 'reflect-metadata';
import { createConnection } from 'typeorm';

import { Trip, StatusChange, DataTask, PersistanceRecord } from '@tamu-gisc/veoride/common/entities';
import { TripCollector } from '@tamu-gisc/veoride/scraper';

import { dbConfig, mdsProviderTripsOptions } from './environments/environment';

createConnection({
  ...dbConfig,
  entities: [Trip, StatusChange, DataTask, PersistanceRecord]
})
  .then((connection) => {
    console.log('Database connection successful!');
    const t = new TripCollector(mdsProviderTripsOptions).init();
  })
  .catch((error) => {
    console.error('Database connection error', error);
  });
