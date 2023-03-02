import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { readdir, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { Trip, StatusChange, DataTask, Log } from '@tamu-gisc/veoride/common/entities';
import { VeorideDataCompilerManager } from '@tamu-gisc/veoride/data-compiler';

import { dbConfig, managerConfig } from './environments/environment';

connect()
  .then(() => {
    console.log('Database connection successful!');
    new VeorideDataCompilerManager(managerConfig).initialize();
  })
  .catch((error) => {
    console.error('Database connection error', error);
    connect();
  });

setupFilePruner();

function connect() {
  return createConnection({
    ...dbConfig,
    entities: [Trip, StatusChange, DataTask, Log]
  });
}

function setupFilePruner() {
  setInterval(() => {
    checkStaleAndDelete();
  }, 1000 * 60 * 60 * 12); // Every 12 hours

  setTimeout(() => {
    checkStaleAndDelete();
  }, 3000); // On service start up
}

// Check all files in the export location and remove any that are older than the stale threshold.
async function checkStaleAndDelete() {
  const files = await readdir(managerConfig.exportLocation);
  const now = Date.now();

  if (files.length === 0) {
    console.log('No files to check for staleness.');
    return;
  }

  for (const file of files) {
    const filePath = join(managerConfig.exportLocation, file);

    const stats = await stat(filePath);

    const staleMinutes = Math.round((now - stats.mtime.getTime()) / 1000 / 60);
    if (stats.mtime.getTime() <= now - managerConfig.staleThreshold) {
      console.log(`File ${file} is ${staleMinutes} minutes stale. Deleting.`);

      try {
        await rm(filePath);
        console.log(`Deleted file ${file}`);
      } catch (err) {
        console.error(`Error deleting file ${file}`, err);
      }
    } else {
      console.log(`File ${file} is only ${staleMinutes} minutes old, not stale.`);
    }
  }
}
