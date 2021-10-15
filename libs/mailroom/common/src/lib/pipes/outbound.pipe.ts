import { ArgumentMetadata, HttpException, Injectable, PipeTransform } from '@nestjs/common';

import { MailroomOutbound } from '@tamu-gisc/mailroom/common';

@Injectable()
export class OutboundPipe implements PipeTransform {
  public transform(value: any, metadata: ArgumentMetadata) {
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

      // [tokens] defines array of words that could represent the email address we're sending this email to
      const tokens = ['email', 'to', 'recipient', 'recipiant'];

      tokens.forEach((token) => {
        const recipientEmailAddress: string = value[token];

        // Check if there is a value there and if that value includes @
        if (recipientEmailAddress && recipientEmailAddress.includes('@')) {
          // Looks like a valid email address, add it to the return value
          ret.recipientEmail = value[token];
        }
      });

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
