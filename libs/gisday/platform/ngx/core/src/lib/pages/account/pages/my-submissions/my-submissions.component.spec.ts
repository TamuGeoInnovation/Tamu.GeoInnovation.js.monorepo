import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubmissionsComponent } from './my-submissions.component';

describe('MySubmissionsComponent', () => {
  let component: MySubmissionsComponent;
  let fixture: ComponentFixture<MySubmissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MySubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MySubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
