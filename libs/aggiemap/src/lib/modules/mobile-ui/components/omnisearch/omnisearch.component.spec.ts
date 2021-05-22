import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OmnisearchComponent } from './omnisearch.component';

describe('OmnisearchComponent', () => {
  let component: OmnisearchComponent;
  let fixture: ComponentFixture<OmnisearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OmnisearchComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OmnisearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
