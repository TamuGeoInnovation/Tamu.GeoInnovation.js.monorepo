import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenterCardComponent } from './presenter-card.component';

describe('PresenterCardComponent', () => {
  let component: PresenterCardComponent;
  let fixture: ComponentFixture<PresenterCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresenterCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenterCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
