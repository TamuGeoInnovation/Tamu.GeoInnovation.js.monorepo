import {
  Component,
  Input,
  ViewChild,
  ContentChildren,
  ViewContainerRef,
  QueryList,
  AfterContentInit,
  TemplateRef,
  HostBinding
} from '@angular/core';

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
  public tabLayout: 'row' | 'column' = 'row';

  public toggleIndex = 0;

  public toggles: Array<AbstractContentReplacerToggleComponent>;

  @ContentChildren(AbstractContentReplacerToggleComponent)
  public contentList: QueryList<AbstractContentReplacerToggleComponent>;

  @ViewChild('content', { static: true, read: ViewContainerRef })
  private _contentView: ViewContainerRef;

  @HostBinding('class.row')
  private get _layoutRowBinding() {
    return this.tabLayout === 'row';
  }

  @HostBinding('class.column')
  private get _layoutColumnBinding() {
    return this.tabLayout === 'column';
  }

  public ngAfterContentInit() {
    this.toggles = this.contentList.map((t, i) => {
      return {
        index: i,
        label: t.label,
        template: t.template
      };
    });

    this.swapContent();
  }

  public swapContent(tab?: Toggle) {
    if (tab !== undefined) {
      // Only render tab if the selected tab index is different than the current.
      if (tab.index !== this.toggleIndex) {
        this.toggleIndex = tab.index;
        this.renderContent();
      }
    } else {
      // Default tab to render on initialization.
      this.renderContent();
    }
  }

  public renderContent() {
    this._contentView.clear();
    this._contentView.createEmbeddedView(this.toggles[this.toggleIndex].template);
  }
}

interface Toggle {
  index: number;
  label: string;
  template: TemplateRef<AbstractContentReplacerToggleComponent>;
}
