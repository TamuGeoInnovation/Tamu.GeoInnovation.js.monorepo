import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorsDetailComponent } from './sponsors-detail.component';

describe('SponsorsDetailComponent', () => {
  let component: SponsorsDetailComponent;
  let fixture: ComponentFixture<SponsorsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SponsorsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
