import { Component, OnInit } from '@angular/core';

import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Class } from '@tamu-gisc/gisday/data-api';
import { ClassService, UserClassesService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-my-classes',
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss']
})
export class MyClassesComponent implements OnInit {
  public $userClasses: Observable<Array<Partial<Class>>>;
  constructor(private readonly classService: ClassService, private readonly userService: UserClassesService) {
    this.fetchEntities();
  }

  public ngOnInit(): void {}

  public fetchEntities() {
    this.$userClasses = this.userService.getClassesAndUserClasses().pipe(shareReplay(1));
  }

  public setClassValue(_class: Class, event: boolean) {
    if (event === true) {
      this.userService.createEntity({
        class: _class
      });
    } else if (event === false) {
      this.userService.deleteEntityWithClassGuid(_class.guid);
    }
  }
}
