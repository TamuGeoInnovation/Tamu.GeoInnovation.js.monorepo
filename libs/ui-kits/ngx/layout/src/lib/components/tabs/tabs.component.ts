import {
  Component,
  ContentChildren,
  QueryList,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  AfterContentInit
} from '@angular/core';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'tamu-gisc-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {
  @ViewChild('content', { static: true, read: ViewContainerRef })
  public contentView: ViewContainerRef;

  @ContentChildren(TabComponent)
  private _tabList: QueryList<TabComponent>;

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

    this.contentView.clear();
    this.contentView.createEmbeddedView(this.tabs[this.tabIndex].template);
  }
}

interface Tab {
  index: number;
  label: string;
  template: TemplateRef<TabComponent>;
}
