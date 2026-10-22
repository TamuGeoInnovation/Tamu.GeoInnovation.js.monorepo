import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { SiteCopyFile, SiteCopyKind, SiteCopyPlan } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SiteCopyService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ButtonComponent, FileComponent, SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';

/** How each kind of record reads in the plan. */
const KIND_NAMES: Record<SiteCopyKind, string> = {
  seasons: 'Season',
  seasonDays: 'Days',
  places: 'Organizations (map places)',
  placeLinks: 'Organization links',
  organizations: 'Affiliations',
  universities: 'Universities',
  eventLocations: 'Venues',
  eventBroadcasts: 'Broadcasts',
  tags: 'Tags',
  speakers: 'Speakers',
  events: 'Events',
  assets: 'Logos and photos'
};

/**
 * Copies a season from one GIS Day site to another (#2078): export a file here, import it on the other
 * site. An import always shows what it would add and update first, and writes only when applied.
 * Nothing is deleted, and people's contact details and accounts never move.
 */
@Component({
  selector: 'tamu-gisc-site-copy',
  templateUrl: './site-copy.component.html',
  imports: [AsyncPipe, SelectComponent, FileComponent, ButtonComponent]
})
export class SiteCopyComponent {
  private readonly copy = inject(SiteCopyService);

  public readonly seasons$ = inject(SeasonService).seasons$;
  public readonly kindNames = KIND_NAMES;

  public readonly exportSeason = signal<string | null>(null);

  /**
   * What is running, if anything, and what to tell the person while it does. A long import gave no sign it
   * had started, inviting a second click (#2090).
   */
  public readonly busy = signal<'export' | 'read' | 'apply' | null>(null);
  public readonly working = signal<string | null>(null);
  public readonly error = signal<string | null>(null);

  /** The file chosen to import, and what importing it would do or did. */
  public readonly file = signal<SiteCopyFile | null>(null);
  public readonly plan = signal<SiteCopyPlan | null>(null);

  public async download() {
    const season = this.exportSeason();

    if (!season) {
      return;
    }

    await this.run('export', 'Gathering the season and what its events bring…', async () => {
      const file = await firstValueFrom(this.copy.export(season));
      const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');

      link.href = url;
      link.download = `gisday-${file.year}-from-${new URL(file.source).hostname}.json`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  /** Reads the chosen file and shows what importing it would do, writing nothing. */
  public async choose(chosen: File) {
    this.plan.set(null);
    this.file.set(null);

    await this.run('read', 'Reading the file and comparing it with this site…', async () => {
      const file = JSON.parse(await chosen.text()) as SiteCopyFile;

      this.file.set(file);
      this.plan.set(await firstValueFrom(this.copy.import(file, false)));
    });
  }

  public async apply() {
    const file = this.file();

    if (!file) {
      return;
    }

    const plan = this.plan();
    const records = plan ? plan.kinds.reduce((sum, kind) => sum + kind.added.length + kind.updated.length, 0) : 0;
    const files = plan?.files.missing ?? 0;
    const message =
      `Writing ${records} records` +
      (files > 0 ? `, then copying ${files} logos and photos from ${file.source}` : '') +
      '. This can take a minute or two; leave this page open.';

    await this.run('apply', message, async () => this.plan.set(await firstValueFrom(this.copy.import(file, true))));
  }

  /** A time as the team reads it, in US Central. */
  public central(iso: string) {
    return (
      new Date(iso).toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        dateStyle: 'medium',
        timeStyle: 'short'
      }) + ' Central'
    );
  }

  /** Records to add or update, and logos and photos this site does not have yet. */
  public changes(plan: SiteCopyPlan) {
    return plan.kinds.reduce((sum, kind) => sum + kind.added.length + kind.updated.length, 0) + plan.files.missing;
  }

  private async run(action: 'export' | 'read' | 'apply', message: string, work: () => Promise<void>) {
    this.busy.set(action);
    this.working.set(message);
    this.error.set(null);

    try {
      await work();
    } catch (e) {
      this.error.set(e?.error?.message ?? e?.message ?? 'Something went wrong.');
    } finally {
      this.busy.set(null);
      this.working.set(null);
    }
  }
}
