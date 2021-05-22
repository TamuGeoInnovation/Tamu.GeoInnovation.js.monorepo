import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TamuBlockBrandingComponent } from './tamu-block.component';

describe('TamuBlockComponent', () => {
  let component: TamuBlockBrandingComponent;
  let fixture: ComponentFixture<TamuBlockBrandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TamuBlockBrandingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TamuBlockBrandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
