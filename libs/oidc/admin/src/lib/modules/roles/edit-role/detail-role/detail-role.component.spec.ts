import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailRoleComponent } from './detail-role.component';

describe('DetailRoleComponent', () => {
  let component: DetailRoleComponent;
  let fixture: ComponentFixture<DetailRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
