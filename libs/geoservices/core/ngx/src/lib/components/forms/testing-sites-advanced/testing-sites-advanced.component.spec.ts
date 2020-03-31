import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingSitesAdvancedComponent } from './testing-sites-advanced.component';

describe('TestingSitesAdvancedComponent', () => {
  let component: TestingSitesAdvancedComponent;
  let fixture: ComponentFixture<TestingSitesAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestingSitesAdvancedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingSitesAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
