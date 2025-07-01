import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TierEditComponent } from './tier-edit.component';

describe('TierEditComponent', () => {
  let component: TierEditComponent;
  let fixture: ComponentFixture<TierEditComponent>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    mockActivatedRoute = {
      params: of({ id: '123' })
    };

    await TestBed.configureTestingModule({
      declarations: [TierEditComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }]
    }).compileComponents();

    fixture = TestBed.createComponent(TierEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract tier ID from route params', () => {
    component.ngOnInit();
    expect(component.tierId).toBe(123);
  });

  it('should display the correct page title', () => {
    const titleElement = fixture.nativeElement.querySelector('.page-header h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent.trim()).toBe('Edit Tier');
  });

  it('should handle route params without ID', () => {
    mockActivatedRoute.params = of({});
    component.ngOnInit();
    expect(component.tierId).toBeUndefined();
  });

  it('should handle invalid tier ID in route params', () => {
    mockActivatedRoute.params = of({ id: 'invalid' });
    component.ngOnInit();
    expect(component.tierId).toBeNaN();
  });
});
