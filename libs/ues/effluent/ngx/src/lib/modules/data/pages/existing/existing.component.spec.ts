import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingComponent } from './existing.component';

describe('ExistingComponent', () => {
  let component: ExistingComponent;
  let fixture: ComponentFixture<ExistingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExistingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
