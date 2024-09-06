import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingBountyComponent } from './building-bounty.component';

describe('BuildingBountyComponent', () => {
  let component: BuildingBountyComponent;
  let fixture: ComponentFixture<BuildingBountyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuildingBountyComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildingBountyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
