import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { BusListHeaderComponent } from './bus-list-header.component';
import { AccordionService } from '@tamu-gisc/ui-kits/ngx/layout';

describe('BusListHeaderComponent (isolated)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [BusListHeaderComponent, AccordionService]
    }).compileComponents();
  }));

  it('should create', inject([BusListHeaderComponent], (component: BusListHeaderComponent) => {
    expect(component).toBeTruthy();
  }));
});
