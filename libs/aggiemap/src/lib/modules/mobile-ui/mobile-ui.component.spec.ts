import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileUIComponent } from './mobile-ui.component';

describe('MobileUIComponent', () => {
  let component: MobileUIComponent;
  let fixture: ComponentFixture<MobileUIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileUIComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
