import { PipeTransform, Injectable } from '@nestjs/common';

import * as fs from 'fs';

@Injectable()
export class FileAccessPipe implements PipeTransform {
  public transform(value) {
    fs.access(value, fs.constants.R_OK, (err) => {
      if (err) {
        throw err;
      }
    });

    return value;
  }
}
