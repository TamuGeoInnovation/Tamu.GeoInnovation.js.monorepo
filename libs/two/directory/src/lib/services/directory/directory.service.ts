import { Injectable } from '@nestjs/common';

import * as chokidar from 'chokidar';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class DirectoryService {
  private ACCEPTABLE_EXTS = ['.csv', '.tsv'];
  private FILENAME_REGEXP = /^\d{6,8}_(SFPr|RFTA|RFAA|RFPr|TFPr|SUSM|DAFo|LCSh|LCGr)\S*(CSIFormat.csv)$/;
  private VALIDATION_SERVICE = {
    protocol: 'http://',
    host: 'localhost',
    port: 4010,
    globalPrefix: 'api',
    validation_route: 'validate'
  };
  private FILENAME = '04212017_SFPr_TEST_CSIFormat.csv';
  private SOURCE_DIRECTORY = 'C:\\Upload';
  private WORK_DIRECTORY = 'C:\\Upload\\Work';
  private ARCHIVE_DIRECTORY = 'C:\\Upload\\Archive';
  private FILES_LIST =
    'DAFo_Flux_CSIFormat.dat,SUSm_Flux_CSIFormat.dat,RFPr_Flux_CSIFormat.dat,RFTA_Flux_CSIFormat.dat,TFPr_Flux_CSIFormat.dat,RFAA_Flux_CSIFormat.dat,SFPr_Flux_CSIFormat.dat,LCGr_Flux_CSIFormat.dat';
  private files: string[];

  constructor() {
    this.files = this.FILES_LIST.split(',');
    this.watchFilesForChange();
  }

  /**
   * Watches a single file for any sort of changes.
   * Chokidar.watch() will only fire if the file has been saved
   * and then it waits 100 milliseconds before starting
   */
  public watchFile() {
    const workFile = `${this.WORK_DIRECTORY}\\${this.FILENAME}`;

    fs.access(this.SOURCE_DIRECTORY, fs.constants.F_OK, (accessErr) => {
      if (accessErr) {
        throw accessErr;
      }
      chokidar
        .watch(`${this.SOURCE_DIRECTORY}\\${this.FILENAME}`, {
          atomic: true,
          depth: 0,
          awaitWriteFinish: true
        })
        .on('change', (filePath: string) => {
          fs.copyFile(filePath, workFile, (chokidarErr) => {
            if (chokidarErr) {
              throw chokidarErr;
            }
            this.notifyValidationService(this.FILENAME);
          });
        });
    });
  }
  /**
   * Used to watch a directory for added files of a set type
   */
  public watchDirectory() {
    fs.access(this.SOURCE_DIRECTORY, fs.constants.F_OK, (err) => {
      if (!err) {
        console.log('Got access');
        chokidar.watch(this.SOURCE_DIRECTORY).on('add', (filePath) => {
          const filename = path.basename(filePath);
          if (filename) {
            const ext = path.extname(filename);

            fs.access(path.join(this.SOURCE_DIRECTORY, filename), fs.constants.R_OK, (accessErr) => {
              if (!accessErr) {
                if (this.extIsValid(ext)) {
                  if (this.filenameIsValid(filename)) {
                    const workFile = `${this.WORK_DIRECTORY}\\${filename}`;
                    const archFile = `${this.ARCHIVE_DIRECTORY}\\${filename}`;
                    fs.copyFile(filename, workFile, (copyErr) => {
                      if (copyErr) {
                        throw copyErr;
                      } else {
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
                  } else {
                    console.log('Invalid filename...');
                  }
                } else {
                  console.warn('Unsupported extension, ignoring...');
                }
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
   */
  public watchFilesForChange() {
    const filePaths: string[] = [];
    this.files.map((value) => {
      filePaths.push(`${this.SOURCE_DIRECTORY}\\${value}`);
    });

    fs.access(this.SOURCE_DIRECTORY, fs.constants.F_OK, (err) => {
      if (err) {
        throw err;
      }

      chokidar
        .watch(filePaths, {
          atomic: true,
          depth: 0,
          awaitWriteFinish: true
        })
        .on('change', (filePath: string) => {
          console.log(filePath);
          const tokens = filePath.split('\\');
          const fileName = tokens[tokens.length - 1];
          const workFile = `${this.WORK_DIRECTORY}\\${fileName}`;
          fs.copyFile(filePath, workFile, (copyErr) => {
            if (copyErr) {
              throw copyErr;
            }
            this.notifyValidationService(workFile);
          });
        });
    });
  }

  /**
   * Checks the current file extension against a set list of acceptable extensions.
   */
  private extIsValid(ext: string) {
    const exts = this.ACCEPTABLE_EXTS;
    const isValid = exts.includes(ext);
    return isValid;
  }
  /**
   * Determines if the supplied filename matches the RegEx defined in @tamu-gisc/two-shared
   */
  private filenameIsValid(filename: string) {
    return this.FILENAME_REGEXP.test(filename);
  }

  /**
   * Informs the validation service that the watched file has been altered
   */
  private notifyValidationService(filepath: string): void {
    const route = `${this.VALIDATION_SERVICE.protocol}${this.VALIDATION_SERVICE.host}:${this.VALIDATION_SERVICE.port}/${this.VALIDATION_SERVICE.globalPrefix}/${this.VALIDATION_SERVICE.validation_route}`;

    console.log(route, filepath);
  }
}
