import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import {
  DlDateTimePickerDateModule,
  DlDateTimePickerModule,
  DlDateTimePickerChange
} from 'angular-bootstrap-datetimepicker';

import { DateTimePickerComponent } from './date-time-picker.component';

describe('DateTimePickerComponent', () => {
  let component: DateTimePickerComponent;
  let fixture: ComponentFixture<DateTimePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UILayoutModule, DlDateTimePickerDateModule, DlDateTimePickerModule],
      declarations: [DateTimePickerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set Value as new date', () => {
    const birthday = new Date('December 17, 1995 03:24:00');
    component.writeValue(birthday);
    expect(component.value).toStrictEqual(birthday);
  });
  it('should set Value as new date', () => {
    const birthday = new Date('December 17, 1995 03:24:00');
    component.registerOnChange(component.handleDlTimePickerChange(new DlDateTimePickerChange(birthday)));
    expect(component.value).toStrictEqual(birthday);
  });
  it('should set Value as new date', () => {
    const birthday = new Date('December 17, 1995 03:24:00');
    component.registerOnTouched(component.handleDlTimePickerChange(new DlDateTimePickerChange(birthday)));
    expect(component.value).toStrictEqual(birthday);
  });
});
