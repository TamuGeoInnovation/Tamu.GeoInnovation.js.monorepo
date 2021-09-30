import 'reflect-metadata';
import { createConnection } from 'typeorm';

import { Trip, StatusChange, DataTask } from '@tamu-gisc/veoride/common/entities';
import { VeorideDataCompilerManager } from '@tamu-gisc/veoride/data-compiler';

import { dbConfig, managerConfig } from './environments/environment';

createConnection({
  ...dbConfig,
  entities: [Trip, StatusChange, DataTask]
})
  .then((connection) => {
    console.log('Database connection successful!');
    new VeorideDataCompilerManager(managerConfig).initialize();
  })
  .catch((error) => {
    console.error('Database connection error', error);
  });
