import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import {
  CodeMaroonService,
  CodeMaroonState,
  CodeMaroonAlert,
  CODE_MAROON_SAMPLES,
  EmergencyType,
  inferEmergencyType,
  isMonthlyTest,
  EMERGENCY_PROCEDURES_INDEX
} from '../../services/code-maroon';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe, DatePipe } from '@angular/common';

/**
 * The Code Maroon alert, over the map (#1289).
 *
 * Lives in the application shell rather than inside the map, so `/code-maroon` can load the ordinary
 * map module untouched and the alert sits on top of it. It shows nothing at all on any other route.
 *
 * Development only, twice over: the route is not reachable on production, and this checks
 * `isTesting` itself rather than trusting that.
 */
@Component({
  selector: 'tamu-gisc-code-maroon-alert',
  templateUrl: './code-maroon-alert.component.html',
  styleUrls: ['./code-maroon-alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ButtonComponent, AsyncPipe, DatePipe]
})
export class CodeMaroonAlertComponent implements OnInit, OnDestroy {
  public state: Observable<CodeMaroonState>;
  public dismissed = false;

  private _subscriptions = new Subscription();
  /** The live poll, held so a sample can stop it. */
  private _watch?: Subscription;

  constructor(
    private readonly codeMaroon: CodeMaroonService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly ts: TestingService
  ) {
    this.state = this.codeMaroon.state;
  }

  public ngOnInit(): void {
    if (!this.ts.isTesting) {
      return;
    }

    // `?sample=tornado` shows a fabricated alert so the map can be demonstrated while the real feed
    // is empty, which is its normal state. Anything shown this way is marked as a sample.
    //
    // This component lives in the application shell, so it exists before the router has finished its
    // first navigation: the first emission here carries no parameters even when the URL has them.
    // Reacting to every emission handles that, but the live poll must then be *stopped* when a
    // sample arrives - otherwise it starts on that empty first emission and overwrites the sample on
    // its next tick, thirty seconds in, which is exactly what it did.
    this._subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        const sample = params.get('sample');

        if (sample && CODE_MAROON_SAMPLES[sample]) {
          this._watch?.unsubscribe();
          this._watch = undefined;
          this.codeMaroon.showSample([CODE_MAROON_SAMPLES[sample]]);

          return;
        }

        if (!this._watch) {
          this._watch = this.codeMaroon.watch().subscribe();
          this._subscriptions.add(this._watch);
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /** Only on the Code Maroon route, and only where development features are shown. */
  public get enabled(): boolean {
    return this.ts.isTesting && this.router.url.split('?')[0].startsWith('/code-maroon');
  }

  public typeFor(alert: CodeMaroonAlert): EmergencyType | undefined {
    return inferEmergencyType(alert.title, alert.description);
  }

  public isTest(alert: CodeMaroonAlert): boolean {
    return isMonthlyTest(alert.title, alert.description);
  }

  public procedureFor(alert: CodeMaroonAlert): string {
    return this.typeFor(alert)?.procedure ?? EMERGENCY_PROCEDURES_INDEX;
  }

  public extraOf(alert: CodeMaroonAlert): Array<{ name: string; value: string }> {
    return Object.entries(alert.extra ?? {}).map(([name, value]) => ({ name, value }));
  }

  /**
   * Dismissal is allowed for a test and for a sample, and not for a live alert.
   *
   * A real emergency notice is not something the map should let someone close and forget; that
   * decision belongs with Emergency Operations, and the alert clears itself when the feed does.
   */
  public canDismiss(state: CodeMaroonState, alert: CodeMaroonAlert): boolean {
    return state.sample || this.isTest(alert);
  }

  public dismiss(): void {
    this.dismissed = true;
  }
}
