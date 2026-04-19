import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

jest.mock('@tamu-gisc/aggiemap/ngx/popups', () => ({
  BasePopupComponent: class BasePopupComponent {
    public data: unknown;
  }
}));

import { MarkdownPopupComponent } from './markdown-popup.component';

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

describe('MarkdownPopupComponent', () => {
  let component: MarkdownPopupComponent;
  let fixture: ComponentFixture<MarkdownPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkdownPopupComponent, MockMarkdownParsePipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownPopupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render optional additional content links from popup data', () => {
    component.data = {
      attributes: {
        name: 'Stop Name: Fish Pond',
        description: '[Route Number(s): 01, 04](https://example.com/should-not-render)',
        additionalContent: '[View on the bus route map](https://aggiespirit.ts.tamu.edu/RouteMap)'
      },
      layer: {
        title: 'Campus Stops'
      }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const links = Array.from(element.querySelectorAll('a'));

    expect(element.textContent).toContain('Stop Name: Fish Pond');
    expect(element.textContent).toContain('[Route Number(s): 01, 04](https://example.com/should-not-render)');
    expect(links).toHaveLength(1);
    expect(links[0]?.textContent?.trim()).toBe('View on the bus route map');
    expect(links[0]?.getAttribute('href')).toBe('https://aggiespirit.ts.tamu.edu/RouteMap');
  });
});
