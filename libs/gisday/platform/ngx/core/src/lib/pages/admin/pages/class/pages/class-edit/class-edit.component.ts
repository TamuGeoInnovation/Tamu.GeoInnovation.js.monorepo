import { Component, OnInit, inject, viewChild } from '@angular/core';
import { UserClass } from '@tamu-gisc/gisday/platform/data-api';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, of, switchMap, tap } from 'rxjs';

import { ClassService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { downloadFile, toCsv } from '@tamu-gisc/common/utils/ui';
import { ClassAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';
import { AsyncPipe, DatePipe } from '@angular/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-class-edit',
  templateUrl: './class-edit.component.html',
  styleUrls: ['./class-edit.component.scss'],
  imports: [ClassAddEditFormComponent, AsyncPipe, DatePipe],
  providers: [provideAdminDetailsPage(() => ClassEditComponent)]
})
export class ClassEditComponent extends BaseAdminDetailsPageComponent implements OnInit {
  private readonly at = inject(ActivatedRoute);
  private readonly cs = inject(ClassService);
  private readonly ns = inject(NotificationService);
  private readonly editor = viewChild(ClassAddEditFormComponent);

  public students$: Observable<Array<Partial<UserClass>>>;
  public isExporting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  protected override detailsForm() {
    return this.editor()?.form;
  }

  public ngOnInit(): void {
    this.students$ = this.cs.getClassStudents(this.at.snapshot.params.guid);
  }

  public exportCSV() {
    of(true)
      .pipe(
        tap(() => {
          this.isExporting$.next(true);
        }),
        switchMap(() => {
          return forkJoin([
            this.cs.getAttendanceCSV(this.at.snapshot.params.guid),
            this.cs.getEntity(this.at.snapshot.params.guid)
          ]);
        })
      )
      .subscribe({
        next: ([csv, cl]) => {
          // The header is the first row's keys, as Papa's own header was. An empty roster is an empty file.
          const rows = (csv as Array<Record<string, unknown>>) ?? [];
          const unparsed = toCsv(Object.keys(rows[0] ?? {}), rows);

          const fileName = `${cl.code}-${cl.number}${cl?.section ? '-' + cl?.section : ''}-${cl.professorName
            .toLowerCase()
            .split(' ')
            .join('_')}_gisday_attendance.csv`;
          downloadFile(unparsed, fileName, 'text/csv');

          this.isExporting$.next(false);

          this.ns.toast({
            id: 'export-csv',
            title: 'Attendance Exported',
            message: `Attendance export <strong>"${fileName}"</strong> download started.`
          });
        },
        error: () => {
          this.isExporting$.next(false);
          this.ns.toast({
            id: 'export-csv',
            title: 'Attendance Export Failed',
            message: 'Attendance could not be exported. Please try again later.'
          });
        }
      });
  }
}
