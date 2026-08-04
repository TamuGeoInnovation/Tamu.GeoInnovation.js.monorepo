import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, forwardRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { AbstractValueAccessorFormComponent } from '../../models/abstract-value-accessor-form/abstract-value-accessor-form.component';

@Component({
  selector: 'tamu-gisc-turnstile-challenge',
  templateUrl: './turnstile-challenge.component.html',
  styleUrls: ['./turnstile-challenge.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TurnstileChallengeComponent),
      multi: true
    }
  ]
})
export class TurnstileChallengeComponent extends AbstractValueAccessorFormComponent<string> implements OnInit {
  constructor(
    private cdd: ChangeDetectorRef,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private readonly env: EnvironmentService
  ) {
    super(cdd);
  }

  public ngOnInit(): void {
    const script = this.renderer.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.type = 'text/javascript';
    script.defer = true;

    this.renderer.appendChild(this._document.body, script);

    script.onload = () => {
      this.initChallenge();
    };
  }

  private initChallenge(): void {
    const turnstile = (window as any)['turnstile'];
    if (turnstile) {
      turnstile.render('.turnstile-container', {
        sitekey: this.env.value('turnstile_sitekey'),
        callback: (token: string) => {
          this.value = token;
        }
      });
    } else {
      console.error('Error initializing Turnstile challenge.');
    }
  }
}
