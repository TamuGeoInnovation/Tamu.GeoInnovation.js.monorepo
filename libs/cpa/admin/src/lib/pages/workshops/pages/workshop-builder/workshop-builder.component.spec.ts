import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopBuilderComponent } from './workshop-builder.component';

describe('WorkshopBuilderComponent', () => {
  let component: WorkshopBuilderComponent;
  let fixture: ComponentFixture<WorkshopBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkshopBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
