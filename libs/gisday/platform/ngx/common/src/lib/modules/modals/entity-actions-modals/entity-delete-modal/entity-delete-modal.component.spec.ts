import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDeleteModalComponent } from './entity-delete-modal.component';

describe('EntityDeleteModalComponent', () => {
  let component: EntityDeleteModalComponent;
  let fixture: ComponentFixture<EntityDeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityDeleteModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
