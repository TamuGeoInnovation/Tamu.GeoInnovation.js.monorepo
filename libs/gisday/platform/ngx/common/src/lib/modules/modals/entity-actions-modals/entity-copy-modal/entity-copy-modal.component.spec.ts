import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityCopyModalComponent } from './entity-copy-modal.component';

describe('EntityCopyModalComponent', () => {
  let component: EntityCopyModalComponent;
  let fixture: ComponentFixture<EntityCopyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityCopyModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityCopyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
