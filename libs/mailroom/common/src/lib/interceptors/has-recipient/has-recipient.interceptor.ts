import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class HasRecipientInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler<boolean>) {
    console.log('HasRecipientInterceptor');
    const request = context.switchToHttp().getRequest();

    if (request && Object.keys(request.body).length > 0) {
      // passes body check, now to look for any mention of a recipient email
      let hasRecipientEmail = false;

      // [tokens] defines array of words that could represent the email address we're sending this email to
      const tokens = ['email', 'to', 'recipient', 'recipiant'];

      tokens.forEach((value) => {
        const recipientEmailAddress: string = request.body[value];

        // Check if there is a value there and if that value includes @
        if (recipientEmailAddress && recipientEmailAddress.includes('@')) {
          // Looks like a valid email address, proceed
          hasRecipientEmail = true;
          request.body.recipientEmail = recipientEmailAddress;
        }
      });

      if (hasRecipientEmail) {
        return next.handle();
      } else {
        // No recipient emails found; throw error
        throw new Error('No recipient email provided');
        // return { error: 'No recipient email provided' };
      }
    } else {
      // No request or request body; throw error
      // TODO: should we check query params here or something?
      throw new Error('No request body; request probably not multipart/form-data');
      // return { error: 'No recipient email provided' };
    }
  }
}
