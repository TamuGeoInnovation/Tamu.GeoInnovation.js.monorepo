import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoundABugComponent } from './found-a-bug.component';

describe('FoundABugComponent', () => {
  let component: FoundABugComponent;
  let fixture: ComponentFixture<FoundABugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoundABugComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoundABugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
