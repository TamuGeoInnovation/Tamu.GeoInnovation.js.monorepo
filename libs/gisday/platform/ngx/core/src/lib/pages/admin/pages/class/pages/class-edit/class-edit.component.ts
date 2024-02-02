import { Component, OnInit } from '@angular/core';
import { UserClass } from '@tamu-gisc/gisday/platform/data-api';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, of, switchMap, tap } from 'rxjs';

import * as Papa from 'papaparse';

import { ClassService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-class-edit',
  templateUrl: './class-edit.component.html',
  styleUrls: ['./class-edit.component.scss']
})
export class ClassEditComponent implements OnInit {
  public students$: Observable<Array<Partial<UserClass>>>;
  public isExporting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly at: ActivatedRoute,
    private readonly cs: ClassService,
    private readonly ns: NotificationService
  ) {}

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
          const unparsed = Papa.unparse(csv || 'No data', { header: true });

          const blob = new Blob([unparsed], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          const fileName = `${cl.code}-${cl.number}-${cl.professorName
            .toLowerCase()
            .split(' ')
            .join('_')}_gisday_attendance.csv`;
          a.setAttribute('hidden', '');
          a.setAttribute('href', url);
          a.setAttribute('download', fileName);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

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
