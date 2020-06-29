import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingSitesComponent } from './testing-sites.component';

describe('TestingSitesComponent', () => {
  let component: TestingSitesComponent;
  let fixture: ComponentFixture<TestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestingSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
