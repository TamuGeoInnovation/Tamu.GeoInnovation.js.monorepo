import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterLegalComponent } from './legal.component';

describe('FooterLegalComponent', () => {
  let component: FooterLegalComponent;
  let fixture: ComponentFixture<FooterLegalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterLegalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterLegalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
