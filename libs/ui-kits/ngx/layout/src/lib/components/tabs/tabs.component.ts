import { Component, ContentChildren, QueryList, AfterContentInit, Input, HostBinding } from '@angular/core';

import { AbstractContentReplacerComponent } from '../../abstracts/abstract-content-swap/abstract-content-replacer.component';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'tamu-gisc-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent extends AbstractContentReplacerComponent implements AfterContentInit {
  @ContentChildren(TabComponent)
  public toggleList: QueryList<TabComponent>;

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
   * Describes the ordering of tabs vs content.
   *
   * - Forward: For row directions, sets the tabs above the content. For column directions,
   * sets the tabs left of the content.
   * - Reverse:  For row directions, sets the tabs below the content. For column directions,
   * sets the tabs right of the content.
   *
   * Defaults to `forwards`.
   */
  @Input()
  public layoutDirection: 'forward' | 'reverse' = 'forward';

  /**
   * Describes the layout direction the tab content.
   *
   * - Forward: Displays as is marked up.
   * - Reverse: Reverses the display direction relative to how it was marked up.
   *
   * Defaults to `forward`.
   */

  @Input()
  public contentDirection = 'forward';

  @HostBinding('class.forward')
  private get _tabDirectionForwardBinding() {
    return this.layoutDirection === 'forward';
  }

  @HostBinding('class.reverse')
  private get _tabDirectionReverseBinding() {
    return this.layoutDirection === 'reverse';
  }

  @HostBinding('class.tab-sizing-contain')
  private get _tabSizingBinding() {
    return this.tabSizing === 'contain';
  }
}
