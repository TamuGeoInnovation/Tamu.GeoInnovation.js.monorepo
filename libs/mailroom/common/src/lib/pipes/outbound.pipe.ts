import { ArgumentMetadata, HttpException, Injectable, PipeTransform } from '@nestjs/common';

import { MailroomOutbound } from '../types/mail.types';

@Injectable()
export class OutboundPipe implements PipeTransform {
  public transform(value, metadata: ArgumentMetadata) {
    const keys = Object.keys(value);

    const ret: Partial<MailroomOutbound> = {};

    if (value && keys.length > 0) {
      const bodyText: string[] = [];

      keys.forEach((key) => {
        // Omit empty props
        if (value[key] && value[key] !== '') {
          bodyText.push(key + ': ' + value[key]);
        }
      });

      if (bodyText) {
        ret.emailBodyText = bodyText.join(',\r');
      }

      if (value.emailGuid) {
        ret.emailGuid = value.emailGuid;
      }

      if (value.recipientEmail) {
        ret.recipientEmail = value.recipientEmail;
      }

      if (value.subjectLine) {
        ret.subjectLine = value.subjectLine;
      } else {
        // Need to set a default subjectLine
        ret.subjectLine = 'Message from TAMU GeoInnovation Service Center';
      }
    } else {
      // No request or request body; throw error
      // TODO: should we check query params here or something?
      throw new HttpException('No request body; request probably not multipart/form-data', 702);
    }

    return ret;
  }
}
