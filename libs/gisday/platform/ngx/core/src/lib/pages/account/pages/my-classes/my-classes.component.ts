import { Component, OnInit } from '@angular/core';

import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Class, UserClass } from '@tamu-gisc/gisday/platform/data-api';
import { ClassService, UserClassesService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-my-classes',
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss']
})
export class MyClassesComponent implements OnInit {
  public classes$: Observable<Array<Partial<Class>>>;
  public userClasses$: Observable<Array<Partial<UserClass>>>;

  constructor(
    private readonly cs: ClassService,
    private readonly ucs: UserClassesService,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.classes$ = this.cs.getEntities().pipe(shareReplay());
    this.userClasses$ = this.ucs.getEntities().pipe(shareReplay());
  }

  public setClassValue(newState: boolean, classGuid: string) {
    if (newState === true) {
      this.ucs
        .createEntity({
          guid: classGuid
        })
        .subscribe({
          next: () => {
            this.ns.toast({
              title: 'Class registration',
              message: `You have been registered for this class.`,
              id: 'class-registration-success'
            });
          },
          error: () => {
            this.ns.toast({
              title: 'Class registration',
              message: 'There was an error registering you for this class.',
              id: 'class-registration-error'
            });
          }
        });
    } else if (newState === false) {
      this.ucs.deleteEntity(classGuid).subscribe({
        next: () => {
          this.ns.toast({
            title: 'Class registration',
            message: 'You have been unregistered from this class.',
            id: 'class-unregistration-success'
          });
        },
        error: () => {
          this.ns.toast({
            title: 'Class registration',
            message: 'There was an error unregistering you from this class.',
            id: 'class-unregistration-error'
          });
        }
      });
    }
  }

  public isUserClassSelected$(classGuid: string): Observable<boolean> {
    return this.userClasses$.pipe(
      map((userClasses) => {
        const found = userClasses.find((uc) => uc.class.guid === classGuid);

        return found !== undefined;
      }),
      shareReplay()
    );
  }
}
