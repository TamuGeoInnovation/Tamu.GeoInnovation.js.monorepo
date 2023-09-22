import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversityListComponent } from './university-list.component';

describe('UniversityListComponent', () => {
  let component: UniversityListComponent;
  let fixture: ComponentFixture<UniversityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UniversityListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UniversityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
