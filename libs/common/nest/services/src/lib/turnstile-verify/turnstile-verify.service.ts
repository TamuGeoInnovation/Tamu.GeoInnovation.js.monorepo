import { Injectable } from '@nestjs/common';

import axios from 'axios';
import * as FormData from 'form-data';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

@Injectable()
export class TurnstileVerifyService {
  constructor(private readonly env: EnvironmentService) {}

  public async verify(token: string) {
    const formData = new FormData();

    formData.append('secret', this.env.value('turnstileSecretKey'));
    formData.append('response', token);

    try {
      const response: TurnstileVerifyResponse = await axios({
        method: 'POST',
        url: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        data: formData,
        responseType: 'json'
      });

      if (response.data.success) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

export interface TurnstileVerifyResponse {
  data: {
    success: boolean;
    'error-codes': string[];
    challenge_ts: string;
    hostname: string;
  };
}
