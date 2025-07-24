import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TiersService } from '@tamu-gisc/geoservices/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { TierAddEditFormComponent } from './tier-add-edit-form.component';

describe('TierAddEditFormComponent', () => {
  let component: TierAddEditFormComponent;
  let fixture: ComponentFixture<TierAddEditFormComponent>;

  const mockTiersService = {
    getById: () => of({}),
    create: () => of({}),
    update: () => of({}),
    delete: () => of({})
  };

  const mockNotificationService = {
    toast: () => {
      /* mock implementation */
    }
  };

  const mockRouter = {
    navigate: () => Promise.resolve(true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TierAddEditFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TiersService, useValue: mockTiersService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TierAddEditFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values for create mode', () => {
    component.type = 'create';
    component.ngOnInit();

    expect(component.form.get('id')?.value).toBeNull();
    expect(component.form.get('tierId')?.value).toBeNull();
    expect(component.form.get('name')?.value).toBeNull();
    expect(component.form.get('description')?.value).toBeNull();
    expect(component.form.get('active')?.value).toBe(true);
  });

  it('should initialize form properly', () => {
    component.ngOnInit();
    expect(component.form).toBeDefined();
    expect(component.form.get('tierId')).toBeDefined();
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('description')).toBeDefined();
    expect(component.form.get('active')).toBeDefined();
  });
});
