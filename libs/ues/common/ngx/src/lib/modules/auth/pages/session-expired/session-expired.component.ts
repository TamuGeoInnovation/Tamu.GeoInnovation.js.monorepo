import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';

import { LegacyAuthService } from '@tamu-gisc/common/ngx/auth';
import { ActivatedRoute } from '@angular/router';
import { UESTamuBlockComponent } from '../../../core-ui/components/branding/ues-tamu-block/ues-tamu-block.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-session-expired',
  templateUrl: './session-expired.component.html',
  styleUrls: ['./session-expired.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [UESTamuBlockComponent, AsyncPipe]
})
export class SessionExpiredComponent {
  private auth = inject(LegacyAuthService);
  private route = inject(ActivatedRoute);

  /**
   * Seconds before redirect
   */
  private timeout = 7;

  public secondsLeft: Observable<number> = interval(1000).pipe(
    take(this.timeout + 1),
    map((count) => {
      return this.timeout - count;
    }),
    finalize(() => {
      this.redirect();
    })
  );

  public redirect() {
    const incomingUrl = this.route.snapshot.queryParams.ret;

    this.auth.redirect(incomingUrl);
  }
}
