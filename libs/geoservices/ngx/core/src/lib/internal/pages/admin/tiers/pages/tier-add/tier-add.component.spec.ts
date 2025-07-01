import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TierAddComponent } from './tier-add.component';

describe('TierAddComponent', () => {
  let component: TierAddComponent;
  let fixture: ComponentFixture<TierAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TierAddComponent],
      imports: [RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TierAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct selector', () => {
    expect(component).toBeDefined();
    expect(fixture.nativeElement.querySelector('.page-content')).toBeTruthy();
  });

  it('should display the correct page title', () => {
    const titleElement = fixture.nativeElement.querySelector('.page-header h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent.trim()).toBe('Add New Tier');
  });
});
