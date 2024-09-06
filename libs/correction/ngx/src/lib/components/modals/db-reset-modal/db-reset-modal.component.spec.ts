import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbResetModalComponent } from './db-reset-modal.component';

describe('DbResetModalComponent', () => {
  let component: DbResetModalComponent;
  let fixture: ComponentFixture<DbResetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DbResetModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DbResetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
