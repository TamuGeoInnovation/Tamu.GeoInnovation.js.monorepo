import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractInteractiveServiceComponent } from './abstract-interactive-service.component';

describe('AbstractInteractiveServiceComponent', () => {
  let component: AbstractInteractiveServiceComponent;
  let fixture: ComponentFixture<AbstractInteractiveServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstractInteractiveServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractInteractiveServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
