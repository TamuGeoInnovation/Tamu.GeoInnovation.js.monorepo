import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerListCategorizedComponent } from './layer-list-categorized.component';

describe('LayerListCategorizedComponent', () => {
  let component: LayerListCategorizedComponent;
  let fixture: ComponentFixture<LayerListCategorizedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerListCategorizedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerListCategorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
