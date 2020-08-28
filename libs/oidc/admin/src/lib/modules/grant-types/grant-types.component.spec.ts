import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantTypesComponent } from './grant-types.component';

describe('GrantTypesComponent', () => {
  let component: GrantTypesComponent;
  let fixture: ComponentFixture<GrantTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrantTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
