import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TamuBlockBrandingComponent } from './tamu-block.component';

describe('TamuBlockComponent', () => {
  let component: TamuBlockBrandingComponent;
  let fixture: ComponentFixture<TamuBlockBrandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
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

  it('should render a home link around the tamu block image', () => {
    const link = fixture.nativeElement.querySelector('a.brand-home-link');

    expect(link).toBeTruthy();
    expect(link.querySelector('img')).toBeTruthy();
  });
});
