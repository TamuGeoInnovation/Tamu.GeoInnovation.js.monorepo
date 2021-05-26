import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VgiComponent } from './vgi.component';

describe('VgiComponent', () => {
  let component: VgiComponent;
  let fixture: ComponentFixture<VgiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VgiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VgiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
