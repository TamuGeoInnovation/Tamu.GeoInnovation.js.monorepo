import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCheckinComponent } from './detail-checkin.component';

describe('DetailCheckinComponent', () => {
  let component: DetailCheckinComponent;
  let fixture: ComponentFixture<DetailCheckinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailCheckinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
