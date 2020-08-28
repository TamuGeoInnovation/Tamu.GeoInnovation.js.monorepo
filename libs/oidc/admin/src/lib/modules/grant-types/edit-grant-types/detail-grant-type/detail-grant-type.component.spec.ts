import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailGrantTypeComponent } from './detail-grant-type.component';

describe('DetailGrantTypeComponent', () => {
  let component: DetailGrantTypeComponent;
  let fixture: ComponentFixture<DetailGrantTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailGrantTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailGrantTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
