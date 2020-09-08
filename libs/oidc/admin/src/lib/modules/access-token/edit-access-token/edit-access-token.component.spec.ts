import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccessTokenComponent } from './edit-access-token.component';

describe('EditAccessTokenComponent', () => {
  let component: EditAccessTokenComponent;
  let fixture: ComponentFixture<EditAccessTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAccessTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAccessTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
