import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TiersListComponent } from './tiers-list.component';
import { TiersService } from '@tamu-gisc/geoservices/ngx/data-access';

describe('TiersListComponent', () => {
  let component: TiersListComponent;
  let fixture: ComponentFixture<TiersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [TiersListComponent],
      providers: [TiersService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
