import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorsMainComponent } from './sponsors-main.component';

describe('SponsorsMainComponent', () => {
  let component: SponsorsMainComponent;
  let fixture: ComponentFixture<SponsorsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SponsorsMainComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
