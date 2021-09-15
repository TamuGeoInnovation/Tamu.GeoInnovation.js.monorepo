import 'reflect-metadata';
import { createConnection } from 'typeorm';

import { Trip, StatusChange, DataTask } from '@tamu-gisc/veoride/common/entities';

import { dbConfig } from './environments/environment';

createConnection({
  ...dbConfig,
  entities: [Trip, StatusChange, DataTask]
})
  .then((connection) => {
    console.log('Database connection successful!');
  })
  .catch((error) => {
    console.error('Database connection error', error);
  });
