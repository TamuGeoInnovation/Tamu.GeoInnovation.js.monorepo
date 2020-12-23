import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UESTamuBlockComponent } from './ues-tamu-block.component';

describe('UESTamuBlockComponent', () => {
  let component: UESTamuBlockComponent;
  let fixture: ComponentFixture<UESTamuBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UESTamuBlockComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UESTamuBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
