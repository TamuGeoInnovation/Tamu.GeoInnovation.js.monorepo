import { DataTask, DataTaskStatus, Log, LogType, ResourceType } from '@tamu-gisc/veoride/common/entities';

import { VeorideDataCompilerConfiguration } from '../interfaces/configuration.interface';
import { VeorideStatusChangesCompiler } from './status-changes.compiler';
import { VeorideTripsCompiler } from './trips.compiler';

export class VeorideDataCompilerManager {
  private config: VeorideDataCompilerConfiguration;
  private processing = false;

  constructor(config: VeorideDataCompilerConfiguration) {
    this.config = config;
  }

  public initialize() {
    console.log('Initializing data compiler service...');

    // Setup recurring check.
    setInterval(() => {
      this.doWork();
    }, this.config.checkInterval * 1000);

    // Execute cycle before the first interval
    setTimeout(() => {
      this.doWork();
    }, 3000);
  }

  private async doWork() {
    if (this.processing) {
      console.log('Still processing data task, skipping processing cycle.');
      return;
    }

    this.processing = true;

    // At service start up, check for any tasks that are marked as processing.
    // If they are, mark them as failed because the service likely restarted or crashed due to that specific task
    // and want to avoid re-trying it.
    await this.checkStalledAndMarkFailed();

    const queued = await this.checkTaskQueue();

    if (queued === undefined) {
      this.processing = false;
      return;
    }

    try {
      const nowTime = Date.now();

      console.log(`Found queued data request. Processing ${queued.id}`);
      await this.processTask(queued);

      const finishTime = Date.now();
      const seconds = (finishTime - nowTime) / 1000;

      this.updateTaskStatus(queued, DataTaskStatus.COMPLETE);
      console.log(`Finished processing data task: ${queued.id} in ${seconds} seconds.`);

      this.processing = false;
    } catch (err) {
      console.log(`Error processing data task: ${err}`);
      await this.updateTaskStatus(queued, DataTaskStatus.FAILED, err.message);
      this.processing = false;
    }
  }

  private async checkStalledAndMarkFailed() {
    try {
      const tasks = await DataTask.find({
        where: {
          status: DataTaskStatus.PROCESSING
        }
      });

      if (tasks.length === 0) {
        return;
      }

      console.log(`Found ${tasks.length} stalled data tasks. Marking as failed.`);

      const updated = tasks.map((task) => {
        return this.updateTaskStatus(task, DataTaskStatus.FAILED, 'Task stalled.');
      });

      return Promise.all(updated);
    } catch (err) {
      throw new Error(`Could not check for stalled data tasks: ${err.message}`);
    }
  }

  private async checkTaskQueue() {
    try {
      const pendingTask = await DataTask.findOne({
        where: {
          status: DataTaskStatus.QUEUED
        },
        order: {
          created: 'DESC'
        }
      });

      if (pendingTask === undefined) {
        return;
      }

      return pendingTask;
    } catch (err) {
      throw new Error(`Could not retrieve from the data task queue: ${err.message}`);
    }
  }

  private async processTask(task: DataTask) {
    try {
      await this.updateTaskStatus(task, DataTaskStatus.PROCESSING);

      const compiler = this.fetchResourceCompiler(task);

      if (compiler === undefined) {
        throw new Error(`Data compiler was not determined.`);
      }

      await compiler.writeTo(`${this.config.exportLocation}/${task.id}.json`);

      return;
    } catch (err) {
      throw new Error(`Could not process data task: ${err.message}`);
    }
  }

  private async updateTaskStatus(task: DataTask, status: DataTaskStatus, message?: string) {
    try {
      task.status = status;

      this.logDataTask(task, status, message);

      return task.save();
    } catch (err) {
      throw new Error(`Could not update data task status: ${err.message}`);
    }
  }

  private fetchResourceCompiler(task: DataTask): VeorideTripsCompiler | VeorideStatusChangesCompiler {
    if (task.resource === 'trips') {
      return new VeorideTripsCompiler(task);
    } else if (task.resource === 'status-changes' || task.resource === 'status_changes') {
      return new VeorideStatusChangesCompiler(task);
    } else {
      throw new Error(`Could not determine resource type from task: ${JSON.stringify(task)}`);
    }
  }

  private logDataTask(task: DataTask, status: DataTaskStatus, message?: string) {
    if (status === DataTaskStatus.QUEUED || status === DataTaskStatus.PROCESSING || status === DataTaskStatus.COMPLETE) {
      Log.record({
        resource: ResourceType.DATA_TASK,
        type: LogType.INFO,
        category: 'data-task-status',
        message: `Data task ${task.id} is ${status}`
      });
    } else if (status === DataTaskStatus.FAILED) {
      Log.record({
        resource: ResourceType.DATA_TASK,
        type: LogType.ERROR,
        category: 'data-task-status',
        message: `Data task ${task.id} is ${status}. ${message}`
      });
    }
  }
}
