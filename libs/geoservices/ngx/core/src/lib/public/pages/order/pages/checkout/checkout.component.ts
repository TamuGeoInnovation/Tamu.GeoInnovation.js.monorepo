import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom, map, Observable, shareReplay, switchMap } from 'rxjs';

import { loadScript, PayPalNamespace } from '@paypal/paypal-js';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AuthService, LoggedInState, PaymentsService } from '@tamu-gisc/geoservices/ngx/data-access';
import { IPayflowExpressCheckoutTokenResponse } from '@tamu-gisc/geoservices/data-api';

@Component({
  selector: 'tamu-gisc-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  private _accountsUrl: string;
  public accountSettingsUrl: string;
  public profileData: Observable<LoggedInState['data']>;

  public order: Observable<IPayflowExpressCheckoutTokenResponse>;

  @ViewChild('paypalButtonContainer', { static: true })
  private _buttonElement: ElementRef;
  private _ppClient: string;

  constructor(
    private readonly env: EnvironmentService,
    private readonly auth: AuthService,
    private readonly ps: PaymentsService
  ) {}

  public async ngOnInit(): Promise<void> {
    this._accountsUrl = this.env.value('accounts_url', false);
    this.accountSettingsUrl = `${this._accountsUrl}/UserServices/Profile`;
    this.profileData = this.auth.state.pipe(
      map((state) => {
        if (state.loggedIn) {
          return state.data;
        } else {
          return null;
        }
      })
    );

    this._ppClient = this.env.value('paypal_client_id', false);

    this.order = this.profileData.pipe(
      switchMap((profile) => {
        if (!profile) {
          throw new Error('User profile not available');
        }
        return this.ps.initializeOrder(profile.Guid, profile.Email);
      }),
      shareReplay(1)
    );

    try {
      const paypal = await loadScript({
        clientId: this._ppClient ?? 'sb',
        currency: 'USD',
        components: 'buttons',
        vault: true
      });

      if (!paypal || !paypal.Buttons) {
        throw new Error('Failed to load PayPal script or Buttons component');
      }

      paypal
        .Buttons({
          createOrder: async () => {
            const order = await firstValueFrom(
              this.profileData.pipe(
                switchMap((profile) => {
                  if (!profile) {
                    throw new Error('User profile not available');
                  }
                  return this.ps.initializeOrder(profile.Guid, profile.Email);
                })
              )
            );

            return order.TOKEN;
          },
          onApprove: async (data) => {
            firstValueFrom(this.ps.captureOrder(data)).then((res) => {
              console.log('Payment successful', res);
            });
          },
          onCancel: (data) => {
            console.log('Payment cancelled', data);
          },
          onError: (err) => {
            console.error('Error with PayPal button', err);
          }
        })
        .render(this._buttonElement.nativeElement);
    } catch (e) {
      console.error('Error loading PayPal script', e);
    }
  }
}
