import { Component, Input, ContentChildren, QueryList, AfterContentInit, TemplateRef, HostBinding } from '@angular/core';

import { AbstractContentReplacerToggleComponent } from './abstracts/abstract-content-replacer-toggle/abstract-content-replacer-toggle.component';

@Component({
  selector: 'tamu-gisc-abstract-content-replacer',
  template: ''
})
export class AbstractContentReplacerComponent implements AfterContentInit {
  /**
   * Describes the tab orientation.
   *
   * Row: places the tabs along the x-axis.
   * Column: places the tabs along the y-axis.
   *
   * Defaults to `row`.
   */
  @Input()
  public toggleLayout: 'row' | 'column' = 'row';

  /**
   * Default starting toggle index.
   *
   * Defaults to `0`;
   */
  @Input()
  public toggleIndex = 0;

  /**
   * Normalized list of toggles derived from `toggleList`
   */
  public toggles: Array<Toggle>;

  /**
   * A series of elements that represent the interaction-able components responsible
   * for requesting a content render change.
   */
  @ContentChildren(AbstractContentReplacerToggleComponent)
  public toggleList: QueryList<AbstractContentReplacerToggleComponent>;

  @HostBinding('class.row')
  private get _layoutRowBinding() {
    return this.toggleLayout === 'row';
  }

  @HostBinding('class.column')
  private get _layoutColumnBinding() {
    return this.toggleLayout === 'column';
  }

  public ngAfterContentInit() {
    this.toggles = this.toggleList.map((t, i) => {
      return {
        index: i,
        label: t.label,
        template: t.template
      };
    });

    this.swapContent();
  }

  public swapContent(tab?: Toggle | number) {
    if (tab !== undefined) {
      if (typeof tab === 'number') {
        if (tab !== this.toggleIndex) {
          this.toggleIndex = tab;
        }
      } else {
        // Only render tab if the selected tab index is different than the current.
        if (tab.index !== this.toggleIndex) {
          this.toggleIndex = tab.index;
        }
      }
    }
  }
}

interface Toggle {
  index: number;
  label: string;
  template: TemplateRef<unknown>;
}
