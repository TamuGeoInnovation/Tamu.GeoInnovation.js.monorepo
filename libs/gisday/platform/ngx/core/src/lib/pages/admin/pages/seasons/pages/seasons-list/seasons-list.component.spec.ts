import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonsListComponent } from './seasons-list.component';

describe('SeasonsListComponent', () => {
  let component: SeasonsListComponent;
  let fixture: ComponentFixture<SeasonsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeasonsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
