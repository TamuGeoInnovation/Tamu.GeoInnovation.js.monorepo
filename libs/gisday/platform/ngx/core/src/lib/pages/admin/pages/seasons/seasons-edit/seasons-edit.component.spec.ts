import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonsEditComponent } from './seasons-edit.component';

describe('SeasonsEditComponent', () => {
  let component: SeasonsEditComponent;
  let fixture: ComponentFixture<SeasonsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeasonsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
