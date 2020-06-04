import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightPlusModule } from 'ngx-highlightjs/plus/';

import { ImplementationsComponent } from './implementations.component';

describe('ImplementationsComponent', () => {
  let component: ImplementationsComponent;
  let fixture: ComponentFixture<ImplementationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HighlightPlusModule],
      declarations: [ImplementationsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImplementationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
