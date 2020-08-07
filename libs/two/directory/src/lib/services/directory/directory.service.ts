import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Stats } from 'fs';
import * as chokidar from 'chokidar';
import * as fs from 'fs-extra';
import * as path from 'path';

import {
  ACCEPTABLE_EXTS,
  ARCHIVE_DIRECTORY,
  FILENAME,
  FILES,
  FILENAME_REGEXP,
  SOURCE_DIRECTORY,
  VALIDATION_SERVICE,
  WORK_DIRECTORY
} from '../../environments/environment';

@Injectable()
export class DirectoryService {
  private filename: string;
  private sourceDir: string;
  private workDir: string;
  private archiveDir: string;
  private files: string[];

  constructor() {
    this.filename = FILENAME;
    this.sourceDir = SOURCE_DIRECTORY;
    this.workDir = WORK_DIRECTORY;
    this.archiveDir = ARCHIVE_DIRECTORY;
    this.files = FILES.split(',');
    this.watchFilesForChange();
  }

  /**
   * Watches a single file for any sort of changes.
   * Chokidar.watch() will only fire if the file has been saved
   * and then it waits 100 milliseconds before starting
   *
   * @memberof DirectoryService
   */
  public async watchFile() {
    const workFile = `${this.workDir}\\${this.filename}`;

    fs.access(this.sourceDir, fs.constants.F_OK, (accessErr) => {
      if (accessErr) {
        throw accessErr;
      }
      chokidar
        .watch(`${this.sourceDir}\\${this.filename}`, {
          atomic: true,
          depth: 0,
          awaitWriteFinish: true
        })
        .on('change', (filePath: string, stats: Stats) => {
          fs.copyFile(filePath, workFile, (chokidarErr) => {
            if (chokidarErr) {
              throw chokidarErr;
            }
            this.notifyValidationService(this.filename);
          });
        });
    });
  }
  /**
   * Used to watch a directory for added files of a set type
   *
   * @memberof DirectoryService
   */
  public async watchDirectory() {
    fs.access(this.sourceDir, fs.constants.F_OK, (err) => {
      if (!err) {
        console.log('Got access');
        chokidar.watch(this.sourceDir).on('add', (filePath, fileStats) => {
          const filename = path.basename(filePath);
          if (filename) {
            const ext = path.extname(filename);

            fs.access(path.join(this.sourceDir, filename), fs.constants.R_OK, (accessErr) => {
              if (!accessErr) {
                this.extIsValid(ext).then((validExt) => {
                  if (validExt) {
                    // console.log("Valid ext...", ext);
                    this.filenameIsValid(filename).then((validName) => {
                      if (validName) {
                        // console.log("Valid filename...", filename);
                        // this.notifyValidationService(filename);
                        const workFile = `${this.workDir}\\${filename}`;
                        const archFile = `${this.archiveDir}\\${filename}`;
                        fs.copyFile(filename, workFile, (copyErr) => {
                          if (copyErr) {
                            throw copyErr;
                          } else {
                            // this.notifyValidationService(filename);
                            fs.move(workFile, archFile, {
                              overwrite: true
                            })
                              .then(() => {
                                console.log('success');
                              })
                              .catch((moveErr) => {
                                console.error(moveErr);
                              });
                          }
                        });
                        // fs.copyFileSync(filename, destFile);
                      } else {
                        console.log('Invalid filename...');
                      }
                    });
                  } else {
                    console.warn('Unsupported extension, ignoring...');
                  }
                });
              } else {
                console.warn('File is unaccessible, ignoring...');
              }
            });
          }
        });
      }
    });
  }
  /**
   * Watches an array of files in the source directory
   *
   * @memberof DirectoryService
   */
  public async watchFilesForChange() {
    const filePaths: string[] = [];
    this.files.forEach((value, index) => {
      filePaths.push(`${this.sourceDir}\\${value}`);
    });

    fs.access(this.sourceDir, fs.constants.F_OK, (err) => {
      if (err) {
        throw err;
      }
      try {
        chokidar
          .watch(filePaths, {
            atomic: true,
            depth: 0,
            awaitWriteFinish: true
          })
          .on('change', (filePath: string, stats: Stats) => {
            console.log(filePath);
            const tokens = filePath.split('\\');
            const fileName = tokens[tokens.length - 1];
            const workFile = `${this.workDir}\\${fileName}`;
            fs.copyFile(filePath, workFile, (copyErr) => {
              if (copyErr) {
                throw copyErr;
              }
              this.notifyValidationService(workFile);
            });
          });
      } catch (error) {
        throw error;
      }
    });
  }

  /**
   * Checks the current file extension against a set list of acceptable extensions.
   *
   * @param {string} ext
   * @returns {Promise<boolean>}
   * @memberof DirectoryService
   */
  private async extIsValid(ext: string): Promise<boolean> {
    const exts = ACCEPTABLE_EXTS;
    return new Promise((resolve, reject) => {
      const isValid = exts.includes(ext);
      return resolve(isValid);
    });
  }
  /**
   * Determines if the supplied filename matches the RegEx defined in @tamu-gisc/two-shared
   *
   * @param {string} filename
   * @returns {Promise<boolean>}
   * @memberof DirectoryService
   */
  private async filenameIsValid(filename: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return resolve(FILENAME_REGEXP.test(filename));
    });
  }

  /**
   * Informs the validation service that the watched file has been altered
   *
   * @param {string} filepath
   * @memberof DirectoryService
   */
  private notifyValidationService(filepath: string): void {
    // const route = path.extname(filepath).substring(1);
    const route = `${VALIDATION_SERVICE.protocol}${VALIDATION_SERVICE.host}:${VALIDATION_SERVICE.port}/${VALIDATION_SERVICE.globalPrefix}/${VALIDATION_SERVICE.validation_route}`;
    const options = {
      method: 'POST',
      uri: route,
      body: {
        path: filepath
      },
      json: true
    };
    try {
      axios
        .post(route, {
          path: filepath
        })
        .catch((err) => {
          throw err;
        });
      // rp(options).catch((err) => {
      //   throw err;
      // });
    } catch (err) {
      throw err;
    }
  }
}
