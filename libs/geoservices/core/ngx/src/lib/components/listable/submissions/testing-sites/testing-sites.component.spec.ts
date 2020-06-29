import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingSiteListComponent } from './testing-sites.component';

describe('TestingSiteListComponent', () => {
  let component: TestingSiteListComponent;
  let fixture: ComponentFixture<TestingSiteListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestingSiteListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingSiteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
