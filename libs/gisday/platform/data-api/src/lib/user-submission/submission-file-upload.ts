import { mkdir } from 'fs/promises';

import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';

import { DEFAULT_UPLOAD_LIMITS } from '@tamu-gisc/common/nest/services';
import { SUBMISSION_FILE_RULES, extensionOf } from '@tamu-gisc/gisday/common';

import { uploadingDirectory } from './submission-files.service';

/**
 * How a submission file is received (#2933). Written to disk as it arrives, not held in memory as the 5 MB logos are:
 * three students sending 100 MB at once would otherwise be 300 MB of the API's memory. Refused before it is stored if
 * its name is not a PowerPoint or PDF, and cut off at the size limit (413). The name is read as UTF-8, so "Café.pptx"
 * downloads as it was uploaded.
 */
export const SUBMISSION_FILE_UPLOAD: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, done) => {
      const directory = uploadingDirectory();

      mkdir(directory, { recursive: true }).then(
        () => done(null, directory),
        (err) => done(err, directory)
      );
    },
    filename: (_req, _file, done) => done(null, `${crypto.randomUUID()}.part`)
  }),
  limits: { ...DEFAULT_UPLOAD_LIMITS, fileSize: SUBMISSION_FILE_RULES.maxBytes },
  defParamCharset: 'utf8',
  fileFilter: (_req, file, accept) => {
    if (SUBMISSION_FILE_RULES.extensions.includes(extensionOf(file.originalname))) {
      accept(null, true);
    } else {
      accept(
        new BadRequestException(
          `${file.originalname} is not a PowerPoint or PDF file. Only .pdf, .ppt and .pptx files can be attached.`
        ),
        false
      );
    }
  }
};
