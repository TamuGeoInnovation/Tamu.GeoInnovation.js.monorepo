import { Component, OnInit } from '@angular/core';
import { Class } from '@tamu-gisc/gisday/data-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-my-classes',
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss']
})
export class MyClassesComponent implements OnInit {
  public $classes: Observable<Array<Partial<Class>>>;
  constructor() {}

  ngOnInit(): void {}
}
