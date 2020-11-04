import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighschoolComponent } from './highschool.component';

describe('HighschoolComponent', () => {
  let component: HighschoolComponent;
  let fixture: ComponentFixture<HighschoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighschoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighschoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
