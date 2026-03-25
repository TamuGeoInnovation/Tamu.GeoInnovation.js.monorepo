import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2 } from 'angulartics2';
import { BehaviorSubject } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

jest.mock('@tamu-gisc/aggiemap/ngx/popups', () => ({
  BasePopupComponent: class BasePopupComponent {
    public data: unknown;
  },
  BaseDirectionsComponent: class BaseDirectionsComponent {
    public data!: __esri.Graphic;

    public ngOnInit(): void {
      return;
    }

    public startDirections(): void {
      return;
    }
  }
}));

jest.mock('angulartics2', () => ({
  Angulartics2: class Angulartics2 {}
}));

jest.mock('@tamu-gisc/maps/esri', () => ({
  EsriMapService: class EsriMapService {}
}));

jest.mock('@tamu-gisc/maps/feature/trip-planner', () => ({
  TripPlannerService: class TripPlannerService {}
}));

jest.mock('@tamu-gisc/ui-kits/ngx/search', () => ({
  SearchService: class SearchService {}
}));


import { MarkdownWDirectionsPopupComponent } from './markdown-w-directions-popup.component';

@Pipe({
  name: 'markdownParse'
})
class MockMarkdownParsePipe implements PipeTransform {
  public transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }
}

describe('MarkdownWDirectionsPopupComponent', () => {
  let component: MarkdownWDirectionsPopupComponent;
  let fixture: ComponentFixture<MarkdownWDirectionsPopupComponent>;
  const stops$ = new BehaviorSubject([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [MarkdownWDirectionsPopupComponent, MockMarkdownParsePipe],
      providers: [
        {
          provide: TripPlannerService,
          useValue: {
            Stops: stops$,
            setStops: jest.fn()
          }
        },
        {
          provide: Angulartics2,
          useValue: {
            eventTrack: {
              next: jest.fn()
            }
          }
        },
        {
          provide: EsriMapService,
          useValue: {
            clearHitTest: jest.fn()
          }
        },
        {
          provide: SearchService,
          useValue: {
            getSource: jest.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownWDirectionsPopupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render optional additional content links without affecting directions controls', () => {
    component.data = {
      attributes: {
        OBJECTID: 1,
        name: 'Stop Name: Trigon',
        description: '[Route Number(s): 08](https://example.com/should-not-render)',
        additionalContent: '[View on the bus route map](https://aggiespirit.ts.tamu.edu/RouteMap)'
      },
      layer: {
        title: 'Campus Stops'
      }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const links = Array.from(element.querySelectorAll('a'));
    const directionsButton = element.querySelector('.button');

    expect(element.textContent).toContain('Stop Name: Trigon');
    expect(element.textContent).toContain('[Route Number(s): 08](https://example.com/should-not-render)');
    expect(links).toHaveLength(1);
    expect(links[0]?.textContent?.trim()).toBe('View on the bus route map');
    expect(links[0]?.getAttribute('href')).toBe('https://aggiespirit.ts.tamu.edu/RouteMap');
    expect(directionsButton?.textContent?.trim()).toBe('Directions To Here');
  });
});
