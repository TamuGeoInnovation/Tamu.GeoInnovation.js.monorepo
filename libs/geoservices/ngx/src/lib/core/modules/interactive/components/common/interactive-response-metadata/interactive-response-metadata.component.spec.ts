import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveResponseMetadataComponent } from './interactive-response-metadata.component';

describe('InteractiveResponseMetadataComponent', () => {
  let component: InteractiveResponseMetadataComponent;
  let fixture: ComponentFixture<InteractiveResponseMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractiveResponseMetadataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveResponseMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
