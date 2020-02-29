import {
  Component,
  ContentChildren,
  QueryList,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  AfterContentInit,
  Input,
  HostBinding
} from '@angular/core';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'tamu-gisc-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {
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

  /**
   * Describes the tab sizing scaling relationship.
   *
   * - Default: Will not apply a sizing scaling factor.
   * - Contain: Will space out tabs evenly
   *
   * Defaults to `default`.
   */
  @Input()
  public tabSizing: 'default' | 'contain' = 'default';

  /**
   * Describes the placement of tabs vs. content for either direction setting.
   *
   * - Forwards: For row directions, sets the tabs above the content. For column directions,
   * sets the tabs left of the content.
   * - Reverse:  For row directions, sets the tabs below the content. For column directions,
   * sets the tabs right of the content.
   *
   * Defaults to `forwards`.
   */
  @Input()
  public tabDirection: 'forwards' | 'reverse' = 'forwards';

  /**
   * Describes the layout direction the tab content.
   *
   * - Forwards: Displays as is marked up.
   * - Reverse: Reverses the display direction relative to how it was marked up.
   *
   * Defaults to `forwards`.
   */

  @Input()
  public contentDirection: 'forwards' | 'reverse' = 'forwards';

  @ViewChild('content', { static: true, read: ViewContainerRef })
  private _contentView: ViewContainerRef;

  @ContentChildren(TabComponent)
  private _tabList: QueryList<TabComponent>;

  @HostBinding('class')
  private get _classBindings() {
    return [this.tabLayout, this.tabDirection].join(' ');
  }

  @HostBinding('class.tab-sizing-contain')
  private get _tabSizingBinding() {
    return this.tabSizing === 'contain';
  }

  public tabIndex = 0;

  public tabs: Array<Tab>;

  public ngAfterContentInit() {
    this.tabs = this._tabList.map((t, i) => {
      return {
        index: i,
        label: t.label,
        template: t.template
      };
    });

    this.switchTab();
  }

  constructor() {}

  public switchTab(tab?: Tab) {
    if (tab !== undefined) {
      this.tabIndex = tab.index;
    }

    this._contentView.clear();
    this._contentView.createEmbeddedView(this.tabs[this.tabIndex].template);
  }
}

interface Tab {
  index: number;
  label: string;
  template: TemplateRef<TabComponent>;
}
