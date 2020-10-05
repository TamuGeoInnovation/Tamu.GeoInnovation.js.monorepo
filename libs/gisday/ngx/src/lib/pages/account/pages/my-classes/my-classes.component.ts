import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Class } from '@tamu-gisc/gisday/data-api';
import { ClassService, UserClassesService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-my-classes',
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss']
})
export class MyClassesComponent implements OnInit {
  // public $classes: Observable<Array<Partial<Class>>>;
  public $userClasses: Observable<Array<Partial<Class>>>;
  constructor(private readonly classService: ClassService, private readonly userService: UserClassesService) {
    this.fetchEntities();
  }

  ngOnInit(): void {}

  public fetchEntities() {
    // this.$classes = this.classService.getEntities();
    this.$userClasses = this.userService.getClassesAndUserClasses();
    // this.userService.getClassesAndUserClasses().subscribe((results) => {
    //   return results;
    // });
  }

  public setClassValue(_class: Class, event: any) {
    if (event === true) {
      this.userService.createEntity({
        class: _class
      });
    } else if (event === false) {
      this.userService.deleteEntityWithClassGuid(_class.guid);
    }
  }
}
